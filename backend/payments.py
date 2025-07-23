from fastapi import APIRouter, HTTPException, Depends, status
from stripe_mock import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from payment_models import *
from auth import get_current_user
from models import UserResponse
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection (same as server.py)
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Initialize Stripe
stripe_api_key = os.environ.get("STRIPE_API_KEY")
if not stripe_api_key:
    raise ValueError("STRIPE_API_KEY environment variable is required")

stripe_checkout = StripeCheckout(api_key=stripe_api_key)

# Create router
payments_router = APIRouter(prefix="/api/payments/v1", tags=["payments"])

@payments_router.post("/checkout/session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    checkout_request: CheckoutRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a Stripe checkout session for payment"""
    
    # Validate product exists
    if checkout_request.product_id not in PRODUCT_PACKAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Produto inválido: {checkout_request.product_id}"
        )
    
    product = PRODUCT_PACKAGES[checkout_request.product_id]
    
    # Security: Get amount from server-side definition only
    amount = product.price * checkout_request.quantity
    
    # Build URLs from provided origin
    success_url = f"{checkout_request.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_request.origin_url}/payment/cancel"
    
    # Prepare metadata
    metadata = {
        "user_id": current_user.id,
        "product_type": checkout_request.product_type,
        "product_id": checkout_request.product_id,
        "quantity": str(checkout_request.quantity),
        **(checkout_request.metadata or {})
    }
    
    try:
        # Create checkout session request
        session_request = CheckoutSessionRequest(
            amount=amount,
            currency="brl",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        # Create checkout session with Stripe
        session = await stripe_checkout.create_checkout_session(session_request)
        
        # Create payment transaction record BEFORE redirect
        payment_transaction = PaymentTransaction(
            user_id=current_user.id,
            session_id=session.session_id,
            amount=amount,
            currency="brl",
            product_type=checkout_request.product_type,
            product_id=checkout_request.product_id,
            metadata=metadata,
            payment_status="pending",
            status="initiated"
        )
        
        await db.payment_transactions.insert_one(payment_transaction.dict())
        
        return session
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao criar sessão de checkout: {str(e)}"
        )

@payments_router.get("/checkout/status/{session_id}", response_model=CheckoutStatusResponse)
async def get_checkout_status(
    session_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get checkout session status and update payment transaction"""
    
    try:
        # Get status from Stripe
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Find existing payment transaction
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        if not transaction:
            raise HTTPException(
                status_code=404,
                detail="Transação de pagamento não encontrada"
            )
        
        # Update transaction status if not already processed
        if transaction["payment_status"] != "paid":
            update_data = {
                "payment_status": checkout_status.payment_status,
                "status": checkout_status.status,
                "updated_at": datetime.utcnow()
            }
            
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": update_data}
            )
            
            # If payment is successful, activate the purchased product
            if checkout_status.payment_status == "paid":
                await activate_purchased_product(transaction)
        
        return checkout_status
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao verificar status do pagamento: {str(e)}"
        )

async def activate_purchased_product(transaction: dict):
    """Activate the purchased product based on transaction data"""
    
    product_type = transaction["product_type"]
    product_id = transaction["product_id"]
    user_id = transaction["user_id"]
    
    try:
        if product_type == "premium_subscription":
            # Activate premium subscription
            if "monthly" in product_id:
                expires_at = datetime.utcnow() + timedelta(days=30)
            elif "annual" in product_id:
                expires_at = datetime.utcnow() + timedelta(days=365)
            else:
                expires_at = datetime.utcnow() + timedelta(days=30)
            
            # Update user to premium
            await db.users.update_one(
                {"id": user_id},
                {"$set": {
                    "is_premium": True,
                    "subscription_expires": expires_at,
                    "subscription_type": product_id
                }}
            )
            
        elif product_type == "course":
            # Enroll user in course
            enrollment = CourseEnrollment(
                user_id=user_id,
                course_id=product_id,
                payment_transaction_id=transaction["id"]
            )
            await db.course_enrollments.insert_one(enrollment.dict())
            
        elif product_type == "corporate":
            # Create corporate plan (requires additional setup)
            corporate_plan = CorporatePlan(
                company_name=transaction["metadata"].get("company_name", ""),
                contact_email=transaction["metadata"].get("contact_email", ""),
                contact_name=transaction["metadata"].get("contact_name", ""),
                plan_type=product_id,
                max_users=PRODUCT_PACKAGES[product_id].max_users,
                monthly_price=PRODUCT_PACKAGES[product_id].price,
                features=PRODUCT_PACKAGES[product_id].features,
                payment_transaction_id=transaction["id"],
                expires_at=datetime.utcnow() + timedelta(days=30)
            )
            await db.corporate_plans.insert_one(corporate_plan.dict())
            
        elif product_type == "analytics":
            # Create analytics subscription
            analytics_sub = AnalyticsSubscription(
                company_name=transaction["metadata"].get("company_name", ""),
                contact_email=transaction["metadata"].get("contact_email", ""),
                contact_name=transaction["metadata"].get("contact_name", ""),
                plan_type=product_id,
                monthly_price=PRODUCT_PACKAGES[product_id].price,
                data_access_level="basic" if "basic" in product_id else "advanced" if "professional" in product_id else "full",
                api_calls_limit=1000 if "basic" in product_id else 5000 if "professional" in product_id else 999999,
                payment_transaction_id=transaction["id"],
                expires_at=datetime.utcnow() + timedelta(days=30)
            )
            await db.analytics_subscriptions.insert_one(analytics_sub.dict())
            
    except Exception as e:
        print(f"Erro ao ativar produto: {str(e)}")
        # Log error but don't fail the payment verification

# Product listing endpoints
@payments_router.get("/products", response_model=List[ProductPackage])
async def get_products(product_type: Optional[str] = None):
    """Get available product packages"""
    products = list(PRODUCT_PACKAGES.values())
    
    if product_type:
        products = [p for p in products if p.type == product_type]
    
    return products

@payments_router.get("/products/{product_id}", response_model=ProductPackage)
async def get_product(product_id: str):
    """Get specific product package"""
    if product_id not in PRODUCT_PACKAGES:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )
    
    return PRODUCT_PACKAGES[product_id]

# Course endpoints
@payments_router.get("/courses", response_model=List[Course])
async def get_courses():
    """Get available courses"""
    return list(COURSE_CATALOG.values())

@payments_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    """Get specific course"""
    if course_id not in COURSE_CATALOG:
        raise HTTPException(
            status_code=404,
            detail="Curso não encontrado"
        )
    
    return COURSE_CATALOG[course_id]

@payments_router.get("/my-courses", response_model=List[Course])
async def get_my_courses(current_user: UserResponse = Depends(get_current_user)):
    """Get user's enrolled courses"""
    enrollments = await db.course_enrollments.find({"user_id": current_user.id}).to_list(100)
    course_ids = [e["course_id"] for e in enrollments]
    
    courses = []
    for course_id in course_ids:
        if course_id in COURSE_CATALOG:
            courses.append(COURSE_CATALOG[course_id])
    
    return courses

# Transaction history
@payments_router.get("/transactions", response_model=List[PaymentTransaction])
async def get_user_transactions(current_user: UserResponse = Depends(get_current_user)):
    """Get user's payment transaction history"""
    transactions = await db.payment_transactions.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).to_list(100)
    
    return [PaymentTransaction(**transaction) for transaction in transactions]

# Admin endpoints (could be protected with admin role)
@payments_router.get("/admin/transactions", response_model=List[PaymentTransaction])
async def get_all_transactions(current_user: UserResponse = Depends(get_current_user)):
    """Get all payment transactions (admin only)"""
    # TODO: Add admin role check
    transactions = await db.payment_transactions.find().sort("created_at", -1).to_list(1000)
    return [PaymentTransaction(**transaction) for transaction in transactions]

@payments_router.get("/admin/revenue")
async def get_revenue_stats(current_user: UserResponse = Depends(get_current_user)):
    """Get revenue statistics (admin only)"""
    # TODO: Add admin role check
    
    # Calculate revenue by product type
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {
            "_id": "$product_type",
            "total_revenue": {"$sum": "$amount"},
            "total_transactions": {"$sum": 1}
        }}
    ]
    
    revenue_stats = await db.payment_transactions.aggregate(pipeline).to_list(100)
    
    return {
        "revenue_by_type": revenue_stats,
        "total_revenue": sum(stat["total_revenue"] for stat in revenue_stats),
        "total_transactions": sum(stat["total_transactions"] for stat in revenue_stats)
    }
