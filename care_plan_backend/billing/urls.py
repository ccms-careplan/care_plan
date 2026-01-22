from rest_framework import routers
from .views import SubscriptionViewSet

router = routers.DefaultRouter()
router.register(r'subscriptions', SubscriptionViewSet, basename='billing')
# router.register(r'residents', ResidentViewSet, basename='resident')
urlpatterns = router.urls
