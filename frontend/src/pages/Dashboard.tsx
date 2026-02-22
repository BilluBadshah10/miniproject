import {
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  FileText,
  Lock
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import jwt_decode from "jwt-decode";
import { useEffect, useState } from "react";

/* ---------------- TYPES ---------------- */

type DocumentType = {
  uploaded: boolean;
  verified: boolean;
  path: string | null;
};

type DocumentsMap = Record<string, DocumentType>;

type DecodedToken = {
  user_id: string;
  role: string;
};

/* ---------------- STATUS CONFIG ---------------- */

const statusConfig = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    color: "bg-secondary text-secondary-foreground"
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-primary text-primary-foreground"
  },
  not_submitted: {
    label: "Not Submitted",
    icon: AlertCircle,
    color: "bg-muted text-muted-foreground"
  }
} as const;

const labelMap: Record<string, string> = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  passport: "Passport"
};

/* ---------------- COMPONENT ---------------- */

const Dashboard = () => {
  const [biometricStatus, setBiometricStatus] = useState("Loading...");
  const [documents, setDocuments] = useState<DocumentsMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("user");

  /* -------- DECODE ROLE -------- */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt_decode<DecodedToken>(token);
      setRole(decoded.role || "user");
    }
  }, []);

  /* -------- FETCH STATUS -------- */

  const fetchStatus = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/biometric-status",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBiometricStatus(data.biometric_status);
        setDocuments(data.documents);
      } else {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  /* -------- VIEW DOCUMENT -------- */

  const handleView = async (docType: string) => {
    const response = await fetch(
      `http://localhost:5000/api/view-document/${docType}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    if (!response.ok) {
      alert("Failed to load document");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  /* -------- UPLOAD DOCUMENT -------- */

  const handleUpload = (docType: string) => {
    const input = document.createElement("input");
    input.type = "file";

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      await fetch(
        `http://localhost:5000/api/upload-document/${docType}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: formData
        }
      );

      fetchStatus();
    };

    input.click();
  };

  /* -------- VERIFY DOCUMENT (ADMIN) -------- */

  @biometric_bp.route("/verify-document/<doc_type>", methods=["POST"])
def verify_document(doc_type):

    if doc_type not in ALLOWED_DOC_TYPES:
        return jsonify({"message": "Invalid document type"}), 400

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token missing"}), 401

    token = auth_header.split(" ")[1]
    payload = verify_token(token)

    if not payload or payload.get("role") != "admin":
        return jsonify({"message": "Admin access required"}), 403

    user_id = request.json.get("user_id")

    if not user_id:
        return jsonify({"message": "User ID required"}), 400

    db = get_db()

    result = db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                f"documents.{doc_type}.verified": True
            }
        }
    )

    if result.modified_count == 0:
        return jsonify({"message": "Verification failed"}), 400

    return jsonify({"message": f"{doc_type} verified successfully"}), 200

  /* -------- CALCULATIONS -------- */

  const totalDocs = documents ? Object.keys(documents).length : 0;
  const uploadedCount = documents
    ? Object.values(documents).filter((doc) => doc.uploaded).length
    : 0;

  const completionPercent =
    totalDocs > 0
      ? Math.round((uploadedCount / totalDocs) * 100)
      : 0;

  /* -------- LOADING -------- */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  /* -------- UI -------- */

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">
          BharatID Secure Dashboard
        </h1>

        {role === "admin" && (
          <Badge className="bg-red-600 text-white mt-2">
            Admin Panel
          </Badge>
        )}
      </div>

      {/* STATUS CARDS */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Shield className="h-6 w-6 text-secondary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Verification Status
              </p>
              <p className="text-lg font-bold text-green-600">
                {biometricStatus}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Documents Submitted
              </p>
              <p className="text-lg font-bold">
                {uploadedCount} of {totalDocs}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <User className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Profile Completion
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Progress value={completionPercent} className="h-2 w-24" />
                <span className="text-sm font-semibold">
                  {completionPercent}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DOCUMENT TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3">Document</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents &&
                Object.entries(documents).map(([key, doc]) => {
                  let status: keyof typeof statusConfig = "not_submitted";

                  if (doc.uploaded && doc.verified) status = "verified";
                  else if (doc.uploaded && !doc.verified) status = "pending";

                  const cfg = statusConfig[status];

                  return (
                    <tr key={key} className="border-b last:border-0">
                      <td className="py-4 font-medium">
                        {labelMap[key] || key}
                      </td>

                      <td className="py-4">
                        <Badge className={`gap-1 ${cfg.color}`}>
                          <cfg.icon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </td>

                      <td className="py-4 text-right space-x-2">
                        {!doc.uploaded ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpload(key)}
                          >
                            Upload
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleView(key)}
                            >
                              View
                            </Button>

                            {role === "admin" && !doc.verified && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleVerify(key)}
                              >
                                Verify
                              </Button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
