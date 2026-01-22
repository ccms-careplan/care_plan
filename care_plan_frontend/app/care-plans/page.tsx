"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Calendar, User } from "lucide-react"
import Link from "next/link"
import { getAuthSession } from "@/lib/auth"

/* ---------------- Types ---------------- */
interface CarePlan {
  id: number
  generated_by: "ai" | "manual"
  created_at: string
  resident: number
}

/* ---------------- Page ---------------- */
export default function CarePlansPage() {
  const [carePlans, setCarePlans] = useState<CarePlan[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  /* -------- Fetch Care Plans -------- */
  useEffect(() => {
    async function fetchCarePlans() {
      try {
        const session = getAuthSession()
        if (!session?.token) return

        const res = await fetch("http://127.0.0.1:8000/api/careplans", {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        })
        console.log(session.token +"lets check")
        if (!res.ok) throw new Error("Unauthorized")

        const data = await res.json()
        setCarePlans(data)
      } catch (error) {
        console.error("Failed to fetch care plans", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCarePlans()
  }, [])

  /* -------- Search Filter -------- */
  const filteredPlans = carePlans.filter(
    (plan) =>
      plan.generated_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(plan.resident).includes(searchQuery),
  )

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Care Plans</h1>
            <p className="text-muted-foreground mt-2">
              Manage negotiated care plans
            </p>
          </div>
          <Link href="/care-plans/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Care Plan
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by resident or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Empty / Loading */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading care plans...</p>
        ) : filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No care plans found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first care plan"}
              </p>
              {!searchQuery && (
                <Link href="/care-plans/new">
                  <Button>
                    <Plus className="mr-2 h-5 w-5" />
                    Create Care Plan
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          /* List */
          <div className="space-y-4">
            {filteredPlans.map((plan) => (
              <Link key={plan.id} href={`/care-plans/${plan.id}`}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            Care Plan #{plan.id}
                          </h3>
                          <Badge variant="secondary">
                            {plan.generated_by.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Created:{" "}
                              {new Date(plan.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Resident ID: {plan.resident}</span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline">Edit Plan</Button>
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
// import { mockCarePlans } from "@/lib/mock-data"
// import { Plus, Search, Calendar, User } from "lucide-react"
// import Link from "next/link"

// export default function CarePlansPage() {
//   const [searchQuery, setSearchQuery] = useState("")

//   const filteredPlans = mockCarePlans.filter(
//     (cp) =>
//       cp.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       cp.patientId.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   return (
//     <AppLayout>
//       <div className="p-8 max-w-7xl mx-auto">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Care Plans</h1>
//             <p className="text-muted-foreground mt-2">Manage negotiated care plans</p>
//           </div>
//           <Link href="/care-plans/new">
//             <Button size="lg">
//               <Plus className="mr-2 h-5 w-5" />
//               New Care Plan
//             </Button>
//           </Link>
//         </div>

//         <Card className="mb-6">
//           <CardContent className="pt-6">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//               <Input
//                 placeholder="Search care plans by status or patient..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {filteredPlans.length === 0 ? (
//           <Card>
//             <CardContent className="py-12 text-center">
//               <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//               <h3 className="text-lg font-semibold mb-2">No care plans found</h3>
//               <p className="text-muted-foreground mb-6">
//                 {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first care plan"}
//               </p>
//               {!searchQuery && (
//                 <Link href="/care-plans/new">
//                   <Button>
//                     <Plus className="mr-2 h-5 w-5" />
//                     Create Care Plan
//                   </Button>
//                 </Link>
//               )}
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             {filteredPlans.map((plan) => (
//               <Link key={plan.id} href={`/care-plans/${plan.id}`}>
//                 <Card className="hover:bg-accent transition-colors cursor-pointer">
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-2">
//                           <h3 className="text-lg font-semibold">Care Plan #{plan.id}</h3>
//                           <Badge
//                             variant={
//                               plan.status === "exported"
//                                 ? "default"
//                                 : plan.status === "in-review"
//                                   ? "secondary"
//                                   : "outline"
//                             }
//                           >
//                             {plan.status}
//                           </Badge>
//                         </div>
//                         <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="h-4 w-4" />
//                             <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <User className="h-4 w-4" />
//                             <span>Patient ID: {plan.patientId}</span>
//                           </div>
//                         </div>
//                       </div>
//                       <Button variant="outline">Edit Plan</Button>
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
