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



import asyncio
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from django.conf import settings
from pathlib import Path
from playwright.async_api import async_playwright


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


def generate_careplan_pdf(care_plan):
    html_string = render_to_string(
        "careplans/careplan_pdf.html",
        {"content": care_plan.content}
    )

    pdf_bytes = asyncio.run(_render_pdf(html_string))

    filename = f"careplan_{care_plan.id}.pdf"
    care_plan.pdf_file.save(
        filename,
        ContentFile(pdf_bytes),
        save=True
    )

    return care_plan.pdf_file.url

