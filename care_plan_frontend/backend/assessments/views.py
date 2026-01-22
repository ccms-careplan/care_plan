# from rest_framework.views import APIView
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.response import Response
# from rest_framework import status
# from django.shortcuts import get_object_or_404

# from .models import Patient, Assessment
# from .services import extract_full_assessment_from_pdf, to_review_fields

# class UploadAssessmentView(APIView):
#     parser_classes = (MultiPartParser, FormParser)

#     def post(self, request):
#         patient_id = request.data.get("patientId")
#         file = request.FILES.get("file")

#         if not patient_id:
#             return Response({"error": "patientId is required"}, status=status.HTTP_400_BAD_REQUEST)
#         if not file:
#             return Response({"error": "file is required"}, status=status.HTTP_400_BAD_REQUEST)

#         patient = get_object_or_404(Patient, id=patient_id)

#         assessment = Assessment.objects.create(
#             patient=patient,
#             source_file=file,
#             status="extracting"
#         )

#         try:
#             extracted = extract_full_assessment_from_pdf(assessment.source_file.path)
#             assessment.extracted_json = extracted
#             assessment.status = "extracted"
#             assessment.save()

#             return Response({
#                 "ok": True,
#                 "assessmentId": assessment.id,
#                 "extracted_json": extracted,
#                 "fields": to_review_fields(extracted),
#             })
#         except Exception as e:
#             assessment.status = "failed"
#             assessment.error_message = str(e)
#             assessment.save()
#             return Response({"ok": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# from rest_framework.views import APIView
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.response import Response
# from rest_framework import status
# from django.shortcuts import get_object_or_404

# from .models import Patient, Assessment, AssessmentChunk
# from .services import populate_template_from_pdf
# from .review import to_review_list


# class UploadAndExtractView(APIView):
#     parser_classes = (MultiPartParser, FormParser)

#     def post(self, request):
#         patient_id = request.data.get("patientId")
#         file = request.FILES.get("file")

#         if not patient_id:
#             return Response({"error": "patientId is required"}, status=status.HTTP_400_BAD_REQUEST)
#         if not file:
#             return Response({"error": "file is required"}, status=status.HTTP_400_BAD_REQUEST)

#         patient = get_object_or_404(Patient, id=patient_id)

#         assessment = Assessment.objects.create(
#             patient=patient,
#             source_file=file,
#             status="extracting"
#         )

#         try:
#             final_json, confidence_map, chunks = populate_template_from_pdf(assessment.source_file.path)

#             # save assessment
#             assessment.extracted_json = final_json
#             assessment.status = "extracted"
#             assessment.save()

#             # save chunks (text+embedding)
#             AssessmentChunk.objects.filter(assessment=assessment).delete()
#             for ch in chunks:
#                 AssessmentChunk.objects.create(
#                     assessment=assessment,
#                     page_start=ch["page_start"],
#                     page_end=ch["page_end"],
#                     text=ch["text"],
#                     embedding=ch["embedding"],
#                 )

#             review_list = to_review_list(final_json, confidence_map)

#             return Response({
#                 "ok": True,
#                 "assessmentId": assessment.id,
#                 "final_structured_json": final_json,
#                 "review_list": review_list,
#             })

#         except Exception as e:
#             assessment.status = "failed"
#             assessment.error_message = str(e)
#             assessment.save()
#             return Response({"ok": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# # assessments/views.py
# import os
# import uuid
# from django.conf import settings
# from rest_framework.views import APIView
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.response import Response
# from rest_framework import status

# from .services import generate_care_plan_from_upload

# class UploadAssessmentView(APIView):
#     parser_classes = (MultiPartParser, FormParser)

#     def post(self, request):
#         upload = request.FILES.get("file")
#         provider = (
#             request.data.get("provider")
#             or request.query_params.get("provider")
#             or getattr(settings, "LLM_PROVIDER", "openai")
#         )

#         if not upload:
#             return Response({"ok": False, "error": "file is required"}, status=status.HTTP_400_BAD_REQUEST)

#         # save file
#         os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
#         fname = f"{uuid.uuid4()}_{upload.name}"
#         fpath = os.path.join(settings.MEDIA_ROOT, fname)
#         with open(fpath, "wb") as f:
#             for chunk in upload.chunks():
#                 f.write(chunk)

#         try:
#             result = generate_care_plan_from_upload(fpath, provider_name=provider)
#             return Response({"ok": True, **result})
#         except Exception as e:
#             return Response({"ok": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




import os
import tempfile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .services import generate_care_plan_from_pdf

class UploadAssessmentView(APIView):
    def post(self, request):
        f = request.FILES.get("file")
        if not f:
            return Response({"error": "Missing file"}, status=status.HTTP_400_BAD_REQUEST)

        suffix = os.path.splitext(f.name)[-1].lower() or ".pdf"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            for chunk in f.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            result = generate_care_plan_from_pdf(tmp_path)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass
from rest_framework.views import APIView
from rest_framework.response import Response

class HealthView(APIView):
    def get(self, request):
        return Response({"ok": True})
