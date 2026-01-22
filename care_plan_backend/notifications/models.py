from django.db import models
from companies.models import Company
from residents.models import Resident

class Notification(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    resident = models.ForeignKey(Resident, null=True, blank=True, on_delete=models.SET_NULL)

    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
