from rest_framework import routers
from .views import ResidentViewSet

router = routers.DefaultRouter()
# router.register('residents', ResidentViewSet)
router.register(r'residents', ResidentViewSet, basename='resident')

urlpatterns = router.urls
