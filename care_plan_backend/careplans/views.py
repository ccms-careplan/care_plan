from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from assessments.models import Assessment
from django.http import FileResponse
from .service.pdf_generator import generate_careplan_pdf
from .models import CarePlan
from .serializers import CarePlanSerializer
from .services import generate_care_plan_content

class CarePlanViewSet(viewsets.ModelViewSet):

    queryset = CarePlan.objects.all()
    serializer_class = CarePlanSerializer

    @action(detail=False, methods=["post"], url_path="generate-from-assessment")
    def generate_from_assessment(self, request):
        assessment_id = request.data.get("assessment_id")

        if not assessment_id:
            return Response(
                {"error": "assessment_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            assessment = Assessment.objects.get(id=assessment_id, status="ready")
        except Assessment.DoesNotExist:
            return Response(
                {"error": "Assessment not found or not ready"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent duplicates
        existing = CarePlan.objects.filter(assessment=assessment).first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        content = generate_care_plan_content(assessment)

        care_plan = CarePlan.objects.create(
            company=assessment.company,
            resident=assessment.resident,
            assessment=assessment,
            content=content,
            generated_by="ai",
        )

        serializer = self.get_serializer(care_plan)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

    @action(detail=True, methods=["post"], url_path="generate-pdf")
    def generate_pdf(self, request, pk=None):
        care_plan = self.get_object()

        if not care_plan.pdf_file:
            generate_careplan_pdf(care_plan)

        return Response({
            "pdf_url": care_plan.pdf_file.url
        })
    

    @action(detail=True, methods=["get"], url_path="download-pdf")
    def download_pdf(self, request, pk=None):
        care_plan = self.get_object()

        if not care_plan.pdf_file:
            return Response(
                {"error": "PDF not generated"},
                status=status.HTTP_404_NOT_FOUND
            )

        return FileResponse(
            care_plan.pdf_file.open(),
            as_attachment=True,
            filename=f"careplan_{care_plan.id}.pdf"
        )













# from rest_framework import viewsets
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from django.http import FileResponse

# from .models import CarePlan
# from .serializers import CarePlanSerializer
# # from .pdf import generate_careplan_pdf


# class CarePlanViewSet(viewsets.ModelViewSet):
#     queryset = CarePlan.objects.all()
#     serializer_class = CarePlanSerializer

#     @action(detail=True, methods=['post'])
#     def pdf(self, request, pk=None):
#         careplan = self.get_object()
#         pdf_path = generate_careplan_pdf(careplan)

#         return FileResponse(
#             open(pdf_path, "rb"),
#             content_type="application/pdf",
#             filename=f"careplan_{careplan.id}.pdf"
#         )









# from rest_framework import viewsets
# from .models import CarePlan
# from .serializers import CarePlanSerializer

# class CarePlanViewSet(viewsets.ModelViewSet):
#     queryset = CarePlan.objects.all()
#     serializer_class = CarePlanSerializer
