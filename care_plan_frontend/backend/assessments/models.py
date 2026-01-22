# from django.db import models

# class Patient(models.Model):
#     full_name = models.CharField(max_length=255)
#     dob = models.CharField(max_length=50, blank=True, null=True)

#     def __str__(self):
#         return self.full_name

# class Assessment(models.Model):
#     patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="assessments")
#     source_file = models.FileField(upload_to="assessments/")
#     extracted_json = models.JSONField(blank=True, null=True)   # final merged JSON
#     status = models.CharField(max_length=50, default="extracted")  # uploaded/extracting/extracted/failed
#     error_message = models.TextField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)


from django.db import models

class Patient(models.Model):
    full_name = models.CharField(max_length=255)
    dob = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.full_name

class Assessment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="assessments")
    source_file = models.FileField(upload_to="assessments/")
    status = models.CharField(max_length=50, default="uploaded")  # uploaded/extracting/extracted/failed
    extracted_json = models.JSONField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class AssessmentChunk(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="chunks")
    page_start = models.IntegerField()
    page_end = models.IntegerField()
    text = models.TextField()
    embedding = models.JSONField(null=True, blank=True)  # list[float]
    created_at = models.DateTimeField(auto_now_add=True)
