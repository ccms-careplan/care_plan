"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { getAuthSession } from "@/lib/auth"
import { Plus, Search, Calendar, Phone, User } from "lucide-react"
import { useRouter } from "next/navigation"

/* ---------------- Types ---------------- */

interface Resident {
  id: number
  full_name: string
  dob: string
  gender: string
  room_number: string
  medical_notes: string
  created_at: string
  company: number
}

/* ---------------- Page ---------------- */

export default function PatientsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [patients, setPatients] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const session = getAuthSession()
        if (!session?.token) {
          throw new Error("Missing auth token")
        }

        const res = await axios.get("http://127.0.0.1:8000/api/residents/", {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        })

        setPatients(res.data.results)
      } catch (err) {
        console.error(err)
        setError("Failed to load patients")
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const filteredPatients = patients.filter((p) =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.dob.includes(searchQuery)
  )

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patients</h1>
            <p className="text-muted-foreground mt-2">Manage your patient profiles</p>
          </div>
          <Link href="/patients/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Patient
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or date of birth..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-muted-foreground">Loading patients...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first patient"}
              </p>
              {!searchQuery && (
                <Link href="/patients/new">
                  <Button>
                    <Plus className="mr-2 h-5 w-5" />
                    Create Patient
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <Link key={patient.id} href={`/residents/${patient.id}`}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {patient.full_name}
                        </h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>DOB: {patient.dob}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Room: {patient.room_number}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" onClick={ () => router.push(`/residents/${patient.id}`)}>View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

















// "use client"

// import { useState } from "react"
// import { AppLayout } from "@/components/layout/app-layout"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent } from "@/components/ui/card"
// import { useAuth } from "@/hooks/use-auth"
// import { getPatientsByOrganization } from "@/lib/mock-data"
// import { Plus, Search, Calendar, Phone, User } from "lucide-react"
// import Link from "next/link"

// export default function PatientsPage() {
//   const { user } = useAuth()
//   const patients = user?.organizationId ? getPatientsByOrganization(user.organizationId) : []
//   const [searchQuery, setSearchQuery] = useState("")

//   const filteredPatients = patients.filter(
//     (p) =>
//       p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       p.dateOfBirth.includes(searchQuery) ||
//       p.phone?.includes(searchQuery),
//   )

//   return (
//     <AppLayout>
//       <div className="p-8 max-w-7xl mx-auto">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Patients</h1>
//             <p className="text-muted-foreground mt-2">Manage your patient profiles</p>
//           </div>
//           <Link href="/patients/new">
//             <Button size="lg">
//               <Plus className="mr-2 h-5 w-5" />
//               New Patient
//             </Button>
//           </Link>
//         </div>

//         <Card className="mb-6">
//           <CardContent className="pt-6">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//               <Input
//                 placeholder="Search patients by name, date of birth, or phone..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {filteredPatients.length === 0 ? (
//           <Card>
//             <CardContent className="py-12 text-center">
//               <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//               <h3 className="text-lg font-semibold mb-2">No patients found</h3>
//               <p className="text-muted-foreground mb-6">
//                 {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first patient"}
//               </p>
//               {!searchQuery && (
//                 <Link href="/patients/new">
//                   <Button>
//                     <Plus className="mr-2 h-5 w-5" />
//                     Create Patient
//                   </Button>
//                 </Link>
//               )}
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             {filteredPatients.map((patient) => (
//               <Link key={patient.id} href={`/patients/${patient.id}`}>
//                 <Card className="hover:bg-accent transition-colors cursor-pointer">
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div className="flex-1">
//                         <h3 className="text-lg font-semibold mb-2">{patient.name}</h3>
//                         <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="h-4 w-4" />
//                             <span>DOB: {patient.dateOfBirth}</span>
//                           </div>
//                           {patient.phone && (
//                             <div className="flex items-center gap-2">
//                               <Phone className="h-4 w-4" />
//                               <span>{patient.phone}</span>
//                             </div>
//                           )}
//                           {patient.caseManager && (
//                             <div className="flex items-center gap-2">
//                               <User className="h-4 w-4" />
//                               <span>Case Manager: {patient.caseManager}</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                       <Button variant="outline">View Details</Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </AppLayout>
//   )
// }
