"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, CheckCircle2, Sparkles } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams?.get("patientId")

  const [activeTab, setActiveTab] = useState("demographics")
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    // Demographics
    patientName: "",
    dob: "",
    assessmentDate: new Date().toISOString().split("T")[0],
    caseManager: "",
    address: "",
    phone: "",
    physician: "",
    pharmacy: "",
    preferredHospital: "",

    // Medical Condition
    currentCondition: "",
    sensory: "",
    neuroSpeech: "",
    respiratory: "",
    cardiovascular: "",
    oralEndocrineDiet: "",
    gastroIntestinal: "",
    urinary: "",
    skin: "",
    musculoskeletal: "",
    painComfort: "",

    // Medical History
    medicalHistory: "",
    surgicalHistory: "",
    currentDiagnoses: "",

    // Medications (simplified for demo)
    medications: "",

    // Behaviors
    knownBehaviors: "",
    cognitiveStatus: "",
    depressionHistory: "",
    depressionScreening: "",
    mentalIllnessHistory: "",
    dementiaPlacement: "",

    // Social/Emotional
    socialStrengths: "",
    physicalStrengths: "",
    emotionalNeeds: "",
    preferences: "",

    // Fall Risk
    fallRiskScore: "",
    fallRiskFactors: "",

    // ADL sections (bathing example)
    bathingLevel: "",
    bathingStrengths: "",
    bathingNeeds: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    setSaved(false)
    setTimeout(() => setSaved(true), 500)
  }

  const handleGenerateCarePlan = () => {
    // Convert assessment to care plan
    router.push(`/care-plans/new?fromAssessment=true&patientId=${patientId}`)
  }

  const completedSections = {
    demographics: formData.patientName && formData.dob && formData.assessmentDate,
    medical: formData.currentCondition || formData.currentDiagnoses,
    medications: formData.medications,
    behaviors: formData.knownBehaviors || formData.cognitiveStatus,
    social: formData.socialStrengths || formData.preferences,
    fallRisk: formData.fallRiskScore,
    adl: formData.bathingLevel,
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/assessments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessments
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manual Assessment Creator</h1>
            <p className="text-muted-foreground mt-2">Complete the assessment matching Washington State requirements</p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Auto-saved</span>
            </div>
          )}
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-900">
            This assessment matches the structure of Washington State Assessment Part A. All sections are optional but
            recommended for complete care planning.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="demographics" className="relative">
              Demographics
              {completedSections.demographics && <CheckCircle2 className="ml-2 h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="medical">
              Medical Condition
              {completedSections.medical && <CheckCircle2 className="ml-2 h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="medications">
              Medications
              {completedSections.medications && <CheckCircle2 className="ml-2 h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="behaviors">
              Behaviors & Cognitive
              {completedSections.behaviors && <CheckCircle2 className="ml-2 h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="social">
              Social & Emotional
              {completedSections.social && <CheckCircle2 className="ml-2 h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="fallRisk">
              Fall Risk
              {completedSections.fallRisk && <CheckCircle2 className="ml-2 h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="adl">
              ADL Functional Abilities
              {completedSections.adl && <CheckCircle2 className="ml-2 h-4 w-4 text-green-600" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demographics">
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>Basic patient and assessment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      value={formData.patientName}
                      onChange={(e) => handleChange("patientName", e.target.value)}
                      placeholder="Full legal name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleChange("dob", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assessmentDate">Assessment Date *</Label>
                    <Input
                      id="assessmentDate"
                      type="date"
                      value={formData.assessmentDate}
                      onChange={(e) => handleChange("assessmentDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caseManager">Case Manager</Label>
                    <Input
                      id="caseManager"
                      value={formData.caseManager}
                      onChange={(e) => handleChange("caseManager", e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Full address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(XXX) XXX-XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="physician">Physician</Label>
                    <Input
                      id="physician"
                      value={formData.physician}
                      onChange={(e) => handleChange("physician", e.target.value)}
                      placeholder="Dr. Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pharmacy">Pharmacy</Label>
                    <Input
                      id="pharmacy"
                      value={formData.pharmacy}
                      onChange={(e) => handleChange("pharmacy", e.target.value)}
                      placeholder="Pharmacy name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredHospital">Preferred Hospital</Label>
                    <Input
                      id="preferredHospital"
                      value={formData.preferredHospital}
                      onChange={(e) => handleChange("preferredHospital", e.target.value)}
                      placeholder="Hospital name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle>Current Medical Condition</CardTitle>
                <CardDescription>Comprehensive medical assessment by system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentCondition">Current Medical Condition</Label>
                  <Textarea
                    id="currentCondition"
                    value={formData.currentCondition}
                    onChange={(e) => handleChange("currentCondition", e.target.value)}
                    placeholder="Overall health status..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sensory">Sensory</Label>
                    <Textarea
                      id="sensory"
                      value={formData.sensory}
                      onChange={(e) => handleChange("sensory", e.target.value)}
                      placeholder="Vision, hearing assessment..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neuroSpeech">Neuro / Speech</Label>
                    <Textarea
                      id="neuroSpeech"
                      value={formData.neuroSpeech}
                      onChange={(e) => handleChange("neuroSpeech", e.target.value)}
                      placeholder="Neurological and speech status..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="respiratory">Respiratory</Label>
                    <Textarea
                      id="respiratory"
                      value={formData.respiratory}
                      onChange={(e) => handleChange("respiratory", e.target.value)}
                      placeholder="Breathing, oxygen needs..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardiovascular">Cardiovascular</Label>
                    <Textarea
                      id="cardiovascular"
                      value={formData.cardiovascular}
                      onChange={(e) => handleChange("cardiovascular", e.target.value)}
                      placeholder="Heart, circulation..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gastroIntestinal">Gastro / Intestinal</Label>
                    <Textarea
                      id="gastroIntestinal"
                      value={formData.gastroIntestinal}
                      onChange={(e) => handleChange("gastroIntestinal", e.target.value)}
                      placeholder="Digestion, bowel function..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urinary">Urinary</Label>
                    <Textarea
                      id="urinary"
                      value={formData.urinary}
                      onChange={(e) => handleChange("urinary", e.target.value)}
                      placeholder="Bladder function, continence..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skin">Skin</Label>
                    <Textarea
                      id="skin"
                      value={formData.skin}
                      onChange={(e) => handleChange("skin", e.target.value)}
                      placeholder="Skin condition, wounds..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="musculoskeletal">Musculoskeletal</Label>
                    <Textarea
                      id="musculoskeletal"
                      value={formData.musculoskeletal}
                      onChange={(e) => handleChange("musculoskeletal", e.target.value)}
                      placeholder="Mobility, strength, joints..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="painComfort">Pain / Comfort</Label>
                  <Textarea
                    id="painComfort"
                    value={formData.painComfort}
                    onChange={(e) => handleChange("painComfort", e.target.value)}
                    placeholder="Pain level, location, management..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentDiagnoses">Current Medical Diagnoses</Label>
                  <Textarea
                    id="currentDiagnoses"
                    value={formData.currentDiagnoses}
                    onChange={(e) => handleChange("currentDiagnoses", e.target.value)}
                    placeholder="List all current diagnoses..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory">Relevant Medical History</Label>
                    <Textarea
                      id="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={(e) => handleChange("medicalHistory", e.target.value)}
                      placeholder="Past medical conditions..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surgicalHistory">Surgical History</Label>
                    <Textarea
                      id="surgicalHistory"
                      value={formData.surgicalHistory}
                      onChange={(e) => handleChange("surgicalHistory", e.target.value)}
                      placeholder="Past surgeries..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Current Medication Regime</CardTitle>
                <CardDescription>All medications, dosages, and delegation requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    List each medication with dosage, frequency, route, and whether delegation is required.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="medications">Medications</Label>
                  <Textarea
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => handleChange("medications", e.target.value)}
                    placeholder="Example: Donepezil 10mg daily oral (RX, delegation required)&#10;Aspirin 81mg daily oral (OTC, self-admin)"
                    rows={10}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behaviors">
            <Card>
              <CardHeader>
                <CardTitle>Behaviors & Cognitive Status</CardTitle>
                <CardDescription>Mental health, behaviors, and cognitive evaluation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="knownBehaviors">Significant Known Behaviors or Symptoms</Label>
                  <Textarea
                    id="knownBehaviors"
                    value={formData.knownBehaviors}
                    onChange={(e) => handleChange("knownBehaviors", e.target.value)}
                    placeholder="Describe any challenging behaviors, triggers, interventions..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cognitiveStatus">Evaluation of Cognitive Status</Label>
                  <Textarea
                    id="cognitiveStatus"
                    value={formData.cognitiveStatus}
                    onChange={(e) => handleChange("cognitiveStatus", e.target.value)}
                    placeholder="Memory, orientation, decision-making capacity..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="depressionHistory">History of Depression and Anxiety</Label>
                    <Textarea
                      id="depressionHistory"
                      value={formData.depressionHistory}
                      onChange={(e) => handleChange("depressionHistory", e.target.value)}
                      placeholder="Past and current mood disorder history..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depressionScreening">Depression Screening</Label>
                    <Textarea
                      id="depressionScreening"
                      value={formData.depressionScreening}
                      onChange={(e) => handleChange("depressionScreening", e.target.value)}
                      placeholder="Screening results, PHQ-9 score..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mentalIllnessHistory">History of Mental Illness</Label>
                  <Textarea
                    id="mentalIllnessHistory"
                    value={formData.mentalIllnessHistory}
                    onChange={(e) => handleChange("mentalIllnessHistory", e.target.value)}
                    placeholder="Psychiatric diagnoses, hospitalizations..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dementiaPlacement">Dementia Specialty Placement Criteria</Label>
                  <Textarea
                    id="dementiaPlacement"
                    value={formData.dementiaPlacement}
                    onChange={(e) => handleChange("dementiaPlacement", e.target.value)}
                    placeholder="If applicable, dementia care needs assessment..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social, Physical, Emotional Strengths/Needs/Preferences</CardTitle>
                <CardDescription>Holistic person-centered assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="socialStrengths">Social Strengths</Label>
                  <Textarea
                    id="socialStrengths"
                    value={formData.socialStrengths}
                    onChange={(e) => handleChange("socialStrengths", e.target.value)}
                    placeholder="Social connections, interests, hobbies..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="physicalStrengths">Physical Strengths</Label>
                  <Textarea
                    id="physicalStrengths"
                    value={formData.physicalStrengths}
                    onChange={(e) => handleChange("physicalStrengths", e.target.value)}
                    placeholder="Abilities, mobility strengths..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emotionalNeeds">Emotional Needs</Label>
                  <Textarea
                    id="emotionalNeeds"
                    value={formData.emotionalNeeds}
                    onChange={(e) => handleChange("emotionalNeeds", e.target.value)}
                    placeholder="Emotional support needs, coping strategies..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferences">Preferences & Routines</Label>
                  <Textarea
                    id="preferences"
                    value={formData.preferences}
                    onChange={(e) => handleChange("preferences", e.target.value)}
                    placeholder="Daily routines, likes, dislikes, cultural considerations..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fallRisk">
            <Card>
              <CardHeader>
                <CardTitle>Fall Risk Assessment</CardTitle>
                <CardDescription>Evaluate fall risk and identify prevention strategies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fallRiskScore">Fall Risk Score</Label>
                  <Select
                    value={formData.fallRiskScore}
                    onValueChange={(value) => handleChange("fallRiskScore", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="moderate">Moderate Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fallRiskFactors">Fall Risk Factors & Prevention Plan</Label>
                  <Textarea
                    id="fallRiskFactors"
                    value={formData.fallRiskFactors}
                    onChange={(e) => handleChange("fallRiskFactors", e.target.value)}
                    placeholder="Identified risk factors: gait instability, medications, environmental hazards...&#10;&#10;Prevention strategies: assistive devices, supervision, environmental modifications..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adl">
            <Card>
              <CardHeader>
                <CardTitle>ADL Functional Abilities</CardTitle>
                <CardDescription>Activities of Daily Living assessment (simplified example - Bathing)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Complete assessment would include all ADL domains: Bathing, Dressing, Toileting, Eating, Mobility,
                    etc. This is a simplified example showing Bathing only.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="bathingLevel">Bathing - Independence Level</Label>
                  <Select value={formData.bathingLevel} onValueChange={(value) => handleChange("bathingLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Independent">Independent</SelectItem>
                      <SelectItem value="Supervision">Supervision</SelectItem>
                      <SelectItem value="Limited Assistance">Limited Assistance</SelectItem>
                      <SelectItem value="Extensive Assistance">Extensive Assistance</SelectItem>
                      <SelectItem value="Dependent">Dependent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathingStrengths">Bathing - Strengths & Preferences</Label>
                  <Textarea
                    id="bathingStrengths"
                    value={formData.bathingStrengths}
                    onChange={(e) => handleChange("bathingStrengths", e.target.value)}
                    placeholder="What can resident do independently? Preferences for bathing..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathingNeeds">Bathing - Caregiver Actions Needed</Label>
                  <Textarea
                    id="bathingNeeds"
                    value={formData.bathingNeeds}
                    onChange={(e) => handleChange("bathingNeeds", e.target.value)}
                    placeholder="What assistance is required? When? How? Safety considerations..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-8">
          <Button onClick={() => router.push("/assessments")} size="lg" className="flex-1">
            <Save className="mr-2 h-5 w-5" />
            Save Assessment
          </Button>
          <Button onClick={handleGenerateCarePlan} variant="outline" size="lg" className="flex-1 bg-transparent">
            <Sparkles className="mr-2 h-5 w-5" />
            Save & Generate Care Plan
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
