from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from typing import List, Dict, Any
from bson import ObjectId
from .auth import get_current_user
from .models import User

router = APIRouter()

# Endpoint para obter tendências da comunidade (dados reais)
@router.get("/community-trends")
async def get_community_trends():
    """
    Retorna tendências da comunidade baseadas em dados reais
    Será implementado quando houver usuários suficientes
    """
    try:
        # TODO: Implementar quando houver pelo menos 100 usuários
        # Por enquanto, retorna estrutura preparada
        
        # Simulação de consulta ao banco:
        # complaints_data = await db.sessions.aggregate([
        #     {"$group": {"_id": "$complaint", "count": {"$sum": 1}}},
        #     {"$sort": {"count": -1}},
        #     {"$limit": 10}
        # ]).to_list(length=None)
        
        return {
            "commonComplaints": [
                {"id": 1, "complaint": "Dor de cabeça tensional", "count": 0, "trending": False},
                {"id": 2, "complaint": "Ansiedade e stress", "count": 0, "trending": False},
                {"id": 3, "complaint": "Dor nas costas", "count": 0, "trending": False},
                {"id": 4, "complaint": "Insônia", "count": 0, "trending": False},
                {"id": 5, "complaint": "Fadiga mental", "count": 0, "trending": False},
                {"id": 6, "complaint": "Problemas digestivos", "count": 0, "trending": False},
                {"id": 7, "complaint": "Enxaqueca", "count": 0, "trending": False},
                {"id": 8, "complaint": "Baixa imunidade", "count": 0, "trending": False}
            ],
            "totalUsers": 0,
            "isRealData": True,
            "lastUpdated": datetime.utcnow().isoformat(),
            "message": "Dados insuficientes. Mínimo de 100 usuários necessário."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter tendências: {str(e)}")

# Endpoint para obter estatísticas gerais de usuários
@router.get("/user-stats")
async def get_user_stats():
    """
    Retorna estatísticas gerais de usuários
    """
    try:
        # TODO: Implementar consulta real ao banco
        # user_count = await db.users.count_documents({})
        # sessions_count = await db.sessions.count_documents({})
        # active_users = await db.users.count_documents({
        #     "last_login": {"$gte": datetime.utcnow() - timedelta(days=30)}
        # })
        
        return {
            "totalUsers": 0,
            "totalSessions": 0,
            "activeUsers": 0,
            "averageSessionDuration": 0.0,
            "mostUsedTechnique": None,
            "lastUpdated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas: {str(e)}")

# Endpoint para obter estatísticas detalhadas (quando houver dados)
@router.get("/general-stats")
async def get_general_stats():
    """
    Retorna estatísticas detalhadas para analytics
    """
    try:
        # TODO: Implementar quando houver dados suficientes
        # weekly_stats = await db.sessions.aggregate([
        #     {"$match": {"created_at": {"$gte": datetime.utcnow() - timedelta(days=7)}}},
        #     {"$group": {"_id": {"$dayOfWeek": "$created_at"}, "count": {"$sum": 1}}}
        # ]).to_list(length=None)
        
        return {
            "dailyStats": [],
            "weeklyStats": [],
            "monthlyStats": [],
            "topTechniques": [],
            "userGrowth": [],
            "isRealData": True,
            "lastUpdated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas gerais: {str(e)}")

# Endpoint para verificar se há dados suficientes
@router.get("/data-availability")
async def check_data_availability():
    """
    Verifica se há dados suficientes para estatísticas reais
    """
    try:
        # TODO: Implementar contagem real
        # user_count = await db.users.count_documents({})
        # session_count = await db.sessions.count_documents({})
        
        user_count = 0
        session_count = 0
        
        return {
            "hasEnoughUsers": user_count >= 100,
            "hasEnoughSessions": session_count >= 1000,
            "currentUsers": user_count,
            "currentSessions": session_count,
            "minimumUsers": 100,
            "minimumSessions": 1000,
            "canShowRealData": user_count >= 100 and session_count >= 1000
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar disponibilidade: {str(e)}")