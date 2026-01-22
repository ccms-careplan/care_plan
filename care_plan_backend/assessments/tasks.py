from celery import shared_task
from django.db import transaction
from .models import Assessment
from services.ocr import extract_text_from_pdf
from services.ai_extractor import extract_structured_assessment

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=30, retry_kwargs={'max_retries': 3})
def process_assessment_pdf(self, assessment_id):
    assessment = Assessment.objects.get(pk=assessment_id)

    assessment.status = 'processing'
    assessment.save(update_fields=['status'])

    try:
        # 1️⃣ OCR
        raw_text = extract_text_from_pdf(assessment.pdf_file.path)

        # 2️⃣ AI Extraction
        structured = extract_structured_assessment(raw_text)

        # 3️⃣ Save atomically
        with transaction.atomic():
            assessment.raw_extracted_text = raw_text
            assessment.structured_data = structured
            assessment.status = 'ready'
            assessment.save()

    except Exception as exc:
        assessment.status = 'failed'
        assessment.save(update_fields=['status'])
        raise exc
