from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Import models and auth
from models import User, Technique, Favorite
from auth import get_current_user, get_password_hash, authenticate_user, create_access_token
from payments import payments_router
from models import *
from auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token, 
    get_current_user,
    get_current_user_optional,
    get_premium_user
)

# Import payments router  
from payment_models import *
from payments import payments_router

# Import crypto payments router
from crypto_payments import crypto_router

# Import reviews analytics router
from reviews_analytics import reviews_router
from spotify_auth import router as spotify_router

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create the main app without a prefix
app = FastAPI(title="ZenPress API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

SEED_TECHNIQUES = []
SEED_TECHNIQUES = []

# Authentication endpoints
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password
    )
    
    await db.users.insert_one(user.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(
        access_token=access_token,
        user=UserResponse(**user.dict())
    )

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return Token(
        access_token=access_token,
        user=UserResponse(**user)
    )

# User endpoints
@api_router.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@api_router.get("/users/stats", response_model=UserStats)
async def get_user_stats(current_user: UserResponse = Depends(get_current_user)):
    # Get user sessions
    sessions = await db.sessions.find({"user_id": current_user.id}).to_list(1000)
    
    if not sessions:
        return UserStats(
            total_sessions=0,
            avg_rating=0.0,
            most_used_complaint="",
            total_time_practiced=0,
            streak_days=0,
            favorite_techniques=[]
        )
    
    # Calculate stats
    total_sessions = len(sessions)
    avg_rating = sum(s.get("rating", 0) for s in sessions if s.get("rating")) / len([s for s in sessions if s.get("rating")]) if any(s.get("rating") for s in sessions) else 0
    
    # Most used complaint
    complaints = {}
    for session in sessions:
        complaint = session.get("complaint", "")
        complaints[complaint] = complaints.get(complaint, 0) + 1
    
    most_used_complaint = max(complaints.items(), key=lambda x: x[1])[0] if complaints else ""
    total_time_practiced = sum(s.get("duration", 0) for s in sessions)
    
    # Get favorites
    favorites = await db.favorites.find({"user_id": current_user.id}).to_list(100)
    favorite_techniques = [f["technique_id"] for f in favorites]
    
    return UserStats(
        total_sessions=total_sessions,
        avg_rating=round(avg_rating, 1),
        most_used_complaint=most_used_complaint,
        total_time_practiced=total_time_practiced,
        streak_days=0,  # TODO: Calculate streak
        favorite_techniques=favorite_techniques
    )

# Technique endpoints
@api_router.get("/techniques", response_model=List[Technique])
async def get_techniques(
    category: Optional[str] = None, 
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    query = {}
    if category:
        query["category"] = category
    
    # If user is not logged in or not premium, only show non-premium content
    if not current_user or not current_user.is_premium:
        query["is_premium"] = False
    
    techniques = await db.techniques.find(query).to_list(100)
    return [Technique(**technique) for technique in techniques]

@api_router.get("/techniques/{technique_id}", response_model=Technique)
async def get_technique(technique_id: str, current_user: Optional[UserResponse] = Depends(get_current_user_optional)):
    technique = await db.techniques.find_one({"id": technique_id})
    if not technique:
        raise HTTPException(status_code=404, detail="Technique not found")
    
    # Check premium access
    if technique.get("is_premium", False):
        if not current_user or not current_user.is_premium:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Premium subscription required"
            )
    
    return Technique(**technique)

# Session endpoints
@api_router.post("/sessions", response_model=Session)
async def create_session(
    session_data: SessionCreate, 
    current_user: UserResponse = Depends(get_current_user)
):
    # Get technique info
    technique = await db.techniques.find_one({"id": session_data.technique_id})
    if not technique:
        raise HTTPException(status_code=404, detail="Technique not found")
    
    session = Session(
        user_id=current_user.id,
        technique_id=session_data.technique_id,
        technique_name=technique["name"],
        complaint=session_data.complaint,
        duration=session_data.duration,
        rating=session_data.rating
    )
    
    await db.sessions.insert_one(session.dict())
    return session

@api_router.get("/sessions", response_model=List[Session])
async def get_user_sessions(current_user: UserResponse = Depends(get_current_user)):
    sessions = await db.sessions.find({"user_id": current_user.id}).sort("date", -1).to_list(100)
    return [Session(**session) for session in sessions]

# Favorites endpoints
@api_router.post("/favorites", response_model=Favorite)
async def add_favorite(
    favorite_data: FavoriteCreate, 
    current_user: UserResponse = Depends(get_current_user)
):
    # Check if already favorited
    existing = await db.favorites.find_one({
        "user_id": current_user.id,
        "technique_id": favorite_data.technique_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")
    
    favorite = Favorite(
        user_id=current_user.id,
        technique_id=favorite_data.technique_id
    )
    
    await db.favorites.insert_one(favorite.dict())
    return favorite

@api_router.delete("/favorites/{technique_id}")
async def remove_favorite(
    technique_id: str, 
    current_user: UserResponse = Depends(get_current_user)
):
    result = await db.favorites.delete_one({
        "user_id": current_user.id,
        "technique_id": technique_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Favorite removed"}

@api_router.get("/favorites", response_model=List[Technique])
async def get_user_favorites(current_user: UserResponse = Depends(get_current_user)):
    favorites = await db.favorites.find({"user_id": current_user.id}).to_list(100)
    technique_ids = [f["technique_id"] for f in favorites]
    
    if not technique_ids:
        return []
    
    techniques = await db.techniques.find({"id": {"$in": technique_ids}}).to_list(100)
    return [Technique(**technique) for technique in techniques]

# Premium subscription endpoints
@api_router.post("/subscription/create", response_model=Subscription)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    # Calculate expiration date
    if subscription_data.plan == "monthly":
        expires_at = datetime.utcnow() + timedelta(days=30)
        amount = 29.90
    elif subscription_data.plan == "yearly":
        expires_at = datetime.utcnow() + timedelta(days=365)
        amount = 299.90
    else:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # Create subscription
    subscription = Subscription(
        user_id=current_user.id,
        plan=subscription_data.plan,
        expires_at=expires_at,
        amount_paid=amount
    )
    
    await db.subscriptions.insert_one(subscription.dict())
    
    # Update user to premium
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"is_premium": True, "subscription_expires": expires_at}}
    )
    
    return subscription

# Statistics endpoints
@api_router.get("/stats/complaints", response_model=List[ComplaintStats])
async def get_complaint_stats():
    # Aggregate complaint statistics from all sessions
    pipeline = [
        {"$group": {"_id": "$complaint", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    
    results = await db.sessions.aggregate(pipeline).to_list(10)
    
    # Mock trending data for now
    trending_complaints = ["Dor de cabeça tensional", "Ansiedade e stress", "Insônia", "Enxaqueca"]
    
    stats = []
    for result in results:
        stats.append(ComplaintStats(
            complaint=result["_id"],
            count=result["count"],
            trending=result["_id"] in trending_complaints
        ))
    
    return stats

# Seed data endpoint has been removed - use seed_database.py instead

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "ZenPress API - Sistema de Acupressão e Craniopuntura"}

# Launch strategy endpoint
@api_router.get("/launch-strategy")
async def get_launch_strategy():
    return {
        "title": "Estratégia de Lançamento Internacional",
        "description": "Como fazer o lançamento do app somente no exterior primeiro",
        "steps": [
            {
                "step": 1,
                "title": "Configuração de Região na Google Play Store",
                "description": "Configure a distribuição do app para países específicos na Google Play Console",
                "details": [
                    "Acesse Google Play Console > Versão de produção",
                    "Vá para 'Países e regiões'",
                    "Selecione apenas países de interesse (ex: EUA, Canadá, Europa)",
                    "Remova o Brasil da lista inicial"
                ]
            },
            {
                "step": 2,
                "title": "App Store (iOS) - Configuração Regional",
                "description": "Configure a distribuição para iOS em regiões específicas",
                "details": [
                    "App Store Connect > Meu App > Distribuição",
                    "Selecione territórios de interesse",
                    "Configure preços em moedas locais",
                    "Remova Brasil da distribuição inicial"
                ]
            },
            {
                "step": 3,
                "title": "Adaptação de Conteúdo e Preços",
                "description": "Ajuste preços e conteúdo para mercados internacionais",
                "details": [
                    "Defina preços em USD/EUR para mercados internacionais",
                    "Ajuste traduções para inglês/espanhol",
                    "Configure métodos de pagamento locais",
                    "Adapte conteúdo médico para regulamentações locais"
                ]
            },
            {
                "step": 4,
                "title": "Lançamento Gradual (Soft Launch)",
                "description": "Teste em países menores antes de grandes mercados",
                "details": [
                    "Inicie com países como Canadá, Austrália, Nova Zelândia",
                    "Monitore métricas de uso e feedback",
                    "Ajuste com base no feedback recebido",
                    "Expanda gradualmente para EUA e Europa"
                ]
            },
            {
                "step": 5,
                "title": "Análise e Expansão",
                "description": "Monitore performance antes de lançar no Brasil",
                "details": [
                    "Analise dados de uso e retenção",
                    "Colete feedback dos usuários internacionais",
                    "Otimize com base nos dados coletados",
                    "Após sucesso internacional, considere lançamento no Brasil"
                ]
            }
        ],
        "benefits": [
            "Teste com mercados menos competitivos",
            "Validação internacional antes do mercado doméstico",
            "Possibilidade de ajustes baseados em feedback global",
            "Redução de riscos no lançamento principal"
        ],
        "considerations": [
            "Regulamentações médicas podem variar por país",
            "Adaptação de conteúdo pode ser necessária",
            "Suporte ao cliente em diferentes idiomas",
            "Métodos de pagamento locais podem ser necessários"
        ]
    }

# Include the router in the main app
app.include_router(api_router)
app.include_router(payments_router)
app.include_router(crypto_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(spotify_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()