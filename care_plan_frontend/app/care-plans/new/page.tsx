"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react"
import Link from "next/link"
import { ADLDomainCard } from "@/components/care-plan/adl-domain-card"
import type { CarePlanDomains } from "@/lib/types"

const careDomains = [
  { key: "bathing", title: "Bathing & Personal Hygiene", required: true },
  { key: "dressing", title: "Dressing", required: true },
  { key: "toileting", title: "Toileting", required: true },
  { key: "eating", title: "Eating", required: true },
  { key: "mobility_ambulation", title: "Mobility & Ambulation", required: true },
  { key: "bed_mobility_transfers", title: "Bed Mobility & Transfers", required: false },
  { key: "speech_hearing", title: "Speech & Hearing", required: false },
  { key: "communication", title: "Communication", required: false },
  { key: "telephone_use", title: "Telephone Use", required: false },
  { key: "vision", title: "Vision", required: false },
  { key: "medication_management", title: "Medication Management", required: true },
  { key: "pain_management", title: "Pain Management", required: false },
  { key: "cognitive_memory", title: "Cognitive & Memory", required: false },
  { key: "behavior_social", title: "Behavior & Social Interaction", required: false },
  { key: "sleep_rest", title: "Sleep & Rest", required: false },
  { key: "activities_social_needs", title: "Activities & Social Needs", required: false },
  { key: "treatments_therapies", title: "Treatments & Therapies", required: false },
  { key: "safety_emergency", title: "Safety & Emergency Procedures", required: true },
]

export default function NewCarePlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams?.get("patientId")
  const fromAssessment = searchParams?.get("fromAssessment") === "true"

  const [currentStep, setCurrentStep] = useState(0)
  const [domains, setDomains] = useState<CarePlanDomains>({})
  const [saved, setSaved] = useState(false)

  const domainsPerStep = 6
  const totalSteps = Math.ceil(careDomains.length / domainsPerStep)
  const currentDomains = careDomains.slice(currentStep * domainsPerStep, (currentStep + 1) * domainsPerStep)

  const completedDomains = Object.keys(domains).filter((key) => {
    const domain = domains[key as keyof CarePlanDomains]
    return domain && domain.caregiverInstructions?.trim()
  }).length

  const progress = (completedDomains / careDomains.length) * 100

  const handleDomainChange = (key: string, domain: any) => {
    setDomains({ ...domains, [key]: domain })
    setSaved(false)
    setTimeout(() => setSaved(true), 500)
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSaveAndReview = () => {
    // Save care plan and go to review page
    router.push(`/care-plans/review?patientId=${patientId}`)
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/care-plans">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Care Plans
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Care Plan Builder</h1>
            <p className="text-muted-foreground mt-2">
              Step {currentStep + 1} of {totalSteps} - Complete all care domains
            </p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Auto-saved</span>
            </div>
          )}
        </div>

        {fromAssessment && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-900">
              AI has pre-filled care domains based on the assessment data. Review and adjust as needed.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedDomains} of {careDomains.length} domains completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4 mb-8">
          {currentDomains.map((domainConfig) => (
            <ADLDomainCard
              key={domainConfig.key}
              title={domainConfig.title}
              domain={domains[domainConfig.key as keyof CarePlanDomains]}
              onChange={(domain) => handleDomainChange(domainConfig.key, domain)}
              isRequired={domainConfig.required}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" size="lg" onClick={handlePrevious} disabled={currentStep === 0}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {currentStep === totalSteps - 1 ? (
            <Button size="lg" onClick={handleSaveAndReview}>
              <Save className="mr-2 h-5 w-5" />
              Save & Review
            </Button>
          ) : (
            <Button size="lg" onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>

        <Card className="mt-8 bg-muted">
          <CardHeader>
            <CardTitle className="text-base">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the AI tools in each domain card to improve grammar, generate alternative phrasings, or create
              progressive stage variations. All AI suggestions can be edited to match your resident's specific needs.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
