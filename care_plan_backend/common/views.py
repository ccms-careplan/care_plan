from rest_framework_simplejwt.views import TokenObtainPairView
from .jwt import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer







from rest_framework import viewsets
from .models import Country
from .serializers import CountrySerializer

class CountryViewSet(viewsets.ModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
