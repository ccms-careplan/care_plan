ADL_DOMAINS = [
  "bathing_personal_hygiene",
  "dressing",
  "toileting",
  "eating",
  "mobility_ambulation",
  "bed_mobility_transfers",
  "speech_hearing",
  "communication",
  "telephone_use",
  "vision",
  "medication_management",
  "pain_management",
  "cognitive_memory",
  "behavior_social_interaction",
  "sleep_rest",
  "activities_social_needs",
  "treatments_therapies",
  "safety_emergency_procedures",
]

def empty_domain():
  return {"level": None, "strengths": None, "caregiver_instructions": None}

def ensure_adl_defaults(data: dict) -> dict:
  adl = data.get("adl") or {}
  for k in ADL_DOMAINS:
    if k not in adl:
      adl[k] = empty_domain()
  data["adl"] = adl
  return data
