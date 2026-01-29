# import subprocess
# from pathlib import Path

# def docx_to_pdf(docx_path: str) -> str:
#     output_dir = Path(docx_path).parent
#     subprocess.run([
#         "soffice",
#         "--headless",
#         "--convert-to", "pdf",
#         docx_path,
#         "--outdir", str(output_dir)
#     ], check=True)

#     return docx_path.replace(".docx", ".pdf")



import subprocess
from pathlib import Path

def docx_to_pdf(docx_path: str) -> str:
    docx_path = Path(docx_path)
    output_dir = docx_path.parent

    subprocess.run(
        [
            "soffice",
            "--headless",
            "--convert-to", "pdf",
            str(docx_path),
            "--outdir", str(output_dir)
        ],
        check=True
    )

    pdf_path = docx_path.with_suffix(".pdf")

    print("✅ DOCX converted to PDF:", pdf_path)

    if not pdf_path.exists():
        raise RuntimeError("❌ PDF was not created")

    return str(pdf_path)
