"""
Sistema de Pagamento Crypto Simplificado para ZenPress
Gerencia pagamentos Bitcoin e USDT via endereços de wallet
"""

from fastapi import APIRouter, HTTPException, Depends, status
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import uuid
import os
import qrcode
import base64
from io import BytesIO
import logging

from models import UserResponse
from auth import get_current_user, get_premium_user

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router para pagamentos crypto
crypto_router = APIRouter(prefix="/crypto", tags=["crypto_payments"])

@crypto_router.get("/currencies")
async def get_available_currencies():
    """
    Lista as moedas/métodos de pagamento disponíveis
    """
    currencies = {
        "BTC": {
            "name": "Bitcoin",
            "symbol": "BTC",
            "type": "cryptocurrency",
            "network": "Bitcoin Network",
            "description": "Pagamento via Bitcoin"
        },
        "USDT_TRC20": {
            "name": "USDT (TRC20)",
            "symbol": "USDT",
            "type": "cryptocurrency", 
            "network": "TRON Network",
            "description": "Tether via rede TRON"
        },
        "USDT_ERC20": {
            "name": "USDT (ERC20)",
            "symbol": "USDT",
            "type": "cryptocurrency",
            "network": "Ethereum Network", 
            "description": "Tether via rede Ethereum"
        },
        "PIX": {
            "name": "PIX",
            "symbol": "PIX",
            "type": "bank_transfer",
            "network": "Sistema de Pagamentos Instantâneos",
            "description": "Pagamento instantâneo via PIX",
            "country": "Brasil"
        }
    }
    return currencies

# Configuração de endereços de wallet (configurar no .env)
WALLET_ADDRESSES = {
    "BTC": os.environ.get("BTC_WALLET_ADDRESS", "bc1qxy2kgdygjrsqtzq2n0q0m6svcjzrlw8dzxzm5v"),
    "USDT_TRC20": os.environ.get("USDT_WALLET_ADDRESS", "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"),
    "USDT_ERC20": os.environ.get("USDT_ERC20_WALLET_ADDRESS", "0x742d35Cc6634C0532925a3b8D5c21E2c2eC2b9b0"),
    "PIX": os.environ.get("PIX_KEY", "aleksayev@gmail.com")
}

# Configuração de preços (em USD para facilitar conversão)
SUBSCRIPTION_PRICES = {
    "premium_monthly": {"brl": 29.90, "usd": 5.99},
    "premium_yearly": {"brl": 299.90, "usd": 59.99}
}

def generate_qr_code(data: str) -> str:
    """Gera QR Code em base64 para o endereço de pagamento"""
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Converter para base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
        
    except Exception as e:
        logger.error(f"Erro ao gerar QR Code: {str(e)}")
        return ""

def generate_pix_qr_code(pix_key: str, amount: float, transaction_id: str) -> str:
    """Gera QR Code PIX com dados estruturados"""
    try:
        # Formato básico PIX para QR Code (simplificado para teste)
        pix_data = f"PIX:{pix_key}:BRL:{amount:.2f}:ID:{transaction_id}"
        return generate_qr_code(pix_data)
    except Exception as e:
        logger.error(f"Erro ao gerar QR Code PIX: {str(e)}")
        return generate_qr_code(pix_key)  # Fallback para chave simples

@crypto_router.post("/create-payment")
async def create_crypto_payment(
    payment_data: Dict[str, Any],
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Cria uma solicitação de pagamento crypto
    """
    # Validar dados de entrada (fora do try-catch para permitir HTTPException)
    subscription_type = payment_data.get("subscription_type")
    crypto_currency = payment_data.get("crypto_currency")
    
    if subscription_type not in SUBSCRIPTION_PRICES:
        raise HTTPException(
            status_code=400, 
            detail="Tipo de assinatura inválido"
        )
    
    if crypto_currency not in WALLET_ADDRESSES:
        raise HTTPException(
            status_code=400,
            detail="Criptomoeda não suportada"
        )
    
    try:
        # Obter conexão MongoDB
        from server import db
        
        # Gerar ID único para a transação
        transaction_id = str(uuid.uuid4())
        
        # Obter preço em USD
        price_usd = SUBSCRIPTION_PRICES[subscription_type]["usd"]
        price_brl = SUBSCRIPTION_PRICES[subscription_type]["brl"]
        
        # Endereço de pagamento
        wallet_address = WALLET_ADDRESSES[crypto_currency]
        
        # Gerar QR Code (específico para PIX ou genérico)
        if crypto_currency == "PIX":
            qr_code = generate_pix_qr_code(wallet_address, price_brl, transaction_id)
        else:
            qr_code = generate_qr_code(wallet_address)
        
        # Criar registro de pagamento
        payment_record = {
            "transaction_id": transaction_id,
            "user_id": current_user.id,
            "subscription_type": subscription_type,
            "crypto_currency": crypto_currency,
            "wallet_address": wallet_address,
            "amount_usd": price_usd,
            "amount_brl": price_brl,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=24),
            "confirmed_at": None,
            "confirmation_message": None
        }
        
        # Salvar no banco
        await db.crypto_payments.insert_one(payment_record)
        
        logger.info(f"Pagamento crypto criado: {transaction_id} para usuário {current_user.id}")
        
        # Gerar instruções específicas por tipo de pagamento
        if crypto_currency == "PIX":
            instructions = {
                "pt": f"Transfira exatamente R$ {price_brl:.2f} via PIX para a chave: {wallet_address}",
                "en": f"Transfer exactly R$ {price_brl:.2f} via PIX to key: {wallet_address}"
            }
        else:
            instructions = {
                "pt": f"Envie exatamente ${price_usd:.2f} USD em {crypto_currency} para o endereço acima",
                "en": f"Send exactly ${price_usd:.2f} USD in {crypto_currency} to the address above"
            }
        
        return {
            "transaction_id": transaction_id,
            "crypto_currency": crypto_currency,
            "wallet_address": wallet_address,
            "amount_usd": price_usd,
            "amount_brl": price_brl,
            "qr_code": qr_code,
            "expires_at": payment_record["expires_at"],
            "instructions": instructions
        }
        
    except Exception as e:
        logger.error(f"Erro ao criar pagamento crypto: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@crypto_router.post("/confirm-payment/{transaction_id}")
async def confirm_crypto_payment(
    transaction_id: str,
    confirmation_data: Dict[str, Any],
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Confirma um pagamento crypto (usuário reporta que fez o pagamento)
    """
    try:
        from server import db
        
        # Buscar pagamento
        payment = await db.crypto_payments.find_one({
            "transaction_id": transaction_id,
            "user_id": current_user.id
        })
        
        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Pagamento não encontrado"
            )
        
        if payment["status"] != "pending":
            raise HTTPException(
                status_code=400,
                detail="Pagamento já foi processado"
            )
        
        # Verificar se não expirou
        if datetime.utcnow() > payment["expires_at"]:
            raise HTTPException(
                status_code=400,
                detail="Pagamento expirou"
            )
        
        # Atualizar status para "user_confirmed"
        tx_hash = confirmation_data.get("tx_hash", "")
        confirmation_message = confirmation_data.get("message", "")
        
        await db.crypto_payments.update_one(
            {"transaction_id": transaction_id},
            {
                "$set": {
                    "status": "user_confirmed",
                    "user_confirmed_at": datetime.utcnow(),
                    "tx_hash": tx_hash,
                    "confirmation_message": confirmation_message
                }
            }
        )
        
        logger.info(f"Pagamento confirmado pelo usuário: {transaction_id}")
        
        return {
            "status": "confirmed",
            "message": "Pagamento confirmado! Verificaremos em até 2 horas.",
            "verification_time": "2 horas"
        }
        
    except Exception as e:
        logger.error(f"Erro ao confirmar pagamento: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@crypto_router.get("/payment-status/{transaction_id}")
async def get_payment_status(
    transaction_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Verifica o status de um pagamento crypto
    """
    try:
        from server import db
        
        payment = await db.crypto_payments.find_one({
            "transaction_id": transaction_id,
            "user_id": current_user.id
        })
        
        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Pagamento não encontrado"
            )
        
        status_messages = {
            "pending": "Aguardando pagamento",
            "user_confirmed": "Pagamento confirmado pelo usuário. Verificando...",
            "verified": "Pagamento verificado e aprovado!",
            "expired": "Pagamento expirado",
            "failed": "Pagamento falhou"
        }
        
        return {
            "transaction_id": transaction_id,
            "status": payment["status"],
            "status_message": status_messages.get(payment["status"], "Status desconhecido"),
            "created_at": payment["created_at"],
            "expires_at": payment["expires_at"],
            "confirmed_at": payment.get("confirmed_at"),
            "crypto_currency": payment["crypto_currency"],
            "amount_usd": payment["amount_usd"]
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar status do pagamento: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@crypto_router.get("/my-payments")
async def get_user_crypto_payments(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Lista todos os pagamentos crypto do usuário
    """
    try:
        from server import db
        
        payments = await db.crypto_payments.find({
            "user_id": current_user.id
        }).sort("created_at", -1).to_list(100)
        
        # Convert MongoDB documents to JSON-serializable format
        serializable_payments = []
        for payment in payments:
            # Remove MongoDB ObjectId
            if "_id" in payment:
                del payment["_id"]
            serializable_payments.append(payment)
        
        return {
            "payments": serializable_payments,
            "total": len(serializable_payments)
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar pagamentos do usuário: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

# Endpoint administrativo (para você verificar e aprovar pagamentos)
@crypto_router.post("/admin/verify-payment/{transaction_id}")
async def admin_verify_payment(
    transaction_id: str,
    verification_data: Dict[str, Any],
    current_user: UserResponse = Depends(get_premium_user)  # Apenas admin
):
    """
    Endpoint administrativo para verificar e aprovar pagamentos
    """
    try:
        from server import db
        
        # Buscar pagamento
        payment = await db.crypto_payments.find_one({
            "transaction_id": transaction_id
        })
        
        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Pagamento não encontrado"
            )
        
        verification_status = verification_data.get("status")  # "verified" ou "failed"
        admin_notes = verification_data.get("notes", "")
        
        if verification_status == "verified":
            # Aprovar pagamento e ativar assinatura
            await db.crypto_payments.update_one(
                {"transaction_id": transaction_id},
                {
                    "$set": {
                        "status": "verified",
                        "verified_at": datetime.utcnow(),
                        "admin_notes": admin_notes
                    }
                }
            )
            
            # Ativar assinatura premium do usuário
            expiry_date = datetime.utcnow() + timedelta(days=30 if "monthly" in payment["subscription_type"] else 365)
            
            await db.users.update_one(
                {"id": payment["user_id"]},
                {
                    "$set": {
                        "is_premium": True,
                        "premium_expires_at": expiry_date,
                        "premium_activated_at": datetime.utcnow()
                    }
                }
            )
            
            logger.info(f"Pagamento verificado e assinatura ativada: {transaction_id}")
            
            return {
                "status": "verified",
                "message": "Pagamento verificado e assinatura ativada",
                "user_id": payment["user_id"],
                "premium_expires_at": expiry_date
            }
            
        else:
            # Rejeitar pagamento
            await db.crypto_payments.update_one(
                {"transaction_id": transaction_id},
                {
                    "$set": {
                        "status": "failed",
                        "failed_at": datetime.utcnow(),
                        "admin_notes": admin_notes
                    }
                }
            )
            
            return {
                "status": "failed",
                "message": "Pagamento rejeitado",
                "notes": admin_notes
            }
            
    except Exception as e:
        logger.error(f"Erro na verificação administrativa: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )