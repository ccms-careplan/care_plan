from rest_framework import serializers
from .models import CarePlan

class CarePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarePlan
        fields = '__all__'
