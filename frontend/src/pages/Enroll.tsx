import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import emblem from "@/assets/ashoka-emblem.png";

const Enroll = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    aadhaar: "",
    idType: "",
    password: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const { fullName, email, phone, aadhaar, idType, password } = form;

  if (!fullName || !email || !phone || !aadhaar || !idType || !password) {
    toast({
      title: "Validation Error",
      description: "Please complete all mandatory fields.",
      variant: "destructive"
    });
    return;
  }

  if (aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
  toast({
    title: "Invalid Aadhaar",
    description: "Aadhaar must be a valid 12-digit number.",
    variant: "destructive"
  });
  return;
}


const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!passwordRegex.test(password)) {
  toast({
    title: "Weak Password",
    description:
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    variant: "destructive"
  });
  return;
}


  if (!file) {
    toast({
      title: "Biometric Required",
      description: "Please upload your biometric identity proof.",
      variant: "destructive"
    });
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("idFile", file);

    const response = await fetch("http://localhost:5000/api/enroll", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      toast({
        title: "Enrollment Submitted",
        description: "Your identity is securely stored under AI-Quantum protection."
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Enrollment Failed",
        description: data.message || "Something went wrong.",
        variant: "destructive"
      });
    }

  } catch (error) {
    toast({
      title: "Server Error",
      description: "Unable to connect to secure enrollment server.",
      variant: "destructive"
    });
  }

  setLoading(false);
};


  return (
  <>
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg shadow-[var(--shadow-elevated)] animate-fade-up">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <img src={emblem} alt="Emblem" className="h-14 w-14 mx-auto opacity-70" />
            </div>
            <CardTitle className="text-2xl">National Biometric Enrollment</CardTitle>
		<CardDescription>
  			AI-based identity verification with quantum-resilient data protection.
		</CardDescription>

          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" placeholder="As per ID proof" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="name@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                  <Input id="aadhaar" placeholder="XXXX XXXX XXXX" maxLength={12} value={form.aadhaar} onChange={(e) => update("aadhaar", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ID Proof Type *</Label>
                <Select value={form.idType} onValueChange={(v) => update("idType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                    <SelectItem value="pan">PAN Card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="voter">Voter ID</SelectItem>
                    <SelectItem value="driving">Driving License</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idFile">Upload Biometric / Identity Document *</Label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="idFile"
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-accent flex-1"
                  >
                    <Upload className="h-4 w-4" />
                    {file ? file.name : "Choose file (PDF, JPG, PNG)"}
                  </label>
                  <input
                    id="idFile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Create Password *</Label>
                <Input id="password" type="password" placeholder="Min 8 chars, 1 Uppercase, 1 Lowercase, 1 Number, 1 Special" value={form.password} onChange={(e) => update("password", e.target.value)} />
              </div>

              <Button type="submit" className="w-full gap-2 shadow-[var(--shadow-saffron)] transition-all duration-200 hover:scale-[1.02]" disabled={loading}>
                {loading ? "Submitting..." : <><UserPlus className="h-4 w-4" /> Submit Enrollment</>}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
  Already enrolled?{" "}
  <Link
    to="/login"
    className="font-medium text-primary hover:underline transition-colors"
  >
    Sign In
  </Link>
</p>
<p className="mt-3 text-xs text-center text-muted-foreground opacity-80">
  Your biometric template is encrypted using AI-driven transformation and future-ready quantum-safe architecture.
</p>
          </CardContent>
        </Card>
      </div>
</>
  );
};

export default Enroll;
