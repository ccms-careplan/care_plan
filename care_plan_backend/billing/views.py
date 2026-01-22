# billing/views.py
import stripe
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Subscription
from .serializers import SubscriptionSerializer
from residents.utils import get_user_company

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer

    def get_queryset(self):
        company = get_user_company(self.request.user)
        return Subscription.objects.filter(company=company)

    def perform_create(self, serializer):
        company = get_user_company(self.request.user)

        customer = stripe.Customer.create(
            name=company.name,
            email=company.email
        )

        serializer.save(
            company=company,
            stripe_customer_id=customer.id
        )



# from rest_framework import viewsets
# from .models import Subscription
# from .serializers import SubscriptionSerializer

# class SubscriptionViewSet(viewsets.ModelViewSet):
#     queryset = Subscription.objects.all()
#     serializer_class = SubscriptionSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    payload = request.body
    sig = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig,
            settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return Response(status=400)

    # PAYMENT SUCCEEDED
    if event['type'] == 'invoice.payment_succeeded':
        customer_id = event['data']['object']['customer']

        try:
            subscription = Subscription.objects.get(
                stripe_customer_id=customer_id
            )
            subscription.is_active = True
            subscription.save()
        except Subscription.DoesNotExist:
            pass

    # PAYMENT FAILED
    elif event['type'] == 'invoice.payment_failed':
        customer_id = event['data']['object']['customer']

        Subscription.objects.filter(
            stripe_customer_id=customer_id
        ).update(is_active=False)

    return Response(status=200)
