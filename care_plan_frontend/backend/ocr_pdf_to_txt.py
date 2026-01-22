import os
import sys
from pathlib import Path

import pytesseract
from pdf2image import convert_from_path


def ocr_pdf_to_txt(pdf_path: str, output_txt: str, dpi: int = 300, lang: str = "eng"):
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    # OPTIONAL: if tesseract isn't in PATH, set it directly:
    # pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    print(f"[1/3] Converting PDF to images @ {dpi} DPI...")
    pages = convert_from_path(str(pdf_path), dpi=dpi)  # uses Poppler

    print(f"[2/3] Running OCR on {len(pages)} page(s)...")
    all_text = []
    for i, img in enumerate(pages, start=1):
        text = pytesseract.image_to_string(img, lang=lang)
        all_text.append(f"\n\n===== PAGE {i} =====\n{text}")
        print(f"  OCR done: page {i}/{len(pages)}")

    print(f"[3/3] Saving output -> {output_txt}")
    Path(output_txt).write_text("\n".join(all_text), encoding="utf-8")
    print("✅ Done.")


if __name__ == "__main__":
    # Usage:
    #   python ocr_pdf_to_txt.py "C:\path\file.pdf" "output.txt"
    if len(sys.argv) < 3:
        print("Usage: python ocr_pdf_to_txt.py <pdf_path> <output_txt> [dpi]")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_txt = sys.argv[2]
    dpi = int(sys.argv[3]) if len(sys.argv) >= 4 else 300

    ocr_pdf_to_txt(pdf_path, output_txt, dpi=dpi)


