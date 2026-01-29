"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { AppLayout } from "@/components/layout/app-layout"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Upload, FileText, Check, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAuthSession } from "@/lib/auth"

interface ExtractedField {
  field: string
  value: string
  confidence: number
  accepted: boolean | null
}

export default function UploadAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams?.get("patientId")
  const { user, token } = useAuth() 

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([])

  const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xHqJx9Kai9c8xGXQrBS8cAQBEtwpyIPW_9bjjd1bla4"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
  if (!file) {
    alert("Please select a file first.");
    return;
  }
  
  if (!patientId) {
    console.error("Missing patientId. URL is:", window.location.href);
    alert("Error: No Patient ID provided in the URL.");
    return;
  }

  setUploading(true)
  setProgress(0)

  const formData = new FormData()
  formData.append("company", "1") // adjust dynamically if needed
  formData.append("resident", patientId)
  formData.append("source_type", "pdf")
  formData.append("document_file", file)

  try {
    
    if (!token) throw new Error("Missing auth token")

    const response = await axios.post(
      "http://127.0.0.1:8000/api/assessments/",
      formData,
      {
        headers: { 
          "Authorization": `Bearer ${token}`,
          // "Content-Type": "multipart/form-data",
        },
        
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total ?? 0
          const percentCompleted =
            total > 0 ? Math.round((progressEvent.loaded * 100) / total) : 0
          setProgress(percentCompleted)
        },
      }
    )

    console.log("Assessment created:", response.data)
    pollAssessmentStatus(response.data.id)
  } catch (err) {
    console.error(err)
    alert("Failed to upload assessment")
  } finally {
    setUploading(false)
  }
}


  const pollAssessmentStatus = async (assessmentId: number) => {
    setExtracting(true)

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/assessments/${assessmentId}/`, {
          headers: {
            // "Authorization": `Bearer ${BEARER_TOKEN}`,
            "Authorization": `Bearer ${token}`,
          },
        })
        const assessment = res.data

        if (assessment.status === "ready" || assessment.status === "failed") {
          clearInterval(interval)
          setExtracting(false)
          setExtracted(true)

          if (assessment.status === "failed") {
            alert("Assessment processing failed. Please try again.")
            return
          }

          mapStructuredDataToFields(assessment.structured_data)
        }
      } catch (err) {
        console.error(err)
        clearInterval(interval)
        setExtracting(false)
        alert("Error polling assessment status")
      }
    }, 2000)
  }

  const mapStructuredDataToFields = (sd: any) => {
    if (!sd) return

    const fields: ExtractedField[] = []

    // Resident Profile
    if (sd.resident_profile) {
      fields.push({ field: "Patient Name", value: sd.resident_profile.name, confidence: 0.95, accepted: null })
      fields.push({ field: "Date of Birth", value: sd.resident_profile.dob, confidence: 0.95, accepted: null })
      fields.push({ field: "Assessment Date", value: sd.resident_profile.date_assessment, confidence: 0.92, accepted: null })
    }

    // ADL
    if (sd.adl) {
      Object.entries(sd.adl).forEach(([key, value]: any) => {
        fields.push({ field: key.charAt(0).toUpperCase() + key.slice(1), value: JSON.stringify(value), confidence: 0.85, accepted: null })
      })
    }

    // Mobility
    if (sd.mobility) {
      Object.entries(sd.mobility).forEach(([key, value]: any) => {
        fields.push({ field: `Mobility: ${key}`, value: JSON.stringify(value), confidence: 0.85, accepted: null })
      })
    }

    // Nutrition
    if (sd.nutrition) {
      Object.entries(sd.nutrition).forEach(([key, value]: any) => {
        fields.push({ field: `Nutrition: ${key}`, value: JSON.stringify(value), confidence: 0.85, accepted: null })
      })
    }

    // Mental Health
    if (sd.mental_health) {
      Object.entries(sd.mental_health).forEach(([key, value]: any) => {
        fields.push({ field: `Mental Health: ${key}`, value: JSON.stringify(value), confidence: 0.85, accepted: null })
      })
    }

    // Risks
    if (sd.risks) {
      fields.push({ field: "Risks", value: sd.risks.join(", "), confidence: 0.8, accepted: null })
    }

    // Recommended Care Focus
    if (sd.recommended_care_focus) {
      fields.push({ field: "Recommended Care Focus", value: sd.recommended_care_focus.join(", "), confidence: 0.8, accepted: null })
    }

    // Medical Notes
    if (sd.medical_notes) {
      fields.push({ field: "Medical Notes", value: sd.medical_notes, confidence: 0.8, accepted: null })
    }

    setExtractedFields(fields)
  }

  const handleAccept = (index: number) => {            
    const updated = [...extractedFields]
    updated[index].accepted = true   
    setExtractedFields(updated)                                     
  }

  const handleReject = (index: number) => {
    const updated = [...extractedFields]
    updated[index].accepted = false
    setExtractedFields(updated)
  }

  const handleEdit = (index: number, newValue: string) => {
    const updated = [...extractedFields]
    updated[index].value = newValue
    updated[index].accepted = true
    setExtractedFields(updated)
  }

  const handleSaveAssessment = () => {  
    const acceptedData = extractedFields.filter((f) => f.accepted)
    console.log("Saving assessment with data:", acceptedData)
    router.push(patientId ? `/residents/${patientId}` : "/assessments")
  }

  const allReviewed = extractedFields.every((f) => f.accepted !== null)
  const acceptedCount = extractedFields.filter((f) => f.accepted).length

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/assessments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessments 
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Upload Assessment</h1>
          <p className="text-muted-foreground mt-2">Upload PDF for AI extraction</p>
        </div>

        {!extracted && !extracting && (
          <Card>
            <CardHeader>
              <CardTitle>Select Assessment File</CardTitle>
              <CardDescription>
                Supported formats: PDF. AI will extract structured information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-primary hover:underline font-medium">Choose a file</span>
                  </Label>
                  {/* <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  /> */}
                  <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                  {file && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <Button onClick={handleUpload} disabled={!file || uploading} className="w-full" size="lg">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload and Extract
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {extracting && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Extracting Assessment Data</h3>
              <p className="text-muted-foreground">
                AI is analyzing the document and extracting structured information...
              </p>
            </CardContent>
          </Card>
        )}

        {extracted && (
          <div className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-900">
                AI extraction complete. Review each field below and accept, reject, or edit.
                {allReviewed && (
                  <span className="block mt-2 font-medium">
                    All fields reviewed: {acceptedCount} accepted, {extractedFields.length - acceptedCount} rejected
                  </span>
                )}
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Extracted Data</CardTitle>
                <CardDescription>Review and confirm each extracted field</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {extractedFields.map((field, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      field.accepted === true
                        ? "border-green-200 bg-green-50"
                        : field.accepted === false
                        ? "border-red-200 bg-red-50"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Label className="font-semibold">{field.field}</Label>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Confidence:</span>
                            <span
                              className={`text-xs font-medium ${
                                field.confidence >= 0.9
                                  ? "text-green-600"
                                  : field.confidence >= 0.8
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {(field.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        {field.accepted !== false ? (
                          <Input
                            value={field.value}
                            onChange={(e) => handleEdit(index, e.target.value)}
                            className="mt-2"
                          />
                        ) : (
                          <p className="text-muted-foreground line-through">{field.value}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {field.accepted !== true && (
                          <Button
                            size="sm"
                            variant={field.accepted === false ? "outline" : "default"}
                            onClick={() => handleAccept(index)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {field.accepted !== false && (
                          <Button
                            size="sm"
                            variant={field.accepted === true ? "outline" : "destructive"}
                            onClick={() => handleReject(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleSaveAssessment} disabled={!allReviewed} size="lg" className="flex-1">
                Save Assessment
              </Button>
              <Link href="/assessments">
                <Button variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}




// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { AppLayout } from "@/components/layout/app-layout"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Progress } from "@/components/ui/progress"
// import { ArrowLeft, Upload, FileText, Check, X, Loader2 } from "lucide-react"
// import Link from "next/link"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

// interface ExtractedField {
//   field: string
//   value: string
//   confidence: number
//   accepted: boolean | null
// }

// export default function UploadAssessmentPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const patientId = searchParams?.get("patientId")

//   const [file, setFile] = useState<File | null>(null)
//   const [uploading, setUploading] = useState(false)
//   const [extracting, setExtracting] = useState(false)
//   const [extracted, setExtracted] = useState(false)
//   const [progress, setProgress] = useState(0)
//   const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([])

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0])
//     }
//   }

//   const handleUpload = async () => {
//     if (!file) return

//     setUploading(true)
//     setProgress(0)

//     // Simulate upload progress
//     const progressInterval = setInterval(() => {
//       setProgress((prev) => {
//         if (prev >= 100) {
//           clearInterval(progressInterval)
//           return 100
//         }
//         return prev + 10
//       })
//     }, 200)

//     // Simulate upload
//     setTimeout(() => {
//       setUploading(false)
//       setExtracting(true)
//       simulateExtraction()
//     }, 2500)
//   }

//   const simulateExtraction = () => {
//     // Simulate AI extraction with mock data
//     setTimeout(() => {
//       setExtractedFields([
//         { field: "Patient Name", value: "Dorothy Martinez", confidence: 0.98, accepted: null },
//         { field: "Date of Birth", value: "1945-03-15", confidence: 0.95, accepted: null },
//         { field: "Assessment Date", value: "2025-01-15", confidence: 0.92, accepted: null },
//         { field: "Case Manager", value: "Sarah Johnson", confidence: 0.88, accepted: null },
//         { field: "Primary Diagnosis", value: "Dementia - Alzheimer's Type", confidence: 0.94, accepted: null },
//         { field: "Bathing Level", value: "Extensive Assistance", confidence: 0.85, accepted: null },
//         { field: "Medication: Donepezil", value: "10mg daily, oral", confidence: 0.91, accepted: null },
//         { field: "Allergy: Penicillin", value: "Medication allergy - Rash", confidence: 0.76, accepted: null },
//       ])
//       setExtracting(false)
//       setExtracted(true)
//     }, 3000)
//   }

//   const handleAccept = (index: number) => {
//     const updated = [...extractedFields]
//     updated[index].accepted = true
//     setExtractedFields(updated)
//   }

//   const handleReject = (index: number) => {
//     const updated = [...extractedFields]
//     updated[index].accepted = false
//     setExtractedFields(updated)
//   }

//   const handleEdit = (index: number, newValue: string) => {
//     const updated = [...extractedFields]
//     updated[index].value = newValue
//     updated[index].accepted = true
//     setExtractedFields(updated)
//   }

//   const handleSaveAssessment = () => {
//     // Save to database
//     const acceptedData = extractedFields.filter((f) => f.accepted)
//     console.log("Saving assessment with data:", acceptedData)
//     router.push(patientId ? `/patients/${patientId}` : "/assessments")
//   }

//   const allReviewed = extractedFields.every((f) => f.accepted !== null)
//   const acceptedCount = extractedFields.filter((f) => f.accepted).length

//   return (
//     <AppLayout>
//       <div className="p-8 max-w-5xl mx-auto">
//         <div className="mb-6">
//           <Link href="/assessments">
//             <Button variant="ghost" size="sm">
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Back to Assessments
//             </Button>
//           </Link>
//         </div>

//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-foreground">Upload Assessment</h1>
//           <p className="text-muted-foreground mt-2">Upload PDF, DOC, or text file for AI extraction</p>
//         </div>

//         {!extracted && !extracting && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Select Assessment File</CardTitle>
//               <CardDescription>
//                 Supported formats: PDF, DOC, DOCX, TXT. AI will extract all relevant information.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
//                 <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                 <div className="space-y-2">
//                   <Label htmlFor="file-upload" className="cursor-pointer">
//                     <span className="text-primary hover:underline font-medium">Choose a file</span>
//                     <span className="text-muted-foreground"> or drag and drop</span>
//                   </Label>
//                   <Input
//                     id="file-upload"
//                     type="file"
//                     accept=".pdf,.doc,.docx,.txt"
//                     onChange={handleFileChange}
//                     className="hidden"
//                   />
//                   {file && (
//                     <div className="mt-4 flex items-center justify-center gap-2">
//                       <FileText className="h-5 w-5 text-primary" />
//                       <span className="font-medium">{file.name}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {uploading && (
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span>Uploading...</span>
//                     <span>{progress}%</span>
//                   </div>
//                   <Progress value={progress} />
//                 </div>
//               )}

//               <Button onClick={handleUpload} disabled={!file || uploading} className="w-full" size="lg">
//                 {uploading ? (
//                   <>
//                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                     Uploading...
//                   </>
//                 ) : (
//                   <>
//                     <Upload className="mr-2 h-5 w-5" />
//                     Upload and Extract
//                   </>
//                 )}
//               </Button>
//             </CardContent>
//           </Card>
//         )}

//         {extracting && (
//           <Card>
//             <CardContent className="py-12 text-center">
//               <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
//               <h3 className="text-lg font-semibold mb-2">Extracting Assessment Data</h3>
//               <p className="text-muted-foreground">
//                 AI is analyzing the document and extracting structured information...
//               </p>
//             </CardContent>
//           </Card>
//         )}

//         {extracted && (
//           <div className="space-y-6">
//             <Alert className="bg-blue-50 border-blue-200">
//               <AlertDescription className="text-blue-900">
//                 AI extraction complete. Review each field below and accept, reject, or edit the extracted values.
//                 {allReviewed && (
//                   <span className="block mt-2 font-medium">
//                     All fields reviewed: {acceptedCount} accepted, {extractedFields.length - acceptedCount} rejected
//                   </span>
//                 )}
//               </AlertDescription>
//             </Alert>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Extracted Data</CardTitle>
//                 <CardDescription>Review and confirm each extracted field</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {extractedFields.map((field, index) => (
//                   <div
//                     key={index}
//                     className={`p-4 rounded-lg border-2 ${
//                       field.accepted === true
//                         ? "border-green-200 bg-green-50"
//                         : field.accepted === false
//                           ? "border-red-200 bg-red-50"
//                           : "border-border"
//                     }`}
//                   >
//                     <div className="flex items-start justify-between mb-2">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-1">
//                           <Label className="font-semibold">{field.field}</Label>
//                           <div className="flex items-center gap-1">
//                             <span className="text-xs text-muted-foreground">Confidence:</span>
//                             <span
//                               className={`text-xs font-medium ${
//                                 field.confidence >= 0.9
//                                   ? "text-green-600"
//                                   : field.confidence >= 0.8
//                                     ? "text-yellow-600"
//                                     : "text-red-600"
//                               }`}
//                             >
//                               {(field.confidence * 100).toFixed(0)}%
//                             </span>
//                           </div>
//                         </div>
//                         {field.accepted !== false ? (
//                           <Input
//                             value={field.value}
//                             onChange={(e) => handleEdit(index, e.target.value)}
//                             className="mt-2"
//                           />
//                         ) : (
//                           <p className="text-muted-foreground line-through">{field.value}</p>
//                         )}
//                       </div>
//                       <div className="flex gap-2 ml-4">
//                         {field.accepted !== true && (
//                           <Button
//                             size="sm"
//                             variant={field.accepted === false ? "outline" : "default"}
//                             onClick={() => handleAccept(index)}
//                           >
//                             <Check className="h-4 w-4" />
//                           </Button>
//                         )}
//                         {field.accepted !== false && (
//                           <Button
//                             size="sm"
//                             variant={field.accepted === true ? "outline" : "destructive"}
//                             onClick={() => handleReject(index)}
//                           >
//                             <X className="h-4 w-4" />
//                           </Button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>

//             <div className="flex gap-4">
//               <Button onClick={handleSaveAssessment} disabled={!allReviewed} size="lg" className="flex-1">
//                 Save Assessment
//               </Button>
//               <Link href="/assessments">
//                 <Button variant="outline" size="lg">
//                   Cancel
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>
//     </AppLayout>
//   )
// }
