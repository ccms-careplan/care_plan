from rest_framework import routers
from .views import CountryViewSet

router = routers.DefaultRouter()
router.register('countries', CountryViewSet)

urlpatterns = router.urls
