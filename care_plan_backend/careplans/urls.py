from rest_framework import routers
from .views import CarePlanViewSet

router = routers.DefaultRouter()
router.register('careplans', CarePlanViewSet)

urlpatterns = router.urls
