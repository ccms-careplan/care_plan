# # careplans/pdf.py
# import os
# from django.template.loader import render_to_string
# from weasyprint import HTML

# def generate_careplan_pdf(careplan):
#     """
#     Generates a PDF for the given careplan using WeasyPrint.
#     Returns the path to the generated PDF.
#     """
    
#     # Set file name and path
#     file_name = f"careplan_{careplan.id}.pdf"
#     file_path = os.path.join("media", file_name)

#     # Render the HTML content using a Django template
#     html_content = render_to_string("careplans/careplan_template.html", {"careplan": careplan})

#     # Generate PDF using WeasyPrint
#     HTML(string=html_content).write_pdf(file_path)

#     return file_path
