import os
import json
import io
import argparse
from pathlib import Path
from typing import Any, Dict, List, Tuple, Optional

from dotenv import load_dotenv

import fitz  # PyMuPDF
from PIL import Image
import pytesseract

from openai import OpenAI


# ----------------------------
# Config helpers
# ----------------------------

def env(name: str, default: str = "") -> str:
    v = os.getenv(name)
    return v if v is not None and v != "" else default


def require_env(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing required env var: {name}")
    return v


# ----------------------------
# OCR
# ----------------------------

def pdf_to_images(
    pdf_path: str,
    dpi: int = 300,
    poppler_path: Optional[str] = None,  # Ignored, kept for compatibility
) -> List[Image.Image]:
    """
    Convert PDF to list of PIL Images (one per page) using PyMuPDF.
    No Poppler required!
    """
    doc = fitz.open(pdf_path)
    images = []
    
    # Convert DPI to zoom factor (PyMuPDF uses zoom, not DPI directly)
    # Default DPI is 72, so zoom = desired_dpi / 72
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Convert PyMuPDF pixmap to PIL Image
        img_data = pix.tobytes("ppm")
        img = Image.open(io.BytesIO(img_data))
        images.append(img)
    
    doc.close()
    return images


def ocr_image_text(img: Image.Image, lang: str = "eng") -> str:
    """
    Returns plain OCR text for the page.
    """
    # You can tune PSM depending on your forms:
    # 6 = Assume a single uniform block of text.
    config = "--oem 3 --psm 6"
    return pytesseract.image_to_string(img, lang=lang, config=config)


def ocr_image_tsv(img: Image.Image, lang: str = "eng") -> str:
    """
    Returns TSV output with bounding boxes + confidence per word.
    This is very useful as "raw OCR data".
    """
    config = "--oem 3 --psm 6"
    return pytesseract.image_to_data(img, lang=lang, config=config, output_type=pytesseract.Output.STRING)


def run_ocr_on_pdf(
    pdf_path: str,
    out_dir: Path,
    dpi: int = 300,
    lang: str = "eng",
    poppler_path: Optional[str] = None,
    save_tsv: bool = True,
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    OCR all pages. Returns:
      - combined_text: str
      - pages_meta: [{page, text_len, tsv_path, img_path}]
    """
    out_dir.mkdir(parents=True, exist_ok=True)

    images = pdf_to_images(pdf_path, dpi=dpi, poppler_path=poppler_path)

    combined_pages_text: List[str] = []
    pages_meta: List[Dict[str, Any]] = []

    for i, img in enumerate(images, start=1):
        page_img_path = out_dir / f"page_{i:03d}.png"
        img.save(page_img_path)

        text = ocr_image_text(img, lang=lang).strip()
        combined_pages_text.append(f"\n\n===== PAGE {i} =====\n\n{text}")

        tsv_path = None
        if save_tsv:
            tsv = ocr_image_tsv(img, lang=lang)
            tsv_path = out_dir / f"page_{i:03d}.tsv"
            tsv_path.write_text(tsv, encoding="utf-8")

        pages_meta.append({
            "page": i,
            "image_path": str(page_img_path),
            "tsv_path": str(tsv_path) if tsv_path else None,
            "text_len": len(text),
        })

    combined_text = "\n".join(combined_pages_text).strip()
    return combined_text, pages_meta


# ----------------------------
# Template validation (light but helpful)
# ----------------------------

def same_shape(template: Any, filled: Any, path: str = "$") -> List[str]:
    """
    Checks that filled JSON keeps the same overall structure:
    - dict keys match
    - lists have same length
    Returns list of errors; empty means OK.
    """
    errors = []

    if isinstance(template, dict):
        if not isinstance(filled, dict):
            return [f"{path}: expected object, got {type(filled).__name__}"]
        tmpl_keys = set(template.keys())
        filled_keys = set(filled.keys())
        if tmpl_keys != filled_keys:
            missing = tmpl_keys - filled_keys
            extra = filled_keys - tmpl_keys
            if missing:
                errors.append(f"{path}: missing keys: {sorted(list(missing))}")
            if extra:
                errors.append(f"{path}: extra keys: {sorted(list(extra))}")
        for k in template.keys():
            errors += same_shape(template[k], filled[k], f"{path}.{k}")
        return errors

    if isinstance(template, list):
        if not isinstance(filled, list):
            return [f"{path}: expected array, got {type(filled).__name__}"]
        if len(template) != len(filled):
            errors.append(f"{path}: expected length {len(template)}, got {len(filled)}")
            # still continue on min length
        for idx in range(min(len(template), len(filled))):
            errors += same_shape(template[idx], filled[idx], f"{path}[{idx}]")
        return errors

    # primitives: allow type changes only for checkbox "checked" fields etc.
    # We do not enforce strict primitive types here because templates vary.
    return []


# ----------------------------
# OpenAI: fill care plan template
# ----------------------------

def openai_fill_template(
    ocr_text: str,
    care_plan_template: Dict[str, Any],
    model: str,
    api_key: str,
) -> Dict[str, Any]:
    """
    Returns:
      {
        "care_plan": <filled template>,
        "review_list": [ ... ]
      }
    """
    client = OpenAI(api_key=api_key)

    system = (
        "You are a clinical document assistant.\n"
        "You MUST only use facts explicitly present in the OCR text.\n"
        "Do NOT invent anything.\n"
        "You will be given a care plan JSON template.\n"
        "Return a JSON object with:\n"
        "1) care_plan: the SAME template structure, but populated.\n"
        "2) review_list: a list of changes/evidence for UI.\n\n"
        "Rules:\n"
        "- For each checkbox item: set checked=true ONLY if OCR text clearly supports it. Otherwise false.\n"
        "- For any free-text fields: copy exact phrases from OCR or leave empty/null if not present.\n"
        "- Evidence must be quoted as a short excerpt from OCR and include page number when possible.\n"
        "- Output MUST be valid JSON. No markdown.\n"
    )

    user = {
        "task": "Populate care plan template from OCR text",
        "ocr_text": ocr_text,
        "care_plan_template": care_plan_template,
        "output_contract": {
            "type": "object",
            "required_keys": ["care_plan", "review_list"],
            "review_list_item_format": {
                "path": "JSON path in care_plan e.g. $.sections[3].checkboxes[2].checked",
                "new_value": "the final value (boolean/string/number)",
                "evidence_excerpt": "short excerpt from OCR that supports it",
                "page": "page number if known else null",
                "confidence": "0.0-1.0 (estimate based on clarity of evidence)"
            }
        }
    }

    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": json.dumps(user, ensure_ascii=False)},
        ],
        # Keep it deterministic for clinical use
        temperature=0,
        response_format={"type": "json_object"},
    )

    content = resp.choices[0].message.content
    if not content:
        raise RuntimeError("Empty response from OpenAI.")
    return json.loads(content)


# ----------------------------
# Main
# ----------------------------

def main():
    load_dotenv()

    parser = argparse.ArgumentParser(description="OCR PDF with Tesseract, save raw text, then fill care plan JSON via OpenAI.")
    parser.add_argument("--pdf", required=True, help="Path to input assessment PDF")
    parser.add_argument("--template", required=True, help="Path to care_plan_template.json")
    parser.add_argument("--outdir", default="outputs", help="Output directory")
    parser.add_argument("--dpi", type=int, default=300, help="DPI for PDF->image")
    parser.add_argument("--lang", default="eng", help="Tesseract language (default eng)")
    parser.add_argument("--save-tsv", action="store_true", help="Save TSV (bounding boxes + confidence) per page")
    parser.add_argument("--poppler-path", default="", help="[DEPRECATED] No longer needed - using PyMuPDF instead")
    parser.add_argument("--tesseract-cmd", default="", help="Optional full path to tesseract.exe if not on PATH")

    args = parser.parse_args()

    # If tesseract isn't on PATH, you can set it here:
    # e.g. --tesseract-cmd "C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
    if args.tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = args.tesseract_cmd

    openai_key = require_env("OPENAI_API_KEY")
    openai_model = env("OPENAI_MODEL", "gpt-4o-mini")

    out_dir = Path(args.outdir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1) OCR
    print("[1/3] Running OCR...")
    ocr_text, pages_meta = run_ocr_on_pdf(
        pdf_path=args.pdf,
        out_dir=out_dir / "ocr_pages",
        dpi=args.dpi,
        lang=args.lang,
        poppler_path=args.poppler_path if args.poppler_path else None,
        save_tsv=args.save_tsv,
    )

    ocr_txt_path = out_dir / "ocr_raw.txt"
    ocr_txt_path.write_text(ocr_text, encoding="utf-8")
    print(f"Saved OCR raw text: {ocr_txt_path}")

    meta_path = out_dir / "ocr_meta.json"
    meta_path.write_text(json.dumps(pages_meta, indent=2), encoding="utf-8")
    print(f"Saved OCR meta: {meta_path}")

    # 2) Load template
    print("[2/3] Loading care plan template...")
    template = json.loads(Path(args.template).read_text(encoding="utf-8"))

    # 3) OpenAI fill
    print("[3/3] Calling OpenAI to populate template...")
    result = openai_fill_template(
        ocr_text=ocr_text,
        care_plan_template=template,
        model=openai_model,
        api_key=openai_key,
    )

    if "care_plan" not in result or "review_list" not in result:
        raise RuntimeError("OpenAI response missing required keys: care_plan, review_list")

    # Validate structure matches template
    errors = same_shape(template, result["care_plan"])
    if errors:
        # Save raw result to inspect
        raw_path = out_dir / "openai_raw_response.json"
        raw_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
        raise RuntimeError(
            "Filled care_plan does not match template structure.\n"
            "First errors:\n- " + "\n- ".join(errors[:20]) +
            f"\nRaw response saved to: {raw_path}"
        )

    care_plan_path = out_dir / "care_plan_filled.json"
    care_plan_path.write_text(json.dumps(result["care_plan"], indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved filled care plan JSON: {care_plan_path}")

    review_path = out_dir / "review_list.json"
    review_path.write_text(json.dumps(result["review_list"], indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved review list: {review_path}")

    print("\n✅ Done.")
    print("Outputs:")
    print(f"- OCR raw text: {ocr_txt_path}")
    print(f"- Filled care plan: {care_plan_path}")
    print(f"- Review list: {review_path}")
    print(f"- Per-page images/TSV: {out_dir / 'ocr_pages'}")


if __name__ == "__main__":
    main()

