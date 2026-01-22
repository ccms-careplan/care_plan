from rest_framework import viewsets
from rest_framework.response import Response
from residents.utils import get_user_company
from .models import Resident
from .serializers import ResidentSerializer

# class ResidentViewSet(viewsets.ModelViewSet):
#     queryset = Resident.objects.all()
#     serializer_class = ResidentSerializer


class ResidentViewSet(viewsets.ModelViewSet):
    serializer_class = ResidentSerializer

    def get_queryset(self):
        company = get_user_company(self.request.user)
        return Resident.objects.filter(company=company)

    def perform_create(self, serializer):
        company = get_user_company(self.request.user)
        serializer.save(company=company)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "count": queryset.count(),
            "results": serializer.data
        })