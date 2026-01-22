from rest_framework import routers
from .views import AssessmentViewSet

router = routers.DefaultRouter()
router.register('assessments', AssessmentViewSet)

urlpatterns = router.urls
