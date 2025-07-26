from pydantic import BaseModel
from typing import Dict, Optional
import os

# Currency configurations by country/region
CURRENCY_CONFIG = {
    "US": {"symbol": "$", "code": "USD", "rate": 1.0},
    "BR": {"symbol": "R$", "code": "BRL", "rate": 5.2},
    "EU": {"symbol": "€", "code": "EUR", "rate": 0.85},
    "UK": {"symbol": "£", "code": "GBP", "rate": 0.73},
    "CA": {"symbol": "CAD$", "code": "CAD", "rate": 1.25},
    "AU": {"symbol": "AUD$", "code": "AUD", "rate": 1.35},
    "MX": {"symbol": "MX$", "code": "MXN", "rate": 18.5},
    "AR": {"symbol": "AR$", "code": "ARS", "rate": 120.0},
    "ES": {"symbol": "€", "code": "EUR", "rate": 0.85},
    "FR": {"symbol": "€", "code": "EUR", "rate": 0.85},
    "DE": {"symbol": "€", "code": "EUR", "rate": 0.85},
    "IT": {"symbol": "€", "code": "EUR", "rate": 0.85},
}

# Regional pricing strategy (multipliers for base USD price)
REGIONAL_PRICING = {
    "US": 1.0,      # Base price
    "EU": 0.95,     # Slightly lower for EU market
    "UK": 0.90,     # Competitive pricing for UK
    "CA": 0.85,     # Lower for Canadian market
    "AU": 0.90,     # Australia pricing
    "BR": 0.40,     # Adjusted for Brazilian market
    "MX": 0.35,     # Mexican market adjustment
    "AR": 0.25,     # Argentina economic adjustment
    "GLOBAL": 0.70  # Default for other countries
}

# WhatsApp numbers by region
WHATSAPP_NUMBERS = {
    "US": "+1234567890",
    "BR": "+5511999999999", 
    "EU": "+33123456789",
    "UK": "+44123456789",
    "CA": "+1234567890",
    "AU": "+61123456789",
    "MX": "+52123456789",
    "AR": "+54123456789",
    "GLOBAL": "+1234567890"  # Default
}

# Professional names by region/language
PROFESSIONAL_INFO = {
    "en": {
        "name": "Dr. John Smith",
        "credentials": "Licensed Acupuncturist, 15+ years experience",
        "specialties": ["Pain Management", "Stress Relief", "YNSA Specialist"]
    },
    "pt": {
        "name": "Dr. João Silva", 
        "credentials": "Acupunturista licenciado, 15+ anos de experiência",
        "specialties": ["Controle da Dor", "Alívio do Stress", "Especialista YNSA"]
    },
    "es": {
        "name": "Dr. Juan García",
        "credentials": "Acupunturista licenciado, 15+ años de experiencia", 
        "specialties": ["Manejo del Dolor", "Alivio del Estrés", "Especialista YNSA"]
    },
    "fr": {
        "name": "Dr. Jean Dupont",
        "credentials": "Acupuncteur agréé, 15+ ans d'expérience",
        "specialties": ["Gestion de la Douleur", "Soulagement du Stress", "Spécialiste YNSA"]
    },
    "de": {
        "name": "Dr. Hans Müller",
        "credentials": "Lizenzierter Akupunkteur, 15+ Jahre Erfahrung",
        "specialties": ["Schmerzmanagement", "Stressabbau", "YNSA Spezialist"]
    }
}

class RegionalConfig(BaseModel):
    currency_symbol: str
    currency_code: str
    exchange_rate: float
    pricing_multiplier: float
    whatsapp_number: str
    professional_info: Dict

def get_country_from_ip(ip_address: str) -> str:
    """
    Get country code from IP address
    In production, use a service like GeoIP or MaxMind
    For now, return default
    """
    # TODO: Implement IP geolocation
    return "US"

def get_country_from_language(language: str) -> str:
    """Map language to default country"""
    language_to_country = {
        "en": "US",
        "pt": "BR", 
        "es": "MX",
        "fr": "FR",
        "de": "DE"
    }
    return language_to_country.get(language, "US")

def get_regional_config(country_code: Optional[str] = None, language: str = "en") -> RegionalConfig:
    """Get regional configuration for pricing and localization"""
    
    if not country_code:
        country_code = get_country_from_language(language)
    
    # Determine region for pricing
    if country_code in ["US", "CA"]:
        region = country_code
    elif country_code in ["GB", "UK"]:
        region = "UK"
    elif country_code in ["DE", "FR", "IT", "ES", "NL", "BE", "AT"]:
        region = "EU"
    elif country_code in ["AU", "NZ"]:
        region = "AU"
    elif country_code == "BR":
        region = "BR"
    elif country_code in ["MX", "CO", "CL", "PE"]:
        region = "MX"
    elif country_code in ["AR", "UY"]:
        region = "AR"
    else:
        region = "GLOBAL"
    
    # Get currency config
    currency_config = CURRENCY_CONFIG.get(region, CURRENCY_CONFIG["US"])
    
    # Get pricing multiplier
    pricing_multiplier = REGIONAL_PRICING.get(region, REGIONAL_PRICING["GLOBAL"])
    
    # Get WhatsApp number
    whatsapp_number = WHATSAPP_NUMBERS.get(region, WHATSAPP_NUMBERS["GLOBAL"])
    
    # Get professional info
    professional_info = PROFESSIONAL_INFO.get(language, PROFESSIONAL_INFO["en"])
    
    return RegionalConfig(
        currency_symbol=currency_config["symbol"],
        currency_code=currency_config["code"],
        exchange_rate=currency_config["rate"],
        pricing_multiplier=pricing_multiplier,
        whatsapp_number=whatsapp_number,
        professional_info=professional_info
    )

def calculate_regional_price(base_usd_price: float, region_config: RegionalConfig) -> float:
    """Calculate price in local currency"""
    # Apply regional pricing multiplier
    adjusted_usd_price = base_usd_price * region_config.pricing_multiplier
    
    # Convert to local currency
    local_price = adjusted_usd_price * region_config.exchange_rate
    
    # Round to appropriate precision
    if region_config.currency_code in ["JPY", "KRW"]:
        return round(local_price)  # No decimals for these currencies
    else:
        return round(local_price, 2)

# Base USD prices for products
BASE_PRICES_USD = {
    "premium_monthly": 9.99,
    "premium_annual": 99.99,
    "course_craniopuntura": 49.99,
    "course_enxaqueca": 24.99,
    "course_stress": 34.99,
    "course_yamamoto": 74.99,
    "corporate_starter": 399.99,
    "corporate_business": 1299.99,
    "corporate_enterprise": 2699.99,
    "analytics_basic": 299.99,
    "analytics_professional": 699.99,
    "analytics_enterprise": 1199.99
}

def get_localized_prices(country_code: Optional[str] = None, language: str = "en") -> Dict[str, float]:
    """Get all product prices localized for the region"""
    region_config = get_regional_config(country_code, language)
    
    localized_prices = {}
    for product_id, base_price in BASE_PRICES_USD.items():
        localized_prices[product_id] = calculate_regional_price(base_price, region_config)
    
    return localized_prices

# Legal disclaimers by country/region
LEGAL_DISCLAIMERS = {
    "US": {
        "medical": "This app is for educational purposes only and is not intended to diagnose, treat, cure, or prevent any disease. Consult with a healthcare professional before using these techniques.",
        "privacy": "Your privacy is protected under CCPA and our privacy policy.",
        "terms": "By using this app, you agree to our Terms of Service."
    },
    "EU": {
        "medical": "This app is for educational purposes only. It does not replace professional medical advice. Under GDPR, you have rights regarding your personal data.",
        "privacy": "Your data is protected under GDPR. You have the right to access, rectify, and delete your personal data.",
        "terms": "By using this app, you agree to our Terms of Service and Privacy Policy."
    },
    "BR": {
        "medical": "Este aplicativo é apenas para fins educacionais. Não substitui consulta médica profissional. Consulte sempre um profissional de saúde.",
        "privacy": "Seus dados são protegidos pela LGPD. Você tem direitos sobre seus dados pessoais.",
        "terms": "Ao usar este aplicativo, você concorda com nossos Termos de Serviço."
    },
    "GLOBAL": {
        "medical": "This app is for educational purposes only. Consult healthcare professionals for medical advice.",
        "privacy": "Your privacy is important to us. See our privacy policy for details.",
        "terms": "By using this app, you agree to our Terms of Service."
    }
}

def get_legal_disclaimers(country_code: Optional[str] = None) -> Dict[str, str]:
    """Get legal disclaimers for the region"""
    if country_code in ["DE", "FR", "IT", "ES", "NL", "BE", "AT"]:
        return LEGAL_DISCLAIMERS["EU"]
    elif country_code == "BR":
        return LEGAL_DISCLAIMERS["BR"]
    elif country_code == "US":
        return LEGAL_DISCLAIMERS["US"]
    else:
        return LEGAL_DISCLAIMERS["GLOBAL"]