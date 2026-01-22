"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, CheckCircle2, Loader2 } from "lucide-react"
import { getAuthSession } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"

export default function NewPatientPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    roomNumber: "",
    medicalNotes: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    setSaved(false)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      //const session = getAuthSession()
      // if (!session?.token || !session?.user?.organizationId) {
      //   console.log(session?.user.organizationId)
      //   throw new Error("Missing auth session")
      // }
      
      if (!token || !user?.company_id) {
        console.log(user?.company_id)
        throw new Error("Missing auth session")
      }

      await axios.post(
        "http://127.0.0.1:8000/api/residents/",
        {
          company: user.company_id,
          full_name: formData.name,
          dob: formData.dateOfBirth,
          gender: "Male",
          room_number: formData.roomNumber,
          medical_notes: formData.medicalNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      setSaved(true)
      router.push("/patients")
    } catch (err: any) {
      console.error(err)
      setError("Failed to create patient")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/patients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patients
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">New Patient</h1>
            <p className="text-muted-foreground mt-2">Create a new patient profile</p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Saved successfully</span>
            </div>
          )}
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential patient details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input
                    placeholder="Room 12B"
                    value={formData.roomNumber}
                    onChange={(e) => handleChange("roomNumber", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                placeholder="Diabetes - requires monitoring"
                value={formData.medicalNotes}
                onChange={(e) => handleChange("medicalNotes", e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Patient
                </>
              )}
            </Button>

            <Link href="/patients">
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
















// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { AppLayout } from "@/components/layout/app-layout"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { ArrowLeft, Save, CheckCircle2 } from "lucide-react"
// import Link from "next/link"

// export default function NewPatientPage() {
//   const router = useRouter()
//   const [saved, setSaved] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     dateOfBirth: "",
//     preferredLanguage: "",
//     address: "",
//     phone: "",
//     email: "",
//     caseManager: "",
//     physician: "",
//     pharmacy: "",
//     preferredHospital: "",
//     powerOfAttorney: "",
//     advanceDirectives: "",
//   })

//   const handleChange = (field: string, value: string) => {
//     setFormData({ ...formData, [field]: value })
//     // Auto-save simulation
//     setSaved(false)
//     setTimeout(() => setSaved(true), 500)
//   }

//   const handleSubmit = () => {
//     // In production, save to database
//     console.log("Saving patient:", formData)
//     router.push("/patients")
//   }

//   return (
//     <AppLayout>
//       <div className="p-8 max-w-4xl mx-auto">
//         <div className="mb-6">
//           <Link href="/patients">
//             <Button variant="ghost" size="sm">
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Back to Patients
//             </Button>
//           </Link>
//         </div>

//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">New Patient</h1>
//             <p className="text-muted-foreground mt-2">Create a new patient profile</p>
//           </div>
//           {saved && (
//             <div className="flex items-center gap-2 text-sm text-green-600">
//               <CheckCircle2 className="h-4 w-4" />
//               <span>Auto-saved</span>
//             </div>
//           )}
//         </div>

//         <Alert className="mb-6 bg-blue-50 border-blue-200">
//           <AlertDescription className="text-blue-900">
//             All fields auto-save as you type. You can return anytime to continue editing.
//           </AlertDescription>
//         </Alert>

//         <div className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Basic Information</CardTitle>
//               <CardDescription>Essential patient details</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name">
//                   Full Name <span className="text-destructive">*</span>
//                 </Label>
//                 <Input
//                   id="name"
//                   placeholder="e.g., Dorothy Martinez"
//                   value={formData.name}
//                   onChange={(e) => handleChange("name", e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="dateOfBirth">
//                     Date of Birth <span className="text-destructive">*</span>
//                   </Label>
//                   <Input
//                     id="dateOfBirth"
//                     type="date"
//                     value={formData.dateOfBirth}
//                     onChange={(e) => handleChange("dateOfBirth", e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="preferredLanguage">Preferred Language</Label>
//                   <Input
//                     id="preferredLanguage"
//                     placeholder="e.g., English"
//                     value={formData.preferredLanguage}
//                     onChange={(e) => handleChange("preferredLanguage", e.target.value)}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Contact Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="address">Address</Label>
//                 <Textarea
//                   id="address"
//                   placeholder="e.g., 123 Maple Street, Seattle, WA 98101"
//                   value={formData.address}
//                   onChange={(e) => handleChange("address", e.target.value)}
//                   rows={2}
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="phone">Phone</Label>
//                   <Input
//                     id="phone"
//                     type="tel"
//                     placeholder="(206) 555-0123"
//                     value={formData.phone}
//                     onChange={(e) => handleChange("phone", e.target.value)}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="patient@example.com"
//                     value={formData.email}
//                     onChange={(e) => handleChange("email", e.target.value)}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Care Team</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="caseManager">Case Manager</Label>
//                   <Input
//                     id="caseManager"
//                     placeholder="e.g., Sarah Johnson"
//                     value={formData.caseManager}
//                     onChange={(e) => handleChange("caseManager", e.target.value)}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="physician">Physician</Label>
//                   <Input
//                     id="physician"
//                     placeholder="e.g., Dr. Robert Chen"
//                     value={formData.physician}
//                     onChange={(e) => handleChange("physician", e.target.value)}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="pharmacy">Pharmacy</Label>
//                   <Input
//                     id="pharmacy"
//                     placeholder="e.g., Seattle Care Pharmacy"
//                     value={formData.pharmacy}
//                     onChange={(e) => handleChange("pharmacy", e.target.value)}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="preferredHospital">Preferred Hospital</Label>
//                   <Input
//                     id="preferredHospital"
//                     placeholder="e.g., Swedish Medical Center"
//                     value={formData.preferredHospital}
//                     onChange={(e) => handleChange("preferredHospital", e.target.value)}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Legal & Advance Directives</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="powerOfAttorney">Power of Attorney</Label>
//                 <Input
//                   id="powerOfAttorney"
//                   placeholder="e.g., Michael Martinez (Son)"
//                   value={formData.powerOfAttorney}
//                   onChange={(e) => handleChange("powerOfAttorney", e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="advanceDirectives">Advance Directives</Label>
//                 <Textarea
//                   id="advanceDirectives"
//                   placeholder="e.g., DNR on file, POLST completed"
//                   value={formData.advanceDirectives}
//                   onChange={(e) => handleChange("advanceDirectives", e.target.value)}
//                   rows={3}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex gap-4">
//             <Button onClick={handleSubmit} size="lg" className="flex-1">
//               <Save className="mr-2 h-5 w-5" />
//               Save Patient
//             </Button>
//             <Link href="/patients">
//               <Button variant="outline" size="lg">
//                 Cancel
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </AppLayout>
//   )
// }
