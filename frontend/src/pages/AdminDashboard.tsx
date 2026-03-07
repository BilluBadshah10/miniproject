import {
  User,
  Clock,
  Search
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

/* ---------------- TYPES ---------------- */

type DocumentType = {
  uploaded: boolean
  verified: boolean
  rejected?: boolean
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
  const navigate = useNavigate()

  /* ---------------- FETCH USERS ---------------- */

  const fetchUsers = async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/api/all-users",
        {
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
        }
      )

      const data = await res.json()

      setUsers(Array.isArray(data) ? data : [])

    } catch (error) {

      console.error("Fetch users error:",error)
      setUsers([])

    }
  }

  useEffect(()=>{
    fetchUsers()
  },[])

  /* ---------------- FILTER ---------------- */

  const filteredUsers = users.filter((u)=>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  /* ---------------- ANALYTICS ---------------- */

  const totalUsers = users.length

  const pendingDocs = users.reduce((acc,user)=>{

    const pending = Object.values(user.documents || {}).filter(
      (doc)=> doc.uploaded && !doc.verified && !doc.rejected
    ).length

    return acc + pending

  },0)

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

            <User className="h-6 w-6 text-primary"/>

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

            <Clock className="h-6 w-6 text-primary"/>

            <div>
              <p className="text-sm text-muted-foreground">
                Pending Documents
              </p>

              <p className="text-xl font-bold">
                {pendingDocs}
              </p>
            </div>

          </CardContent>
        </Card>

      </div>


      {/* SEARCH */}

      <div className="flex items-center gap-3 mb-6">

        <Search className="h-4 w-4 text-muted-foreground"/>

        <Input
          placeholder="Search user..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

      </div>


      {/* USERS TABLE */}

      <Card>

        <CardContent className="border-2 border-green-500 rounded-lg p-4">

          <table className="w-full text-sm">

            <thead>

              <tr className="border-b text-left">

                <th>User</th>
                <th>Email</th>
                <th>Total Docs</th>
                <th>Pending</th>
                <th className="text-right">Action</th>

              </tr>

            </thead>


            <tbody>

              {filteredUsers.map((user)=>{

                const totalDocs = Object.values(user.documents || {}).filter(
                  (doc)=>doc.uploaded
                ).length

                const pending = Object.values(user.documents || {}).filter(
                  (doc)=>doc.uploaded && !doc.verified && !doc.rejected
                ).length

                return(

                  <tr key={user._id} className="border-b">

                    <td className="py-3">
                      {user.full_name}
                    </td>

                    <td className="py-3">
                      {user.email}
                    </td>

                    <td className="py-3">
                      {totalDocs}
                    </td>

                    <td className="py-3">
                      {pending}
                    </td>

                    <td className="py-3 text-right">

                      <Button
                        size="sm"
                        onClick={()=>navigate(`/admin/user/${user._id}`)}
                      >
                        View Documents
                      </Button>

                    </td>

                  </tr>

                )

              })}

            </tbody>

          </table>

        </CardContent>

      </Card>

    </div>
  )
}

export default AdminDashboard
