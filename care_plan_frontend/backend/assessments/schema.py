ASSESSMENT_JSON_SCHEMA = {
  "name": "assessment_extract",
  "strict": True,
  "schema": {
    "type": "object",
    "additionalProperties": False,
    "properties": {
      "resident": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
          "name": {"type": ["string", "null"]},
          "dob": {"type": ["string", "null"]},
          "assessment_date": {"type": ["string", "null"]},
          "case_manager": {"type": ["string", "null"]},
          "address": {"type": ["string", "null"]},
          "phone": {"type": ["string", "null"]},
          "primary_doctor": {"type": ["string", "null"]},
          "pharmacy": {"type": ["string", "null"]},
          "preferred_hospital": {"type": ["string", "null"]},
          "language": {"type": ["string", "null"]},
          "code_status": {"type": ["string", "null"]}
        },
        "required": ["name","dob","assessment_date","case_manager","address","phone","primary_doctor","pharmacy","preferred_hospital","language","code_status"]
      },

      "contacts": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": False,
          "properties": {
            "name": {"type": ["string","null"]},
            "relationship": {"type": ["string","null"]},
            "role": {"type": ["string","null"]},
            "phone": {"type": ["string","null"]},
            "address": {"type": ["string","null"]},
            "city": {"type": ["string","null"]},
            "state": {"type": ["string","null"]},
            "zip": {"type": ["string","null"]}
          },
          "required": ["name","relationship","role","phone","address","city","state","zip"]
        }
      },

      "allergies": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": False,
          "properties": {
            "substance": {"type": ["string","null"]},
            "type": {"type": ["string","null"]},
            "reaction": {"type": ["string","null"]}
          },
          "required": ["substance","type","reaction"]
        }
      },

      "medications": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": False,
          "properties": {
            "name": {"type": ["string","null"]},
            "dose": {"type": ["string","null"]},
            "route": {"type": ["string","null"]},
            "frequency": {"type": ["string","null"]},
            "rx": {"type": ["boolean","null"]},
            "rn_delegate": {"type": ["boolean","null"]},
            "reason_or_notes": {"type": ["string","null"]}
          },
          "required": ["name","dose","route","frequency","rx","rn_delegate","reason_or_notes"]
        }
      },

      "diagnoses": { "type": "array", "items": {"type":"string"} },

      "adl": {
        "type": "object",
        "additionalProperties": False,
        "properties": {},
        "required": []
      },

      "behaviors": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": False,
          "properties": {
            "name": {"type": ["string","null"]},
            "frequency": {"type": ["string","null"]},
            "triggers": {"type": ["string","null"]},
            "interventions": {"type": ["string","null"]},
            "loc": {"type": ["string","null"]}
          },
          "required": ["name","frequency","triggers","interventions","loc"]
        }
      },

      "notes": {"type": ["string","null"]}
    },
    "required": ["resident","contacts","allergies","medications","diagnoses","adl","behaviors","notes"]
  }
}
