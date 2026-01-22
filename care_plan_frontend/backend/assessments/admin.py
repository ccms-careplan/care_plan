from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Patient, Assessment, AssessmentChunk

admin.site.register(Patient)
admin.site.register(Assessment)
admin.site.register(AssessmentChunk)
