# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static

# urlpatterns = [
#     path("admin/", admin.site.urls),
#     path("api/assessments/", include("assessments.urls")),
# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# careease_backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("assessments.urls")),
]
