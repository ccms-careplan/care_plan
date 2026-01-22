import pytesseract
from pdf2image import convert_from_path

def extract_text_from_pdf(pdf_path: str) -> str:
    images = convert_from_path(pdf_path)
    text = []

    for img in images:
        page_text = pytesseract.image_to_string(img)
        text.append(page_text)

    return "\n".join(text)
