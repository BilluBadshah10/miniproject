import {
  User,
  Clock,
  Search
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useEffect, useState } from "react"

/* ---------------- TYPES ---------------- */

type AIVerification = {
  confidence_score?: number
  status?: string
}

type DocumentType = {
  uploaded: boolean
  verified: boolean
  rejected?: boolean
  ai_verification?: AIVerification
}

type UserType = {
  _id: string
  full_name: string
  email: string
  documents: Record<string, DocumentType>
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserType[]>([])
  const [search, setSearch] = useState("")

  /* ---------------- FETCH USERS ---------------- */

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/all-users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (res.status === 401) {
        window.location.href = "/dashboard"
        return
      }

      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])

    } catch (error) {
      console.error("Failed to fetch users:", error)
      setUsers([])
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  /* ---------------- VERIFY ---------------- */

  const handleVerify = async (userId: string, docType: string) => {
    await fetch(
      `http://localhost:5000/api/verify-document/${docType}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ user_id: userId })
      }
    )

    fetchUsers()
  }

  /* ---------------- REJECT ---------------- */

  const handleReject = async (userId: string, docType: string) => {
    await fetch(
      `http://localhost:5000/api/reject-document/${docType}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ user_id: userId })
      }
    )

    fetchUsers()
  }

  /* ---------------- VIEW DOCUMENT ---------------- */

  const handleView = async (userId: string, docType: string) => {
    const res = await fetch(
      `http://localhost:5000/api/admin/view-document/${userId}/${docType}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )

    if (!res.ok) {
      alert("Failed to load document")
      return
    }

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    window.open(url, "_blank")
  }

  /* ---------------- FILTER ---------------- */

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  /* ---------------- ANALYTICS ---------------- */

  const totalUsers = users.length

  const pendingCount = users.reduce((acc, user) => {
    const pendingDocs = Object.values(user.documents || {}).filter(
      (doc) => doc.uploaded && !doc.verified && !doc.rejected
    ).length
    return acc + pendingDocs
  }, 0)

  /* ---------------- UI ---------------- */

  return (
    <div className="container mx-auto px-6 py-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          BharatID Admin Control Center
        </h1>
        <Badge className="bg-red-600 text-white">
          Admin Panel
        </Badge>
      </div>

      {/* ANALYTICS */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <User className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Total Users
              </p>
              <p className="text-xl font-bold">
                {totalUsers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Clock className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Pending Reviews
              </p>
              <p className="text-xl font-bold">
                {pendingCount}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>All Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th>User</th>
                <th>Email</th>
                <th>Document</th>
                <th>AI Score</th>
                <th>AI Status</th>
                <th>Final Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) =>
                Object.entries(user.documents || {}).map(
                  ([docType, doc]) =>
                    doc.uploaded && (
                      <tr key={user._id + docType} className="border-b">

                        <td className="py-3">{user.full_name}</td>
                        <td className="py-3">{user.email}</td>
                        <td className="py-3 capitalize">{docType}</td>

                        {/* AI SCORE */}
                        <td className="py-3">
                          {doc.ai_verification?.confidence_score ?? 0}%
                        </td>

                        {/* AI STATUS */}
                        <td className="py-3">
                          <Badge
                            className={
                              doc.ai_verification?.status === "auto_verified"
                                ? "bg-secondary text-secondary-foreground"
                                : "bg-primary text-primary-foreground"
                            }
                          >
                            {doc.ai_verification?.status ?? "manual_review"}
                          </Badge>
                        </td>

                        {/* FINAL STATUS */}
                        <td className="py-3">
                          <Badge
                            className={
                              doc.verified
                                ? "bg-secondary text-secondary-foreground"
                                : doc.rejected
                                ? "bg-red-600 text-white"
                                : "bg-primary text-primary-foreground"
                            }
                          >
                            {doc.verified
                              ? "Verified"
                              : doc.rejected
                              ? "Rejected"
                              : "Pending"}
                          </Badge>
                        </td>

                        {/* ACTIONS */}
                        <td className="py-3 text-right space-x-2">

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(user._id, docType)}
                          >
                            View
                          </Button>

                          {!doc.verified && !doc.rejected && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleVerify(user._id, docType)
                                }
                              >
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleReject(user._id, docType)
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}

                        </td>

                      </tr>
                    )
                )
              )}
            </tbody>

          </table>
        </CardContent>
      </Card>

    </div>
  )
}

export default AdminDashboard
