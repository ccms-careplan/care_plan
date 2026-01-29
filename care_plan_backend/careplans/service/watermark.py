from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO
from PyPDF2 import PdfReader, PdfWriter

def apply_watermark(input_pdf_bytes, watermark_text):
    watermark_buffer = BytesIO()
    c = canvas.Canvas(watermark_buffer, pagesize=A4)

    c.setFont("Helvetica-Bold", 40)
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
    reader = PdfReader(BytesIO(input_pdf_bytes))
    writer = PdfWriter()

    for page in reader.pages:
        page.merge_page(watermark_pdf.pages[0])
        writer.add_page(page)

    output = BytesIO()
    writer.write(output)
    return output.getvalue()
