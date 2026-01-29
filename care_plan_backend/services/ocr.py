# import pytesseract
# from pdf2image import convert_from_path

# def extract_text_from_pdf(pdf_path: str) -> str:
#     images = convert_from_path(pdf_path)
#     text = []

#     for img in images:
#         page_text = pytesseract.image_to_string(img)
#         text.append(page_text)

#     return "\n".join(text)


import os
import pytesseract
from pdf2image import convert_from_path
from .doc_to_pdf import docx_to_pdf
from docx import Document

def extract_text_from_pdf(pdf_path: str) -> str:
    images = convert_from_path(pdf_path)
    text = []

    for img in images:
        page_text = pytesseract.image_to_string(img)
        text.append(page_text)

    return "\n".join(text)





def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return extract_text_from_pdf(file_path)

    elif ext == ".docx":
        pdf_path = docx_to_pdf(file_path)
        return extract_text_from_pdf(pdf_path)

    else:
        raise ValueError(f"Unsupported file type: {ext}")

