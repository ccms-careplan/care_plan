"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronUp, Sparkles, Wand2, RotateCcw, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import type { IndependenceLevel, ADLDomain } from "@/lib/types"

interface ADLDomainCardProps {
  title: string
  domain: ADLDomain | undefined
  onChange: (domain: ADLDomain) => void
  isRequired?: boolean
}

export function ADLDomainCard({ title, domain, onChange, isRequired }: ADLDomainCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGeneratingGrammar, setIsGeneratingGrammar] = useState(false)
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false)
  const [isGeneratingStages, setIsGeneratingStages] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showStages, setShowStages] = useState(false)
  const [paraphraseOptions, setParaphraseOptions] = useState<Array<{ text: string; tone: string; score: number }>>([])

  const currentDomain: ADLDomain = domain || {
    level: "Independent",
    strengths: "",
    caregiverInstructions: "",
    stages: { "1": "", "2": "", "3": "", "4": "", "5": "" },
  }

  const needsCaregiverActions = currentDomain.level === "Extensive Assistance" || currentDomain.level === "Dependent"
  const hasValidationError = needsCaregiverActions && !currentDomain.caregiverInstructions.trim()

  const handleLevelChange = (level: IndependenceLevel) => {
    onChange({ ...currentDomain, level })
  }

  const handleStrengthsChange = (value: string) => {
    onChange({ ...currentDomain, strengths: value })
  }

  const handleInstructionsChange = (value: string) => {
    onChange({ ...currentDomain, caregiverInstructions: value })
  }

  const handleStageChange = (stage: "1" | "2" | "3" | "4" | "5", value: string) => {
    onChange({
      ...currentDomain,
      stages: { ...currentDomain.stages, [stage]: value },
    })
  }

  const handleImproveGrammar = async () => {
    setIsGeneratingGrammar(true)
    // Simulate AI grammar improvement
    setTimeout(() => {
      const improved = currentDomain.caregiverInstructions
        .replace(/\bi\b/g, "I")
        .replace(/\bim\b/g, "I'm")
        .trim()
      onChange({ ...currentDomain, caregiverInstructions: improved })
      setIsGeneratingGrammar(false)
    }, 1000)
  }

  const handleGenerateOptions = async () => {
    setIsGeneratingOptions(true)
    // Simulate AI paraphrase generation
    setTimeout(() => {
      setParaphraseOptions([
        {
          text: "Provide full assistance with bathing, ensuring safety and dignity throughout the process.",
          tone: "Professional",
          score: 95,
        },
        {
          text: "Support resident with complete bathing care while honoring preferences and promoting comfort.",
          tone: "Compassionate",
          score: 92,
        },
        {
          text: "Assist with all aspects of bathing, maintaining a calm and respectful environment.",
          tone: "Clear & Simple",
          score: 88,
        },
      ])
      setShowOptions(true)
      setIsGeneratingOptions(false)
    }, 1500)
  }

  const handleGenerateStages = async () => {
    setIsGeneratingStages(true)
    // Simulate AI stage generation
    setTimeout(() => {
      onChange({
        ...currentDomain,
        stages: {
          "1": "Stage 1 (Early): Resident can bathe independently with adaptive equipment. Caregiver monitors for safety.",
          "2": "Stage 2: Resident needs verbal cues and standby assistance. Caregiver prepares supplies and provides reminders.",
          "3": "Stage 3 (Moderate): Resident requires hands-on assistance with hard-to-reach areas. Caregiver assists with washing back, feet, and hair.",
          "4": "Stage 4: Resident needs extensive physical help with most bathing tasks. Caregiver provides full support while encouraging participation.",
          "5": "Stage 5 (Advanced): Resident is fully dependent. Caregiver completes all bathing tasks with attention to comfort and dignity.",
        },
      })
      setShowStages(true)
      setIsGeneratingStages(false)
    }, 2000)
  }

  const handleSelectOption = (optionText: string) => {
    onChange({ ...currentDomain, caregiverInstructions: optionText })
    setShowOptions(false)
  }

  const hasStages = Object.values(currentDomain.stages).some((s) => s.trim())

  return (
    <Card className={hasValidationError ? "border-destructive" : ""}>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{title}</CardTitle>
            {isRequired && <Badge variant="secondary">Required</Badge>}
            {currentDomain.level !== "Independent" && currentDomain.caregiverInstructions && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            {hasValidationError && <AlertCircle className="h-5 w-5 text-destructive" />}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{currentDomain.level}</Badge>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {hasValidationError && (
            <Alert variant="destructive">
              <AlertDescription>
                Caregiver actions are required when independence level is Extensive Assistance or Dependent.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Independence Level</Label>
            <Select value={currentDomain.level} onValueChange={handleLevelChange}>
              <SelectTrigger>
                <SelectValue />
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
            <Label>Strengths & Preferences</Label>
            <Textarea
              value={currentDomain.strengths}
              onChange={(e) => handleStrengthsChange(e.target.value)}
              placeholder="What can the resident do? What are their preferences?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Caregiver Actions
                {needsCaregiverActions && <span className="text-destructive ml-1">*</span>}
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImproveGrammar}
                  disabled={!currentDomain.caregiverInstructions || isGeneratingGrammar}
                >
                  {isGeneratingGrammar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  <span className="ml-2">Improve Grammar</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateOptions}
                  disabled={!currentDomain.caregiverInstructions || isGeneratingOptions}
                >
                  {isGeneratingOptions ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Other Options</span>
                </Button>
              </div>
            </div>
            <Textarea
              value={currentDomain.caregiverInstructions}
              onChange={(e) => handleInstructionsChange(e.target.value)}
              placeholder="What assistance is needed? When? How? Include safety considerations..."
              rows={4}
              className={hasValidationError ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">Suggested by AI - based on assessment data. Edit as needed.</p>
          </div>

          {showOptions && paraphraseOptions.length > 0 && (
            <div className="space-y-3">
              <Label>Paraphrase Options</Label>
              {paraphraseOptions.map((option, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSelectOption(option.text)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {option.tone}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Fit: {option.score}%</span>
                        </div>
                        <p className="text-sm">{option.text}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        Use This
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base font-semibold">Stage Variations (1-5)</Label>
                <p className="text-sm text-muted-foreground mt-1">Progressive care stages for declining function</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateStages}
                disabled={isGeneratingStages || !currentDomain.caregiverInstructions}
              >
                {isGeneratingStages ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-2">Generate Stages</span>
              </Button>
            </div>

            {hasStages && showStages && (
              <Tabs defaultValue="1" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="1">Stage 1</TabsTrigger>
                  <TabsTrigger value="2">Stage 2</TabsTrigger>
                  <TabsTrigger value="3">Stage 3</TabsTrigger>
                  <TabsTrigger value="4">Stage 4</TabsTrigger>
                  <TabsTrigger value="5">Stage 5</TabsTrigger>
                </TabsList>
                {(["1", "2", "3", "4", "5"] as const).map((stage) => (
                  <TabsContent key={stage} value={stage} className="mt-4">
                    <div className="space-y-2">
                      <Label>Stage {stage} Instructions</Label>
                      <Textarea
                        value={currentDomain.stages[stage]}
                        onChange={(e) => handleStageChange(stage, e.target.value)}
                        placeholder={`Stage ${stage} care instructions...`}
                        rows={4}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
