from django.db import models
from django.contrib.auth.models import User

class Company(models.Model):
    company_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)

    # subscription/billing link
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class CompanyUser(models.Model):
    ROLE_CHOICES = (
        ('master_super_admin', 'Master Super Admin'),
        ('super_admin', 'Super Admin'),
        ('client_admin', 'Client admin'),
        ('nurse', 'Nurse'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.company.name}"
