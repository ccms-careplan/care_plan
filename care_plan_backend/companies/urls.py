from rest_framework import routers
from .views import CompanyViewSet, CompanyUserViewSet

router = routers.DefaultRouter()
router.register('companies', CompanyViewSet)
router.register('company-users', CompanyUserViewSet)

urlpatterns = router.urls
