"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft, FileDown } from "lucide-react"
import { getAuthSession } from "@/lib/auth"

/* ---------------- Types ---------------- */

interface FunctionalSection {
  acuity_level: number
  caregiver_tasks: string[]
  goals: string
  special_diet?: string
  equipment?: string[]
}

interface CarePlanContent {
  resident_profile: {
    name: string
    dob: string
  }
  functional_abilities: {
    eating_and_diet?: FunctionalSection
    mobility?: FunctionalSection
    toileting?: FunctionalSection
  }
  risks: string[]
  recommended_focus: string[]
  generated_at: string
}

interface CarePlan {
  id: number
  content: CarePlanContent
  generated_by: "ai" | "manual"
  created_at: string
  resident: number
  assessment: number
}

/* ---------------- Page ---------------- */

export default function CarePlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [carePlan, setCarePlan] = useState<CarePlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCarePlan() {
      try {
        const session = getAuthSession()
        if (!session?.token) return

        const res = await fetch(
          `http://127.0.0.1:8000/api/careplans/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }
        )

        if (!res.ok) throw new Error("Failed to load care plan")

        const data = await res.json()
        setCarePlan(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchCarePlan()
  }, [id])

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">Loading care plan...</div>
      </AppLayout>
    )
  }

  if (!carePlan) {
    return (
      <AppLayout>
        <div className="p-8">Care plan not found.</div>
      </AppLayout>
    )
  }

  const { content } = carePlan

  /* ---------------- UI ---------------- */

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">

        {/* Top Actions */}
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {/* ${carePlan.id}/pdf */}
          <Button
            onClick={() => router.push(`/care-plans/${carePlan.id}/pdf`)}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Download Care Plan PDF
          </Button>
        </div>

        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Care Plan #{carePlan.id}</CardTitle>
              <Badge variant="secondary">
                {carePlan.generated_by.toUpperCase()}
              </Badge>
            </div>

            <div className="flex gap-6 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(carePlan.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {/* {content.resident_profile.name} */}
                {content?.resident_profile?.name ?? "null provided"}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Resident Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Resident Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {/* <p><strong>Name:</strong> {content!.resident_profile.name}</p>
            <p><strong>Date of Birth:</strong> {content.resident_profile.dob}</p> */}

            <p>
            <strong>Name:</strong>{" "}
            {content?.resident_profile?.name ?? "null provided"}
          </p>

          <p>
            <strong>Date of Birth:</strong>{" "}
            {content?.resident_profile?.dob ?? "null provided"}
          </p>
          </CardContent>
        </Card>

        {/* Functional Abilities */}
        {/* {Object.entries(content.functional_abilities).map(([key, section]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="capitalize">
                {key.replace(/_/g, " ")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><strong>Acuity Level:</strong> {section.acuity_level}</p>

              {section.special_diet && (
                <p><strong>Special Diet:</strong> {section.special_diet}</p>
              )}

              {section.equipment && (
                <p>
                  <strong>Equipment:</strong>{" "}
                  {section.equipment.join(", ")}
                </p>
              )}

              <div>
                <strong>Caregiver Tasks:</strong>
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  {section.caregiver_tasks.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              </div>

              <p><strong>Goals:</strong> {section.goals}</p>
            </CardContent>
          </Card>
        ))} */}

        {Object.entries(content?.functional_abilities ?? {}).map(
        ([key, section]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="capitalize">
                {key.replace(/_/g, " ")}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <p>
                <strong>Acuity Level:</strong>{" "}
                {section?.acuity_level ?? "null provided"}
              </p>

              <p>
                <strong>Special Diet:</strong>{" "}
                {section?.special_diet ?? "null provided"}
              </p>

              <p>
                <strong>Equipment:</strong>{" "}
                {section?.equipment?.length
                  ? section.equipment.join(", ")
                  : "null provided"}
              </p>

              <div>
                <strong>Caregiver Tasks:</strong>
                {section?.caregiver_tasks?.length ? (
                  <ul className="list-disc ml-6 mt-1 space-y-1">
                    {section.caregiver_tasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="ml-6 mt-1">null provided</p>
                )}
              </div>

              <p>
                <strong>Goals:</strong>{" "}
                {section?.goals ?? "null provided"}
              </p>
            </CardContent>
          </Card>
        )
      )}


        {/* Risks */}
        <Card>
          <CardHeader>
            <CardTitle>Identified Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-6 space-y-1">
              {/* {content.risks.map((risk, i) => (
                <li key={i}>{risk}</li>
              ))} */}

              {content?.risks?.length ? (
                content.risks.map((risk, i) => (
                  <li key={i}>{risk ?? "null provided"}</li>
                ))
              ) : (
                <li className="italic text-muted-foreground">null provided</li>
              )}

            </ul>
          </CardContent>
        </Card>

        {/* Recommended Care Focus */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Care Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-6 space-y-1">
              {/* {content.recommended_focus.map((item, i) => (
                <li key={i}>{item}</li>
              ))} */}

              {content?.recommended_focus?.length ? (
                content.recommended_focus.map((item, i) => (
                  <li key={i}>{item ?? "null provided"}</li>
                ))
              ) : (
                <li className="italic text-muted-foreground">null provided</li>
              )}

            </ul>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}














// "use client"

// import { useEffect, useState } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { AppLayout } from "@/components/layout/app-layout"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Calendar, User, ArrowLeft } from "lucide-react"
// import { getAuthSession } from "@/lib/auth"

// /* ---------------- Types ---------------- */
// interface Medication {
//   name: string
//   dosage: string
//   frequency: string
// }

// interface CarePlanContent {
//   diagnosis?: string
//   goals?: string[]
//   interventions?: string[]
//   medications?: Medication[]
// }

// interface CarePlan {
//   id: number
//   content: CarePlanContent
//   generated_by: "ai" | "manual"
//   created_at: string
//   resident: number
//   assessment: number
// }

// /* ---------------- Page ---------------- */
// export default function CarePlanDetailPage() {
//   const { id } = useParams()
//   const router = useRouter()

//   const [carePlan, setCarePlan] = useState<CarePlan | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     async function fetchCarePlan() {
//       try {
//         const session = getAuthSession()
//         if (!session?.token) return

//         const res = await fetch(
//           `http://127.0.0.1:8000/api/careplans/${id}/`,
//           {
//             headers: {
//               Authorization: `Bearer ${session.token}`,
//             },
//           }
//         )

//         if (!res.ok) throw new Error("Failed to load care plan")

//         const data = await res.json()
//         setCarePlan(data)
//       } catch (error) {
//         console.error(error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchCarePlan()
//   }, [id])

//   if (loading) {
//     return (
//       <AppLayout>
//         <div className="p-8">Loading care plan...</div>
//       </AppLayout>
//     )
//   }

//   if (!carePlan) {
//     return (
//       <AppLayout>
//         <div className="p-8">Care plan not found.</div>
//       </AppLayout>
//     )
//   }

//   return (
//     <AppLayout>
//       <div className="p-8 max-w-4xl mx-auto space-y-6">
//         {/* Back */}
//         <Button variant="ghost" onClick={() => router.back()}>
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back to Care Plans
//         </Button>

//         {/* Header */}
//         <Card>
//           <CardHeader>
//             <div className="flex justify-between items-center">
//               <CardTitle>Care Plan #{carePlan.id}</CardTitle>
//               <Badge variant="secondary">
//                 {carePlan.generated_by.toUpperCase()}
//               </Badge>
//             </div>
//             <div className="flex gap-6 text-sm text-muted-foreground mt-2">
//               <div className="flex items-center gap-2">
//                 <Calendar className="h-4 w-4" />
//                 {new Date(carePlan.created_at).toLocaleDateString()}
//               </div>
//               <div className="flex items-center gap-2">
//                 <User className="h-4 w-4" />
//                 Resident ID: {carePlan.resident}
//               </div>
//             </div>
//           </CardHeader>
//         </Card>

//         {/* Diagnosis */}
//         {carePlan.content.diagnosis && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Diagnosis</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {carePlan.content.diagnosis}
//             </CardContent>
//           </Card>
//         )}

//         {/* Goals */}
//         {carePlan.content.goals?.length && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Goals</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="list-disc ml-6 space-y-1">
//                 {carePlan.content.goals.map((goal, i) => (
//                   <li key={i}>{goal}</li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>
//         )}

//         {/* Interventions */}
//         {carePlan.content.interventions?.length && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Interventions</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="list-disc ml-6 space-y-1">
//                 {carePlan.content.interventions.map((item, i) => (
//                   <li key={i}>{item}</li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>
//         )}

//         {/* Medications */}
//         {carePlan.content.medications?.length && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Medications</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {carePlan.content.medications.map((med, i) => (
//                 <div
//                   key={i}
//                   className="border rounded-lg p-4 flex justify-between"
//                 >
//                   <div>
//                     <p className="font-semibold">{med.name}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {med.dosage} — {med.frequency}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </AppLayout>
//   )
// }
