// Core data types for CareEase AI

export interface Patient {
  id: string
  name: string
  dateOfBirth: string
  preferredLanguage?: string
  address?: string
  phone?: string
  email?: string
  caseManager?: string
  physician?: string
  pharmacy?: string
  preferredHospital?: string
  powerOfAttorney?: string
  advanceDirectives?: string
  createdAt: string
  updatedAt: string
  organizationId: string
}

export interface Contact {
  id: string
  patientId: string
  name: string
  relationship: string
  role: string
  phone: string
  address?: string
  isPrimary: boolean
}

export interface Assessment {
  id: string
  patientId: string
  assessmentDate: string
  status: "draft" | "completed"
  createdBy: string
  createdAt: string
  updatedAt: string
  data: AssessmentData
}

export interface AssessmentData {
  demographics?: any
  medicalCondition?: any
  diagnoses?: string[]
  medications?: Medication[]
  allergies?: Allergy[]
  treatments?: Treatment[]
  behaviors?: Behavior[]
  adl?: ADLData
  notes?: string
}

export interface Medication {
  name: string
  dose: string
  frequency: string
  route: string
  rx: boolean
  selfAdmin: string
  notes?: string
  delegationRequired: string
}

export interface Allergy {
  substance: string
  type: string
  reaction: string
}

export interface Treatment {
  name: string
  frequency: string
  provider: string
  delegated: boolean
  notes?: string
}

export interface Behavior {
  name: string
  frequency: string
  location: string
  trigger: string
  intervention: string
}

export type IndependenceLevel =
  | "Independent"
  | "Supervision"
  | "Limited Assistance"
  | "Extensive Assistance"
  | "Dependent"

export interface ADLDomain {
  level: IndependenceLevel
  strengths: string
  caregiverInstructions: string
  stages: {
    "1": string
    "2": string
    "3": string
    "4": string
    "5": string
  }
}

export interface ADLData {
  bathing?: ADLDomain
  personal_hygiene?: ADLDomain
  dressing?: ADLDomain
  toileting?: ADLDomain
  eating?: ADLDomain
  mobility_ambulation?: ADLDomain
  bed_mobility_transfers?: ADLDomain
  speech_hearing?: ADLDomain
  communication?: ADLDomain
  telephone_use?: ADLDomain
  vision?: ADLDomain
  medication_management?: ADLDomain
  pain_management?: ADLDomain
  cognitive_memory?: ADLDomain
  behavior_social?: ADLDomain
  sleep_rest?: ADLDomain
  activities_social_needs?: ADLDomain
  treatments_therapies?: ADLDomain
  safety_emergency?: ADLDomain
}

export interface CarePlan {
  id: string
  patientId: string
  assessmentId?: string
  status: "draft" | "in-review" | "exported"
  createdBy: string
  createdAt: string
  updatedAt: string
  exportedAt?: string
  domains: CarePlanDomains
  signatures?: Signatures
}

export interface CarePlanDomains {
  bathing?: ADLDomain
  personal_hygiene?: ADLDomain
  dressing?: ADLDomain
  toileting?: ADLDomain
  eating?: ADLDomain
  mobility_ambulation?: ADLDomain
  bed_mobility_transfers?: ADLDomain
  speech_hearing?: ADLDomain
  communication?: ADLDomain
  telephone_use?: ADLDomain
  vision?: ADLDomain
  medication_management?: ADLDomain
  pain_management?: ADLDomain
  cognitive_memory?: ADLDomain
  behavior_social?: ADLDomain
  sleep_rest?: ADLDomain
  activities_social_needs?: ADLDomain
  treatments_therapies?: ADLDomain
  safety_emergency?: ADLDomain
}

export interface Signatures {
  provider?: { name: string; date: string; signature: string }
  resident?: { name: string; date: string; signature: string }
  caseManager?: { name: string; date: string; signature: string }
  healthProfessional?: { name: string; date: string; signature: string }
}
