import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

const AdminUserDocuments = () => {

  const { id } = useParams()

  const [user, setUser] = useState<UserType | null>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
const [previewOpen, setPreviewOpen] = useState(false)
const [previewType, setPreviewType] = useState<string>("")

  /* ---------------- FETCH USER ---------------- */

  const fetchUser = async () => {

    const res = await fetch(
      `http://localhost:5000/api/admin/user/${id}`,
      {
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      }
    )

    const data = await res.json()

    setUser(data)
  }

  useEffect(()=>{
    fetchUser()
  },[])


  /* ---------------- VERIFY ---------------- */

  const handleVerify = async (docType:string) => {

    await fetch(
      `http://localhost:5000/api/verify-document/${docType}`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${localStorage.getItem("token")}`
        },
        body:JSON.stringify({user_id:id})
      }
    )

    fetchUser()
  }


  /* ---------------- REJECT ---------------- */

  const handleReject = async (docType:string) => {

    await fetch(
      `http://localhost:5000/api/reject-document/${docType}`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${localStorage.getItem("token")}`
        },
        body:JSON.stringify({user_id:id})
      }
    )

    fetchUser()
  }


  /* ---------------- VIEW ---------------- */

  const handleView = async (docType: string) => {

  const res = await fetch(
    `http://localhost:5000/api/admin/view-document/${id}/${docType}`,
    {
      headers:{
        Authorization:`Bearer ${localStorage.getItem("token")}`
      }
    }
  )

  if (!res.ok) {
    alert("Failed to load document")
    return
  }

  const blob = await res.blob()

  const url = window.URL.createObjectURL(blob)

  setPreviewType(blob.type)   // 👈 important
  setPreviewUrl(url)
  setPreviewOpen(true)
}


  if(!user) return <p className="p-10">Loading...</p>


  return(

    <div className="container mx-auto px-6 py-10">

      <Card>

        <CardHeader>

          <CardTitle>

            {user.full_name} Documents

          </CardTitle>

        </CardHeader>

        <CardContent>

          <table className="w-full text-sm">

            <thead>

              <tr className="border-b text-left">

                <th>Document</th>
                <th>AI Score</th>
                <th>AI Status</th>
                <th>Final Status</th>
                <th className="text-right">Action</th>

              </tr>

            </thead>

            <tbody>

              {Object.entries(user.documents).map(
                ([docType,doc]) =>

                  doc.uploaded && (

                    <tr key={docType} className="border-b">

                      <td className="py-3 capitalize">
                        {docType}
                      </td>

                      <td className="py-3">
                        {doc.ai_verification?.confidence_score ?? 0}%
                      </td>

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

                      <td className="py-3 text-right space-x-2">

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={()=>handleView(docType)}
                        >
                          View
                        </Button>

                        {!doc.verified && !doc.rejected && (

                          <>
                            <Button
                              size="sm"
                              onClick={()=>handleVerify(docType)}
                            >
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={()=>handleReject(docType)}
                            >
                              Reject
                            </Button>
                          </>

                        )}

                      </td>

                    </tr>

                  )
              )}

            </tbody>

          </table>

        </CardContent>

      </Card>


      {/* ---------------- PREVIEW MODAL ---------------- */}

      {previewOpen && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white w-[80%] h-[80%] rounded-lg shadow-lg p-4 flex flex-col">

            <div className="flex justify-between mb-3">

              <h2 className="font-semibold text-lg">
                Document Preview
              </h2>

              <button
                className="text-red-600 font-bold"
                onClick={()=>setPreviewOpen(false)}
              >
                Close
              </button>

            </div>

            <div className="flex-1 flex items-center justify-center">

  {previewType === "application/pdf" ? (

    <iframe
      src={previewUrl ?? ""}
      className="w-full h-full"
    />

  ) : (

    <img
      src={previewUrl ?? ""}
      className="max-h-full max-w-full"
    />

  )}

</div>

          </div>

        </div>

      )}

    </div>
  )
}

export default AdminUserDocuments
