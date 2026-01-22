import type { Patient, Assessment, CarePlan } from "./types"

// Mock data store (in production, this would be a database)
export const mockPatients: Patient[] = [
  {
    id: "patient-1",
    name: "Dorothy Martinez",
    dateOfBirth: "1945-03-15",
    preferredLanguage: "English",
    address: "123 Maple Street, Seattle, WA 98101",
    phone: "(206) 555-0123",
    email: "dorothy.m@email.com",
    caseManager: "Sarah Johnson",
    physician: "Dr. Robert Chen",
    pharmacy: "Seattle Care Pharmacy",
    preferredHospital: "Swedish Medical Center",
    powerOfAttorney: "Michael Martinez (Son)",
    advanceDirectives: "DNR on file",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-15T14:30:00Z",
    organizationId: "org-1",
  },
  {
    id: "patient-2",
    name: "Robert Thompson",
    dateOfBirth: "1938-07-22",
    preferredLanguage: "English",
    address: "456 Oak Avenue, Tacoma, WA 98402",
    phone: "(253) 555-0456",
    caseManager: "Lisa Anderson",
    physician: "Dr. Emily Watson",
    pharmacy: "Tacoma Health Pharmacy",
    preferredHospital: "Tacoma General Hospital",
    createdAt: "2025-01-12T09:00:00Z",
    updatedAt: "2025-01-12T09:00:00Z",
    organizationId: "org-1",
  },
]

export const mockAssessments: Assessment[] = [
  {
    id: "assessment-1",
    patientId: "patient-1",
    assessmentDate: "2025-01-15",
    status: "completed",
    createdBy: "demo-c-admin",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T14:30:00Z",
    data: {
      diagnoses: ["Dementia - Alzheimer's Type", "Hypertension", "Type 2 Diabetes"],
      medications: [
        {
          name: "Donepezil",
          dose: "10mg",
          frequency: "Daily",
          route: "Oral",
          rx: true,
          selfAdmin: "No",
          delegationRequired: "Yes",
        },
      ],
      allergies: [
        {
          substance: "Penicillin",
          type: "Medication",
          reaction: "Rash",
        },
      ],
    },
  },
]

export const mockCarePlans: CarePlan[] = [
  {
    id: "careplan-1",
    patientId: "patient-1",
    assessmentId: "assessment-1",
    status: "draft",
    createdBy: "demo-c-admin",
    createdAt: "2025-01-16T10:00:00Z",
    updatedAt: "2025-01-16T15:00:00Z",
    domains: {},
  },
]

// Helper functions
export function getPatientsByOrganization(orgId: string): Patient[] {
  return mockPatients.filter((p) => p.organizationId === orgId)
}

export function getPatientById(id: string): Patient | undefined {
  return mockPatients.find((p) => p.id === id)
}

export function getAssessmentsByPatient(patientId: string): Assessment[] {
  return mockAssessments.filter((a) => a.patientId === patientId)
}

export function getCarePlansByPatient(patientId: string): CarePlan[] {
  return mockCarePlans.filter((c) => c.patientId === patientId)
}
