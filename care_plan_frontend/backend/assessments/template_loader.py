import json
from pathlib import Path
from django.conf import settings

def load_template_json() -> dict:
    # expects ./care_plan_clean.json (same level as manage.py)
    path = Path(settings.BASE_DIR) / "care_plan_clean.json"
    if not path.exists():
        raise FileNotFoundError(f"Template JSON not found at {path}")
    return json.loads(path.read_text(encoding="utf-8"))
