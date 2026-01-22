# # careplans/models.py
# from django.db import models
# from residents.models import Resident
# from assessments.models import Assessment
# from companies.models import Company

# class CarePlan(models.Model):
#     PLAN_TYPE_CHOICES = (
#         ('ai', 'AI Generated'),
#         ('manual', 'Manual'),
#     )

#     company = models.ForeignKey(Company, on_delete=models.CASCADE)
#     resident = models.ForeignKey(Resident, on_delete=models.CASCADE)
#     assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)

#     title = models.CharField(max_length=255)  # e.g. "Care Plan Option A"
#     content = models.JSONField()              # structured plan
#     plan_type = models.CharField(
#         max_length=10, choices=PLAN_TYPE_CHOICES, default='ai'
#     )

#     created_by = models.ForeignKey(
#         "auth.User", on_delete=models.SET_NULL, null=True
#     )

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.title} - {self.resident.full_name}"


















from django.db import models
from residents.models import Resident
from assessments.models import Assessment
from companies.models import Company

class CarePlan(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)

    content = models.JSONField()     # structured AI-generated plan
    generated_by = models.CharField(max_length=20, default='ai')

    pdf_file = models.FileField(
        upload_to="careplans/",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"CarePlan for {self.resident.full_name}"
