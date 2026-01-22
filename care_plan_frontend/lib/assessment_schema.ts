import { z } from "zod";

export const AssessmentExtractSchema = z.object({
  resident: z.object({
    name: z.string().nullable(),
    dob: z.string().nullable(), // keep as string; normalize later
    assessment_date: z.string().nullable(),
    case_manager: z.string().nullable(),
    address: z.string().nullable(),
    phone: z.string().nullable(),
    primary_doctor: z.string().nullable(),
    pharmacy: z.string().nullable(),
    preferred_hospital: z.string().nullable(),
    language: z.string().nullable(),
    code_status: z.string().nullable(),
  }),

  contacts: z.array(
    z.object({
      name: z.string().nullable(),
      relationship: z.string().nullable(),
      role: z.string().nullable(), // POA, Guardian, etc.
      phone: z.string().nullable(),
      address: z.string().nullable(),
      city: z.string().nullable(),
      state: z.string().nullable(),
      zip: z.string().nullable(),
    })
  ),

  allergies: z.array(
    z.object({
      substance: z.string().nullable(), // e.g. Aripiprazole
      type: z.string().nullable(),      // Drugs/Foods/Environmental
      reaction: z.string().nullable(),
    })
  ),

  medications: z.array(
    z.object({
      name: z.string().nullable(),
      dose: z.string().nullable(),
      route: z.string().nullable(),
      frequency: z.string().nullable(),
      rx: z.boolean().nullable(),
      rn_delegate: z.boolean().nullable(),
      reason_or_notes: z.string().nullable(),
    })
  ),

  diagnoses: z.array(z.string()),

  adl: z.object({
    bathing: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    personal_hygiene: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    dressing: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    toileting: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    eating: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    mobility: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    bed_mobility_transfers: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    speech_hearing: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    communication: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    telephone_use: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    vision: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    medication_management: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    pain_management: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    cognitive_memory: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    behavior_social: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    sleep_rest: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    activities_social_needs: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    treatments_therapies: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
    safety_emergency: z.object({ level: z.string().nullable(), strengths: z.string().nullable(), caregiver_instructions: z.string().nullable() }),
  }),

  behaviors: z.array(
    z.object({
      name: z.string().nullable(),
      frequency: z.string().nullable(),
      triggers: z.string().nullable(),
      interventions: z.string().nullable(),
      loc: z.string().nullable(),
    })
  ),

  notes: z.string().nullable(),
});

export type AssessmentExtract = z.infer<typeof AssessmentExtractSchema>;
