from django.db import models
from companies.models import Company

class Resident(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    room_number = models.CharField(max_length=50, blank=True)
    medical_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name
