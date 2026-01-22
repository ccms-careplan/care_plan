"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, Download, Edit, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ReviewCarePlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams?.get("patientId")

  const mockDomains = [
    {
      title: "Bathing & Personal Hygiene",
      level: "Extensive Assistance",
      complete: true,
      strengths: "Resident enjoys warm showers in the morning. Can wash face and hands with setup.",
      instructions:
        "Provide full assistance with bathing 3x weekly. Ensure water temperature is comfortable (resident prefers warm). Use gentle soap for sensitive skin. Assist with washing back, legs, and feet. Allow resident to wash face independently.",
    },
    {
      title: "Medication Management",
      level: "Dependent",
      complete: true,
      strengths: "Recognizes medication times and cooperates with administration.",
      instructions:
        "Administer all medications per physician orders. Donepezil 10mg daily at 8am with breakfast. Monitor for side effects. Delegation required for RX medications. Document administration in MAR.",
    },
    {
      title: "Safety & Emergency Procedures",
      level: "Supervision",
      complete: true,
      strengths: "Resident is aware of call bell and knows to ask for help.",
      instructions:
        "Monitor for fall risk. Ensure call bell is within reach. Check on resident every 2 hours. Have emergency contacts readily available. Know location of advance directives.",
    },
  ]

  const completionChecklist = [
    { item: "All required domains completed", complete: true },
    { item: "Caregiver actions specified where needed", complete: true },
    { item: "Strengths and preferences documented", complete: true },
    { item: "Stage variations generated (if applicable)", complete: false },
    { item: "Grammar and clarity reviewed", complete: true },
  ]

  const allComplete = completionChecklist.every((item) => item.complete)

  const handleExportPDF = () => {
    // Trigger PDF export
    router.push(`/care-plans/signatures?patientId=${patientId}`)
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/care-plans/new">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Editor
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Review Care Plan</h1>
            <p className="text-muted-foreground mt-2">Review before export or requesting signatures</p>
          </div>
        </div>

        <Alert className={`mb-6 ${allComplete ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
          <AlertDescription className={allComplete ? "text-green-900" : "text-yellow-900"}>
            {allComplete
              ? "Care plan is complete and ready for export."
              : "Some items need attention before export. See checklist below."}
          </AlertDescription>
        </Alert>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Completion Checklist</CardTitle>
            <CardDescription>Ensure all requirements are met</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {completionChecklist.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                {item.complete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                )}
                <span className={item.complete ? "text-foreground" : "text-muted-foreground"}>{item.item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Care Plan Summary</CardTitle>
            <CardDescription>Grouped by care domain</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {mockDomains.map((domain, index) => (
                <AccordionItem key={index} value={`domain-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{domain.title}</span>
                      <Badge variant="outline">{domain.level}</Badge>
                      {domain.complete && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Strengths & Preferences</p>
                        <p className="text-sm">{domain.strengths}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Caregiver Actions</p>
                        <p className="text-sm">{domain.instructions}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href="/care-plans/new" className="flex-1">
            <Button variant="outline" size="lg" className="w-full bg-transparent">
              <Edit className="mr-2 h-5 w-5" />
              Back to Edit
            </Button>
          </Link>
          <Button size="lg" className="flex-1" onClick={handleExportPDF} disabled={!allComplete}>
            <Download className="mr-2 h-5 w-5" />
            Continue to Signatures
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
