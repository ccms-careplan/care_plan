import json
from services.llm_client import call_llm

CANONICAL_SCHEMA = """
Return ONLY valid JSON matching this schema:
{
  "resident_profile": {...},
  "mobility": {...},
  "nutrition": {...},
  "mental_health": {...},
  "adl": {...},
  "medical_notes": "",
  "risks": [],
  "recommended_care_focus": []
}
"""

def extract_structured_assessment(raw_text: str) -> dict:
    prompt = f"""
You are a clinical documentation assistant.

Extract assessment information from the following text
and convert it into the canonical JSON schema.

{CANONICAL_SCHEMA}

TEXT:
{raw_text}
"""

    # pseudo-call
    response_text = call_llm(prompt)

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON returned from AI")
