from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Company, CompanyUser
from .serializers import CompanySerializer, CompanyUserSerializer, CompanyCreateSerializer

# class CompanyViewSet(viewsets.ModelViewSet):
#     queryset = Company.objects.all()
#     serializer_class = CompanySerializer

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()

    # if role == 'master_super_admin' and CompanyUser.objects.filter(role='master_super_admin').exists():
    # raise ValidationError("Only one Master Super Admin is allowed.")
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]   #
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return CompanyCreateSerializer
        return CompanySerializer


class CompanyUserViewSet(viewsets.ModelViewSet):
    queryset = CompanyUser.objects.all()
    serializer_class = CompanyUserSerializer
