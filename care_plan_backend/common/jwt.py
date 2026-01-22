from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from companies.models import CompanyUser

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        try:
            company_user = CompanyUser.objects.get(user=user)
            token['role'] = company_user.role
            token['company_id'] = company_user.company_id
            token['company_name'] = company_user.company.company_name

        except CompanyUser.DoesNotExist:
            token['role'] = None
            token['company_id'] = None
            token['company_name'] = None

        token['username'] = user.username
        return token 
