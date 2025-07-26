# Mock para emergentintegrations - apenas para deploy público
from typing import Optional, Dict, Any
from pydantic import BaseModel
import stripe
import os

# Stripe configuration
stripe.api_key = os.environ.get("STRIPE_API_KEY")

class CheckoutSessionRequest(BaseModel):
    price_id: str
    success_url: str = "https://xzenpress.com/success"
    cancel_url: str = "https://xzenpress.com/payment"
    customer_email: Optional[str] = None

class CheckoutSessionResponse(BaseModel):
    url: str
    session_id: str

class CheckoutStatusResponse(BaseModel):
    status: str
    session_id: str

class StripeCheckout:
    def __init__(self, api_key: str):
        stripe.api_key = api_key
    
    def create_checkout_session(self, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': request.price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=request.success_url,
                cancel_url=request.cancel_url,
                customer_email=request.customer_email
            )
            return CheckoutSessionResponse(url=session.url, session_id=session.id)
        except Exception as e:
            raise Exception(f"Stripe checkout error: {str(e)}")
    
    def get_checkout_status(self, session_id: str) -> CheckoutStatusResponse:
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return CheckoutStatusResponse(status=session.payment_status, session_id=session_id)
        except Exception as e:
            raise Exception(f"Stripe status error: {str(e)}")