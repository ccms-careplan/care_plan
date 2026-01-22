"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { Plus, Search, Upload, Calendar, User } from "lucide-react"

/* ---------------- TYPES ---------------- */

interface Assessment {
  id: number
  company: number
  resident: number
  source_type: string
  pdf_file: string | null
  structured_data: any | null
  status: "pending" | "ready" | "failed"
}

/* ---------------- PAGE ---------------- */

export default function AssessmentsPage() {
  const { token } = useAuth() // ✅ hook used at top level
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    if (!token) return

    const fetchAssessments = async () => {
      try {
        const res = await axios.get<Assessment[]>(
          "http://127.0.0.1:8000/api/assessments/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setAssessments(res.data)
      } catch (err) {
        console.error(err)
        setError("Failed to load assessments")
      } finally {
        setLoading(false)
      }
    }

    fetchAssessments()
  }, [token])

  /* ---------------- FILTER ---------------- */

  const filteredAssessments = assessments.filter(
    (a) =>
      a.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.source_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  /* ---------------- UI ---------------- */

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Assessments</h1>
            <p className="text-muted-foreground mt-2">
              Manage patient assessments
            </p>
          </div>

          <div className="flex gap-3">
            {/* <Link href="/assessments/upload">
              <Button variant="outline">
                <Upload className="mr-2 h-5 w-5" />
                Upload Assessment
              </Button>
            </Link>
            <Link href="/assessments/new">
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                Create Manually
              </Button>
            </Link> */}
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by status or source type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* States */}
        {loading && <p>Loading assessments...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No assessments found
              </h3>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <Link
                key={assessment.id}
                href={`/assessments/${assessment.id}`}
              >
                <Card className="hover:bg-accent transition cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            Assessment #{assessment.id}
                          </h3>
                          <Badge
                            variant={
                              assessment.status === "ready"
                                ? "default"
                                : assessment.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {assessment.status}
                          </Badge>
                        </div>

                        <div className="flex gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Source: {assessment.source_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Resident ID: {assessment.resident}</span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline">View</Button>
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
// import { Badge } from "@/components/ui/badge"
// import { useAuth } from "@/hooks/use-auth"
// import { mockAssessments } from "@/lib/mock-data"
// import { Plus, Search, Upload, Calendar, User } from "lucide-react"
// import Link from "next/link"

// export default function AssessmentsPage() {
//   const { user } = useAuth()
//   const [searchQuery, setSearchQuery] = useState("")

//   const filteredAssessments = mockAssessments.filter(
//     (a) => a.assessmentDate.includes(searchQuery) || a.status.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   return (
//     <AppLayout>
//       <div className="p-8 max-w-7xl mx-auto">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
//             <p className="text-muted-foreground mt-2">Manage patient assessments</p>
//           </div>
//           <div className="flex gap-3">
//             {/* <Link href="/assessments/upload">
//               <Button variant="outline" size="lg">
//                 <Upload className="mr-2 h-5 w-5" />
//                 Upload Assessment
//               </Button>
//             </Link>
//             <Link href="/assessments/new">
//               <Button size="lg">
//                 <Plus className="mr-2 h-5 w-5" />
//                 Create Manually
//               </Button>
//             </Link> */}
//           </div>
//         </div>

//         <Card className="mb-6">
//           <CardContent className="pt-6">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//               <Input
//                 placeholder="Search assessments by date or status..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {filteredAssessments.length === 0 ? (
//           <Card>
//             <CardContent className="py-12 text-center">
//               <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//               <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
//               <p className="text-muted-foreground mb-6">
//                 {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first assessment"}
//               </p>
//               {!searchQuery && (
//                 <div className="flex gap-3 justify-center">
//                   <Link href="/assessments/new">
//                     <Button>
//                       <Plus className="mr-2 h-5 w-5" />
//                       Create Manually
//                     </Button>
//                   </Link>
//                   <Link href="/assessments/upload">
//                     <Button variant="outline">
//                       <Upload className="mr-2 h-5 w-5" />
//                       Upload Assessment
//                     </Button>
//                   </Link>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             {filteredAssessments.map((assessment) => (
//               <Link key={assessment.id} href={`/assessments/${assessment.id}`}>
//                 <Card className="hover:bg-accent transition-colors cursor-pointer">
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-2">
//                           <h3 className="text-lg font-semibold">Assessment #{assessment.id}</h3>
//                           <Badge variant={assessment.status === "completed" ? "default" : "secondary"}>
//                             {assessment.status}
//                           </Badge>
//                         </div>
//                         <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="h-4 w-4" />
//                             <span>Date: {assessment.assessmentDate}</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <User className="h-4 w-4" />
//                             <span>Created by: {assessment.createdBy}</span>
//                           </div>
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
