"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, FileText } from "lucide-react"

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

export default function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { token } = useAuth()

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  /* ---------------- FETCH ASSESSMENT ---------------- */

  useEffect(() => {
    if (!token || !id) return

    const fetchAssessment = async () => {
      try {
        const res = await axios.get<Assessment>(
          `http://127.0.0.1:8000/api/assessments/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setAssessment(res.data)
      } catch (err) {
        console.error(err)
        setError("Failed to load assessment")
      } finally {
        setLoading(false)
      }
    }

    fetchAssessment()
  }, [id, token])

  /* ---------------- GENERATE CARE PLAN ---------------- */

  const handleGenerateCarePlan = async () => {
    if (!token || !assessment) return

    try {
      setGenerating(true)

      const res = await axios.post(
        "http://127.0.0.1:8000/api/careplans/generate-from-assessment/",
        {
          assessment_id: assessment.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      // Redirect to care plan detail page
      router.push(`/care-plans/${res.data.id}`)
    } catch (err) {
      console.error(err)
      alert("Failed to generate care plan")
    } finally {
      setGenerating(false)
    }
  }

  /* ---------------- UI STATES ---------------- */

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">Loading assessment...</div>
      </AppLayout>
    )
  }

  if (error || !assessment) {
    return (
      <AppLayout>
        <div className="p-8 text-red-500">
          {error ?? "Assessment not found"}
        </div>
      </AppLayout>
    )
  }

  /* ---------------- UI ---------------- */

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">

        {/* Top Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {assessment.status === "ready" && (
            <Button
              onClick={handleGenerateCarePlan}
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate Care Plan"}
            </Button>
          )}
        </div>

        {/* Header */}
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Assessment #{assessment.id}
              </h1>
              <p className="text-muted-foreground">
                Source: {assessment.source_type}
              </p>
            </div>

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
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardContent className="p-6 space-y-2 text-sm">
            <p>
              <strong>Resident ID:</strong> {assessment.resident}
            </p>
            <p>
              <strong>Company ID:</strong> {assessment.company}
            </p>

            {assessment.pdf_file && (
              <a
                href={assessment.pdf_file}
                target="_blank"
                className="inline-flex items-center gap-2 text-primary underline"
              >
                <FileText className="h-4 w-4" />
                View Uploaded PDF
              </a>
            )}
          </CardContent>
        </Card>

        {/* Structured Data */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Structured Assessment Data
            </h2>

            {assessment.structured_data ? (
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(assessment.structured_data, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">
                No structured data available yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}



















// "use client"

// import { useEffect, useState } from "react"
// import axios from "axios"
// import { useParams, useRouter } from "next/navigation"
// import { AppLayout } from "@/components/layout/app-layout"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { useAuth } from "@/hooks/use-auth"
// import { ArrowLeft, FileText } from "lucide-react"

// /* ---------------- TYPES ---------------- */

// interface Assessment {
//   id: number
//   company: number
//   resident: number
//   source_type: string
//   pdf_file: string | null
//   structured_data: any | null
//   status: "pending" | "ready" | "failed"
// }

// /* ---------------- PAGE ---------------- */

// export default function AssessmentDetailPage() {
//   const { id } = useParams<{ id: string }>()
//   const router = useRouter()
//   const { token } = useAuth()

//   const [assessment, setAssessment] = useState<Assessment | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   /* ---------------- FETCH ---------------- */

//   useEffect(() => {
//     if (!token || !id) return

//     const fetchAssessment = async () => {
//       try {
//         const res = await axios.get<Assessment>(
//           `http://127.0.0.1:8000/api/assessments/${id}/`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         )
//         setAssessment(res.data)
//       } catch (err) {
//         console.error(err)
//         setError("Failed to load assessment")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchAssessment()
//   }, [id, token])

//   /* ---------------- UI STATES ---------------- */

//   if (loading) {
//     return (
//       <AppLayout>
//         <div className="p-8">Loading assessment...</div>
//       </AppLayout>
//     )
//   }

//   if (error || !assessment) {
//     return (
//       <AppLayout>
//         <div className="p-8 text-red-500">{error ?? "Assessment not found"}</div>
//       </AppLayout>
//     )
//   }

//   /* ---------------- UI ---------------- */

//   return (
//     <AppLayout>
//       <div className="p-8 max-w-5xl mx-auto space-y-6">

//         <div className="flex items-center justify-between">
//         {/* Back */}
//         {/* <Button variant="ghost" onClick={() => router.back()}>
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back
//         </Button> */}

//         <Button variant="ghost" onClick={() => router.back()}>
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back
//         </Button>

//         {/* Generate Care Plan */}
//         {assessment.status === "ready" && (
//           <Button
//             onClick={() =>
//               router.push(`/care-plans/generate?assessment=${assessment.id}`)
//             }
//           >
//             Generate Care Plan
//           </Button>
//         )}

//         </div>

//         {/* Header */}
//         <Card>
//           <CardContent className="p-6 flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold">
//                 Assessment #{assessment.id}
//               </h1>
//               <p className="text-muted-foreground">
//                 Source: {assessment.source_type}
//               </p>
//             </div>

//             <Badge
//               variant={
//                 assessment.status === "ready"
//                   ? "default"
//                   : assessment.status === "failed"
//                   ? "destructive"
//                   : "secondary"
//               }
//             >
//               {assessment.status}
//             </Badge>
//           </CardContent>
//         </Card>

//         {/* Metadata */}
//         <Card>
//           <CardContent className="p-6 space-y-2 text-sm">
//             <p>
//               <strong>Resident ID:</strong> {assessment.resident}
//             </p>
//             <p>
//               <strong>Company ID:</strong> {assessment.company}
//             </p>

//             {assessment.pdf_file && (
//               <a
//                 href={assessment.pdf_file}
//                 target="_blank"
//                 className="inline-flex items-center gap-2 text-primary underline"
//               >
//                 <FileText className="h-4 w-4" />
//                 View Uploaded PDF
//               </a>
//             )}
//           </CardContent>
//         </Card>

//         {/* Structured Data */}
//         <Card>
//           <CardContent className="p-6">
//             <h2 className="text-lg font-semibold mb-4">
//               Structured Assessment Data
//             </h2>

//             {assessment.structured_data ? (
//               <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
//                 {JSON.stringify(assessment.structured_data, null, 2)}
//               </pre>
//             ) : (
//               <p className="text-muted-foreground">
//                 No structured data available yet.
//               </p>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </AppLayout>
//   )
// }
