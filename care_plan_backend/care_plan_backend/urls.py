from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from common.views import CustomTokenObtainPairView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('companies.urls')),
    path('api/', include('residents.urls')),
    path('api/', include('assessments.urls')),
    path('api/', include('careplans.urls')),
    path('api/', include('billing.urls')),
    path('api/', include('common.urls')),
    path('api/', include('notifications.urls')),

    #path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


