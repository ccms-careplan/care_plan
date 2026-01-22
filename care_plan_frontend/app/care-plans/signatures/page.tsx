"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Download, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SignaturesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams?.get("patientId")

  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportError, setExportError] = useState("")

  const [signatures, setSignatures] = useState({
    provider: { name: "", date: "", signature: "" },
    resident: { name: "", date: "", signature: "" },
    caseManager: { name: "", date: "", signature: "" },
    healthProfessional: { name: "", date: "", signature: "" },
  })

  const handleChange = (role: string, field: string, value: string) => {
    setSignatures({
      ...signatures,
      [role]: { ...signatures[role as keyof typeof signatures], [field]: value },
    })
  }

  const handleExportPDF = async () => {
    setExporting(true)
    setExportError("")

    try {
      // Call PDF export API
      const response = await fetch("/api/care-plans/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carePlanId: "careplan-1",
          patientId: patientId,
          includeSignatures: true,
          signatures: signatures,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setExportSuccess(true)

        // In production, trigger download
        // For demo, show success message
        setTimeout(() => {
          // Create a simple HTML-to-PDF download simulation
          const blob = new Blob([data.html], { type: "text/html" })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `care-plan-${patientId}-${Date.now()}.html`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)

          // Redirect after download
          setTimeout(() => {
            router.push(`/patients/${patientId}`)
          }, 1500)
        }, 500)
      } else {
        setExportError(data.error || "Export failed")
      }
    } catch (error) {
      setExportError("Failed to export PDF. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  const allSigned =
    signatures.provider.name && signatures.provider.date && signatures.resident.name && signatures.resident.date

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/care-plans/review">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Review
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Review & Signatures</h1>
          <p className="text-muted-foreground mt-2">Collect signatures and export final care plan</p>
        </div>

        {exportError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{exportError}</AlertDescription>
          </Alert>
        )}

        {exportSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900 ml-2">
              PDF exported successfully! Download starting...
            </AlertDescription>
          </Alert>
        )}

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-900">
            At least provider and resident/representative signatures are required for export.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Signature *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-name">Name</Label>
                  <Input
                    id="provider-name"
                    value={signatures.provider.name}
                    onChange={(e) => handleChange("provider", "name", e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider-date">Date</Label>
                  <Input
                    id="provider-date"
                    type="date"
                    value={signatures.provider.date}
                    onChange={(e) => handleChange("provider", "date", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider-signature">Typed Signature</Label>
                <Input
                  id="provider-signature"
                  value={signatures.provider.signature}
                  onChange={(e) => handleChange("provider", "signature", e.target.value)}
                  placeholder="Type your full name"
                  className="font-serif text-lg italic"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resident / Representative Signature *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resident-name">Name</Label>
                  <Input
                    id="resident-name"
                    value={signatures.resident.name}
                    onChange={(e) => handleChange("resident", "name", e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resident-date">Date</Label>
                  <Input
                    id="resident-date"
                    type="date"
                    value={signatures.resident.date}
                    onChange={(e) => handleChange("resident", "date", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resident-signature">Typed Signature</Label>
                <Input
                  id="resident-signature"
                  value={signatures.resident.signature}
                  onChange={(e) => handleChange("resident", "signature", e.target.value)}
                  placeholder="Type your full name"
                  className="font-serif text-lg italic"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Case Manager Signature (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cm-name">Name</Label>
                  <Input
                    id="cm-name"
                    value={signatures.caseManager.name}
                    onChange={(e) => handleChange("caseManager", "name", e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cm-date">Date</Label>
                  <Input
                    id="cm-date"
                    type="date"
                    value={signatures.caseManager.date}
                    onChange={(e) => handleChange("caseManager", "date", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cm-signature">Typed Signature</Label>
                <Input
                  id="cm-signature"
                  value={signatures.caseManager.signature}
                  onChange={(e) => handleChange("caseManager", "signature", e.target.value)}
                  placeholder="Type your full name"
                  className="font-serif text-lg italic"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health Professional Signature (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hp-name">Name</Label>
                  <Input
                    id="hp-name"
                    value={signatures.healthProfessional.name}
                    onChange={(e) => handleChange("healthProfessional", "name", e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hp-date">Date</Label>
                  <Input
                    id="hp-date"
                    type="date"
                    value={signatures.healthProfessional.date}
                    onChange={(e) => handleChange("healthProfessional", "date", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hp-signature">Typed Signature</Label>
                <Input
                  id="hp-signature"
                  value={signatures.healthProfessional.signature}
                  onChange={(e) => handleChange("healthProfessional", "signature", e.target.value)}
                  placeholder="Type your full name"
                  className="font-serif text-lg italic"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mt-8">
          <Link href="/care-plans/review" className="flex-1">
            <Button variant="outline" size="lg" className="w-full bg-transparent" disabled={exporting}>
              Back to Review
            </Button>
          </Link>
          <Button size="lg" className="flex-1" onClick={handleExportPDF} disabled={!allSigned || exporting}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                {allSigned ? "Export Care Plan PDF" : "Complete Required Signatures"}
              </>
            )}
          </Button>
        </div>

        {allSigned && !exportSuccess && (
          <Alert className="mt-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900 ml-2">
              All required signatures collected. Ready to export.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AppLayout>
  )
}
