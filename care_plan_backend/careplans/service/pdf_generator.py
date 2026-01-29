# import os
# from django.conf import settings
# from django.template.loader import render_to_string
# from weasyprint import HTML
# from django.core.files.base import ContentFile

# def generate_careplan_pdf(care_plan):
#     html_string = render_to_string(
#         "careplans/careplan_pdf.html",
#         {"content": care_plan.content}
#     )

#     pdf_file = HTML(string=html_string).write_pdf()

#     filename = f"careplan_{care_plan.id}.pdf"
#     care_plan.pdf_file.save(
#         filename,
#         ContentFile(pdf_file),
#         save=True
#     )

#     return care_plan.pdf_file.url



# import asyncio
# from django.template.loader import render_to_string
# from django.core.files.base import ContentFile
# from django.conf import settings
# from pathlib import Path
# from playwright.async_api import async_playwright


# async def _render_pdf(html: str) -> bytes:
#     async with async_playwright() as p:
#         browser = await p.chromium.launch()
#         page = await browser.new_page()

#         await page.set_content(html, wait_until="networkidle")
#         pdf_bytes = await page.pdf(
#             format="A4",
#             print_background=True,
#             margin={
#                 "top": "20mm",
#                 "bottom": "20mm",
#                 "left": "15mm",
#                 "right": "15mm",
#             },
#         )

#         await browser.close()
#         return pdf_bytes


# def generate_careplan_pdf(care_plan):
#     html_string = render_to_string(
#         "careplans/careplan_pdf.html",
#         {"content": care_plan.content}
#     )

#     pdf_bytes = asyncio.run(_render_pdf(html_string))

#     filename = f"careplan_{care_plan.id}.pdf"
#     care_plan.pdf_file.save(
#         filename,
#         ContentFile(pdf_bytes),
#         save=True
#     )

#     return care_plan.pdf_file.url




import asyncio
import hashlib
from io import BytesIO
from pathlib import Path

from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from django.utils import timezone

from playwright.async_api import async_playwright
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


# --------------------------------------------------
# 1️⃣ Playwright HTML → PDF
# --------------------------------------------------
async def _render_pdf(html: str) -> bytes:
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.set_content(html, wait_until="networkidle")

        pdf_bytes = await page.pdf(
            format="A4",
            print_background=True,
            margin={
                "top": "20mm",
                "bottom": "20mm",
                "left": "15mm",
                "right": "15mm",
            },
        )

        await browser.close()
        return pdf_bytes


# --------------------------------------------------
# 2️⃣ Watermark PDF
# --------------------------------------------------
def apply_watermark(pdf_bytes: bytes, watermark_text: str) -> bytes:
    watermark_buffer = BytesIO()

    c = canvas.Canvas(watermark_buffer, pagesize=A4)
    c.setFont("Helvetica-Bold", 36)
    c.setFillGray(0.85)
    c.saveState()
    c.translate(300, 400)
    c.rotate(45)
    c.drawCentredString(0, 0, watermark_text)
    c.restoreState()
    c.showPage()
    c.save()

    watermark_buffer.seek(0)

    watermark_pdf = PdfReader(watermark_buffer)
    original_pdf = PdfReader(BytesIO(pdf_bytes))
    writer = PdfWriter()

    for page in original_pdf.pages:
        page.merge_page(watermark_pdf.pages[0])
        writer.add_page(page)

    output = BytesIO()
    writer.write(output)
    return output.getvalue()


# --------------------------------------------------
# 3️⃣ Digital Signature (Hash)
# --------------------------------------------------
def generate_pdf_hash(pdf_bytes: bytes) -> str:
    return hashlib.sha256(pdf_bytes).hexdigest()


# --------------------------------------------------
# 4️⃣ PUBLIC API – Generate, Watermark & Sign
# --------------------------------------------------
def generate_and_sign_careplan_pdf(care_plan, signed_by):
    """
    Final secure PDF generator:
    - Playwright render
    - Watermark
    - Digital signature
    - Persist signed metadata
    """

    # 1️⃣ Render HTML
    html_string = render_to_string(
        "careplans/careplan_pdf.html",
        {
            "content": care_plan.content,
            "care_plan": care_plan,
        }
    )

    pdf_bytes = asyncio.run(_render_pdf(html_string))

    # 2️⃣ Apply watermark
    watermark_text = f"SIGNED • {signed_by.get_full_name() or signed_by.username}"
    pdf_bytes = apply_watermark(pdf_bytes, watermark_text)

    # 3️⃣ Generate cryptographic hash (digital signature)
    pdf_hash = generate_pdf_hash(pdf_bytes)

    # 4️⃣ Save signed PDF
    filename = f"careplan_{care_plan.id}_signed.pdf"
    care_plan.pdf_file.save(
        filename,
        ContentFile(pdf_bytes),
        save=False,
    )

    # 5️⃣ Persist signature metadata
    care_plan.signed_by = signed_by
    care_plan.signed_at = timezone.now()
    care_plan.pdf_hash = pdf_hash
    care_plan.save()

    return care_plan

