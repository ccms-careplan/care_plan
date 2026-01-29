from rest_framework import viewsets
from .models import Assessment
from .serializers import AssessmentUploadSerializer
from .tasks import process_assessment_pdf

from common.permissions import RBACPermission

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentUploadSerializer
    # permission_classes = [RBACPermission]

    def perform_create(self, serializer):
        assessment = serializer.save()

        if assessment.source_type == 'pdf' and assessment.document_file:
            process_assessment_pdf.delay(assessment.id)




















# from rest_framework import viewsets, status
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from .models import Assessment
# from .serializers import AssessmentUploadSerializer
# from .tasks import process_assessment_pdf

# class AssessmentViewSet(viewsets.ModelViewSet):
#     queryset = Assessment.objects.all()
#     serializer_class = AssessmentUploadSerializer

#     # def perform_create(self, serializer):
#     #     assessment = serializer.save(uploaded_by=self.request.user, tenant=self.request.user.tenant)
#     #     if assessment.source_type == 'pdf' and assessment.pdf_file:
#     #         process_assessment_pdf.delay(assessment.id)


#     def perform_create(self, serializer):
#         assessment = serializer.save()
#         # if assessment.source_type == 'pdf' and assessment.pdf_file:
#         #     process_assessment_pdf.delay(assessment.id)
