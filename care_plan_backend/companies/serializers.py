from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Company, CompanyUser


class CompanyCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)

    class Meta:
        model = Company
        fields = (
            'id',
            'company_name',
            'email',
            'phone',
            'address',
            'username',
            'password',
            
        )

    def create(self, validated_data):
        # extract admin data
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        

        # create company
        company = Company.objects.create(**validated_data)

        # create user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            is_staff=True
        )

        # create company user with role client_admin
        CompanyUser.objects.create(
            user=user,
            company=company,
            role='client_admin'
        )

        return company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


class CompanyUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyUser
        fields = '__all__'
