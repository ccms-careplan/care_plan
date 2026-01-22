from django.db import models
from companies.models import Company

class Subscription(models.Model):
    PLAN_CHOICES = (('basic', 'Basic'), ('pro', 'Pro'))

    company = models.OneToOneField(Company, on_delete=models.CASCADE)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    is_active = models.BooleanField(default=True)

    stripe_customer_id = models.CharField(max_length=255, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    renewed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company.name} - {self.plan}"
