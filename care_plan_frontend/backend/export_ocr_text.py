"""
Simple CLI script to export OCR-extracted text (and checkbox labels) from a PDF
to a .txt file, using the existing OCR helpers in `assessments.services`.

Usage (from the `backend` directory):

  python export_ocr_text.py path/to/input.pdf path/to/output.txt

Assumes:
- DJANGO_SETTINGS_MODULE = careease_backend.settings
- Dependencies installed from backend/requirements.txt
"""

import os
import sys

import django


def main() -> None:
  if len(sys.argv) < 3:
    print("Usage: python export_ocr_text.py <input.pdf> <output.txt>")
    sys.exit(1)

  pdf_path = sys.argv[1]
  out_path = sys.argv[2]

  if not os.path.exists(pdf_path):
    print(f"Input file not found: {pdf_path}")
    sys.exit(1)

  # Initialise Django so we can use settings / shared helpers
  os.environ.setdefault("DJANGO_SETTINGS_MODULE", "careease_backend.settings")
  django.setup()

  # Import after Django setup
  import fitz  # PyMuPDF
  from assessments.services import render_page_to_image, ocr_page, detect_checkboxes, TESSERACT_AVAILABLE

  doc = fitz.open(pdf_path)

  with open(out_path, "w", encoding="utf-8") as f:
    f.write(f"OCR export for PDF: {os.path.abspath(pdf_path)}\n")
    f.write(f"Tesseract available: {TESSERACT_AVAILABLE}\n")
    f.write("=" * 80 + "\n\n")

    for i in range(doc.page_count):
      page_num = i + 1
      f.write(f"=== PAGE {page_num} ===\n\n")

      # Render page to image and run OCR
      image_bgr = render_page_to_image(doc, i, dpi=300)
      text, words = ocr_page(image_bgr)

      if text:
        f.write(text)
        f.write("\n\n")
      else:
        # Fallback: direct text extraction if OCR is unavailable
        page = doc.load_page(i)
        raw_text = page.get_text("text") or ""
        f.write(raw_text)
        f.write("\n\n")

      # Also dump checkbox detections (if any)
      try:
        hits = detect_checkboxes(image_bgr, page_num)
      except Exception:
        hits = []

      if hits:
        f.write("--- Detected checkboxes ---\n")
        for h in hits:
          status = "CHECKED" if h.checked else "UNCHECKED"
          f.write(
            f"[{status} | conf={h.confidence:.3f}] "
            f"label='{h.label}' bbox={h.bbox} label_bbox={h.label_bbox}\n"
          )
        f.write("\n")

      f.write("\n")

  print(f"OCR export written to: {os.path.abspath(out_path)}")


if __name__ == "__main__":
  main()


