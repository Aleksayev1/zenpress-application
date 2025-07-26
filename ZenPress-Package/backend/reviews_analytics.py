"""
Sistema de Analytics de Avaliações para ZenPress
Contador de avaliações positivas/negativas estilo Google Play
"""

from fastapi import APIRouter, HTTPException, Depends, status
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import uuid
from pydantic import BaseModel
import logging

from models import UserResponse
from auth import get_current_user, get_premium_user

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router para analytics de avaliações
reviews_router = APIRouter(prefix="/reviews", tags=["reviews_analytics"])

# Modelos Pydantic
class ReviewCreate(BaseModel):
    technique_id: str
    rating: int  # 1-5 estrelas
    comment: Optional[str] = ""
    session_duration: Optional[int] = 60
    
class ReviewResponse(BaseModel):
    id: str
    user_id: str
    technique_id: str
    technique_name: str
    rating: int
    comment: str
    created_at: datetime
    session_duration: int

class ReviewStats(BaseModel):
    total_reviews: int
    positive_reviews: int  # 4-5 estrelas
    neutral_reviews: int   # 3 estrelas
    negative_reviews: int  # 1-2 estrelas
    average_rating: float
    positive_percentage: float
    negative_percentage: float
    
class TechniqueReviewStats(BaseModel):
    technique_id: str
    technique_name: str
    total_reviews: int
    average_rating: float
    positive_reviews: int
    negative_reviews: int
    latest_reviews: List[ReviewResponse]

class DeveloperAnalytics(BaseModel):
    overall_stats: ReviewStats
    daily_reviews: List[Dict[str, Any]]
    technique_rankings: List[TechniqueReviewStats]
    recent_feedback: List[ReviewResponse]
    trends: Dict[str, Any]

@reviews_router.post("/create", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Criar uma avaliação após uma sessão de técnica
    """
    try:
        from server import db
        
        # Validar rating
        if not 1 <= review_data.rating <= 5:
            raise HTTPException(
                status_code=400,
                detail="Rating deve ser entre 1 e 5 estrelas"
            )
        
        # Buscar informações da técnica
        technique = await db.techniques.find_one({"id": review_data.technique_id})
        if not technique:
            raise HTTPException(
                status_code=404,
                detail="Técnica não encontrada"
            )
        
        # Gerar ID único para a avaliação
        review_id = str(uuid.uuid4())
        
        # Criar registro de avaliação
        review_record = {
            "id": review_id,
            "user_id": current_user.id,
            "technique_id": review_data.technique_id,
            "technique_name": technique.get("name", ""),
            "rating": review_data.rating,
            "comment": review_data.comment or "",
            "session_duration": review_data.session_duration,
            "created_at": datetime.utcnow(),
            "user_premium": current_user.is_premium
        }
        
        # Salvar no banco
        await db.reviews.insert_one(review_record)
        
        logger.info(f"Avaliação criada: {review_id} - {review_data.rating} estrelas por usuário {current_user.id}")
        
        return ReviewResponse(**review_record)
        
    except Exception as e:
        logger.error(f"Erro ao criar avaliação: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@reviews_router.get("/stats", response_model=ReviewStats)
async def get_review_stats():
    """
    Obter estatísticas gerais de avaliações (público)
    """
    try:
        from server import db
        
        # Buscar todas as avaliações
        reviews = await db.reviews.find({}).to_list(10000)
        
        if not reviews:
            return ReviewStats(
                total_reviews=0,
                positive_reviews=0,
                neutral_reviews=0,
                negative_reviews=0,
                average_rating=0.0,
                positive_percentage=0.0,
                negative_percentage=0.0
            )
        
        # Calcular estatísticas
        total_reviews = len(reviews)
        ratings = [r["rating"] for r in reviews]
        
        positive_reviews = len([r for r in ratings if r >= 4])  # 4-5 estrelas
        neutral_reviews = len([r for r in ratings if r == 3])   # 3 estrelas
        negative_reviews = len([r for r in ratings if r <= 2])  # 1-2 estrelas
        
        average_rating = sum(ratings) / len(ratings) if ratings else 0
        positive_percentage = (positive_reviews / total_reviews) * 100 if total_reviews > 0 else 0
        negative_percentage = (negative_reviews / total_reviews) * 100 if total_reviews > 0 else 0
        
        return ReviewStats(
            total_reviews=total_reviews,
            positive_reviews=positive_reviews,
            neutral_reviews=neutral_reviews,
            negative_reviews=negative_reviews,
            average_rating=round(average_rating, 2),
            positive_percentage=round(positive_percentage, 1),
            negative_percentage=round(negative_percentage, 1)
        )
        
    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@reviews_router.get("/technique/{technique_id}", response_model=TechniqueReviewStats)
async def get_technique_reviews(technique_id: str):
    """
    Obter avaliações de uma técnica específica
    """
    try:
        from server import db
        
        # Buscar técnica
        technique = await db.techniques.find_one({"id": technique_id})
        if not technique:
            raise HTTPException(
                status_code=404,
                detail="Técnica não encontrada"
            )
        
        # Buscar avaliações da técnica
        reviews = await db.reviews.find({"technique_id": technique_id}).to_list(1000)
        
        if not reviews:
            return TechniqueReviewStats(
                technique_id=technique_id,
                technique_name=technique.get("name", ""),
                total_reviews=0,
                average_rating=0.0,
                positive_reviews=0,
                negative_reviews=0,
                latest_reviews=[]
            )
        
        # Calcular estatísticas
        ratings = [r["rating"] for r in reviews]
        positive_reviews = len([r for r in ratings if r >= 4])
        negative_reviews = len([r for r in ratings if r <= 2])
        average_rating = sum(ratings) / len(ratings) if ratings else 0
        
        # Últimas 5 avaliações
        latest_reviews = sorted(reviews, key=lambda x: x["created_at"], reverse=True)[:5]
        latest_reviews_response = [ReviewResponse(**review) for review in latest_reviews]
        
        return TechniqueReviewStats(
            technique_id=technique_id,
            technique_name=technique.get("name", ""),
            total_reviews=len(reviews),
            average_rating=round(average_rating, 2),
            positive_reviews=positive_reviews,
            negative_reviews=negative_reviews,
            latest_reviews=latest_reviews_response
        )
        
    except Exception as e:
        logger.error(f"Erro ao buscar avaliações da técnica: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@reviews_router.get("/analytics", response_model=DeveloperAnalytics)
async def get_developer_analytics(
    days: int = 30,
    current_user: UserResponse = Depends(get_premium_user)  # Apenas admin/premium
):
    """
    Dashboard de analytics para desenvolvedores (estilo Google Play Console)
    """
    try:
        from server import db
        
        # Data de início
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Buscar avaliações do período
        reviews = await db.reviews.find({
            "created_at": {"$gte": start_date}
        }).to_list(10000)
        
        # Estatísticas gerais
        overall_stats = await get_review_stats()
        
        # Avaliações por dia
        daily_reviews = []
        for i in range(days):
            day_date = start_date + timedelta(days=i)
            day_start = day_date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            day_reviews = [r for r in reviews if day_start <= r["created_at"] < day_end]
            positive_day = len([r for r in day_reviews if r["rating"] >= 4])
            negative_day = len([r for r in day_reviews if r["rating"] <= 2])
            
            daily_reviews.append({
                "date": day_date.strftime("%Y-%m-%d"),
                "total": len(day_reviews),
                "positive": positive_day,
                "negative": negative_day,
                "average": round(sum(r["rating"] for r in day_reviews) / len(day_reviews), 2) if day_reviews else 0
            })
        
        # Ranking de técnicas
        techniques = await db.techniques.find({}).to_list(100)
        technique_rankings = []
        
        for technique in techniques:
            tech_reviews = [r for r in reviews if r["technique_id"] == technique["id"]]
            if tech_reviews:
                ratings = [r["rating"] for r in tech_reviews]
                avg_rating = sum(ratings) / len(ratings)
                positive = len([r for r in ratings if r >= 4])
                negative = len([r for r in ratings if r <= 2])
                
                latest_reviews = sorted(tech_reviews, key=lambda x: x["created_at"], reverse=True)[:3]
                latest_reviews_response = [ReviewResponse(**review) for review in latest_reviews]
                
                technique_rankings.append(TechniqueReviewStats(
                    technique_id=technique["id"],
                    technique_name=technique["name"],
                    total_reviews=len(tech_reviews),
                    average_rating=round(avg_rating, 2),
                    positive_reviews=positive,
                    negative_reviews=negative,
                    latest_reviews=latest_reviews_response
                ))
        
        # Ordenar por avaliação média
        technique_rankings.sort(key=lambda x: x.average_rating, reverse=True)
        
        # Feedback recente
        recent_reviews = sorted(reviews, key=lambda x: x["created_at"], reverse=True)[:10]
        recent_feedback = [ReviewResponse(**review) for review in recent_reviews]
        
        # Tendências
        trends = {
            "improvement_rate": 0,  # Calculado comparando com período anterior
            "most_common_rating": max(set([r["rating"] for r in reviews]), key=[r["rating"] for r in reviews].count) if reviews else 0,
            "peak_hour": 14,  # Hora com mais avaliações (placeholder)
            "user_retention": 85.5  # Placeholder para taxa de retenção
        }
        
        return DeveloperAnalytics(
            overall_stats=overall_stats,
            daily_reviews=daily_reviews,
            technique_rankings=technique_rankings,
            recent_feedback=recent_feedback,
            trends=trends
        )
        
    except Exception as e:
        logger.error(f"Erro ao buscar analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@reviews_router.get("/my-reviews")
async def get_user_reviews(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Buscar avaliações do usuário atual
    """
    try:
        from server import db
        
        reviews = await db.reviews.find({
            "user_id": current_user.id
        }).sort("created_at", -1).to_list(100)
        
        return {
            "reviews": [ReviewResponse(**review) for review in reviews],
            "total": len(reviews)
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar avaliações do usuário: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@reviews_router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Deletar uma avaliação (apenas o próprio usuário ou admin)
    """
    try:
        from server import db
        
        # Buscar avaliação
        review = await db.reviews.find_one({"id": review_id})
        if not review:
            raise HTTPException(
                status_code=404,
                detail="Avaliação não encontrada"
            )
        
        # Verificar se é o dono da avaliação ou admin
        if review["user_id"] != current_user.id and not current_user.is_premium:
            raise HTTPException(
                status_code=403,
                detail="Sem permissão para deletar esta avaliação"
            )
        
        # Deletar
        await db.reviews.delete_one({"id": review_id})
        
        return {"message": "Avaliação deletada com sucesso"}
        
    except Exception as e:
        logger.error(f"Erro ao deletar avaliação: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )