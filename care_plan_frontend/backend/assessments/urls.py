# from django.urls import path
# from .views import UploadAssessmentView

# urlpatterns = [
#     path("upload/", UploadAssessmentView.as_view(), name="assessment-upload"),
# ]


# from django.urls import path
# from .views import UploadAndExtractView

# urlpatterns = [
#     path("upload/", UploadAndExtractView.as_view(), name="upload-and-extract"),
# ]


# from django.urls import path
# from .views import UploadAssessmentView

# urlpatterns = [
#     path("assessments/upload/", UploadAssessmentView.as_view()),
# ]
from django.urls import path
from .views import UploadAssessmentView, HealthView

urlpatterns = [
    path("health/", HealthView.as_view()),
    path("upload/", UploadAssessmentView.as_view()),
]
