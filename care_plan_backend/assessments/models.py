from django.db import models
from residents.models import Resident
from companies.models import Company

class Assessment(models.Model):
    SOURCE_TYPES = (('pdf', 'PDF Upload'), ('manual', 'Manual Input'))

    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE)
    
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    # pdf_file = models.FileField(upload_to='assessments/doc', null=True, blank=True)

    document_file = models.FileField(upload_to="assessments/doc", null=True, blank=True)

    raw_extracted_text = models.TextField(blank=True)
    structured_data = models.JSONField(blank=True, null=True)

    status = models.CharField(
        max_length=30,
        default='pending',
        choices=[('pending', 'Pending'), ('processing', 'Processing'),
                 ('ready', 'Ready'), ('failed', 'Failed')]
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Assessment {self.id} - {self.resident.full_name}"
