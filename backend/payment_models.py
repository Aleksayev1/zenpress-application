from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import uuid

# Payment Transaction Models
class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    session_id: str
    payment_id: Optional[str] = None
    amount: float
    currency: str = "brl"
    product_type: str  # "premium_subscription", "course", "corporate_plan", "b2b_analytics"
    product_id: str
    metadata: Dict[str, str] = {}
    payment_status: str = "pending"  # pending, paid, failed, expired
    status: str = "initiated"  # initiated, completed, cancelled, expired
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Checkout Request Models
class CheckoutRequest(BaseModel):
    product_type: str
    product_id: str
    origin_url: str
    user_id: Optional[str] = None
    quantity: int = 1
    metadata: Optional[Dict[str, str]] = None

# Product Models - Fixed packages for security
class ProductPackage(BaseModel):
    id: str
    name: str
    description: str
    price: float
    currency: str = "brl"
    type: str  # "subscription", "course", "corporate", "analytics"
    billing_period: Optional[str] = None  # "monthly", "annual", None for one-time
    features: List[str] = []
    max_users: Optional[int] = None  # For corporate plans

# Course Models
class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    currency: str = "brl"
    duration_hours: int
    instructor: str
    modules: List[str]
    preview_video: Optional[str] = None
    thumbnail: str
    category: str
    level: str  # "beginner", "intermediate", "advanced"
    is_premium: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CourseEnrollment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: str
    payment_transaction_id: str
    enrolled_at: datetime = Field(default_factory=datetime.utcnow)
    completed: bool = False
    progress: int = 0  # 0-100%

# Corporate Plan Models
class CorporatePlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    contact_email: str
    contact_name: str
    plan_type: str  # "starter", "business", "enterprise"
    max_users: int
    monthly_price: float
    features: List[str]
    payment_transaction_id: str
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

class CorporateUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    corporate_plan_id: str
    role: str = "employee"  # "admin", "employee"
    added_at: datetime = Field(default_factory=datetime.utcnow)

# B2B Analytics Models
class AnalyticsSubscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    contact_email: str
    contact_name: str
    plan_type: str  # "basic", "professional", "enterprise"
    monthly_price: float
    data_access_level: str  # "basic", "advanced", "full"
    api_calls_limit: int
    payment_transaction_id: str
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

# Predefined Product Packages (SECURITY: Fixed prices on backend)
PRODUCT_PACKAGES = {
    # Premium Subscriptions
    "premium_monthly": ProductPackage(
        id="premium_monthly",
        name="AcuPressão Premium - Mensal",
        description="Acesso a todas as técnicas premium, protocolos avançados e histórico ilimitado valor restrito ao pontos do aplicativo e upgrades do app",
        price=19.90,
        type="subscription",
        billing_period="monthly",
        features=[
            "20+ técnicas avançadas",
            "Protocolos personalizados de 5-15 minutos",
            "Histórico ilimitado e relatórios detalhados",
            "Planos de tratamento semanais",
            "Suporte prioritário"
        ]
    ),
    "premium_annual": ProductPackage(
        id="premium_annual",
        name="AcuPressão Premium - Anual",
        description="Plano anual com 2 meses grátis! Acesso a todas as técnicas premium, protocolos avançados e histórico ilimitado valor restrito ao pontos do aplicativo e upgrades do app",
        price=199.00,
        type="subscription",
        billing_period="annual",
        features=[
            "Todas as funcionalidades do plano mensal",
            "2 meses grátis (economia de R$ 39,80)",
            "Consulta mensal com especialista",
            "Acesso antecipado a novas técnicas"
        ]
    ),
    
    # Courses
    "course_craniopuntura": ProductPackage(
        id="course_craniopuntura",
        name="Curso Completo de Craniopuntura",
        description="Curso online completo sobre técnicas avançadas de craniopuntura",
        price=97.00,
        type="course",
        features=[
            "8 horas de vídeo aulas",
            "Material em PDF",
            "Certificado digital",
            "Suporte do instrutor"
        ]
    ),
    "course_enxaqueca": ProductPackage(
        id="course_enxaqueca",
        name="Acupressão para Enxaqueca",
        description="Protocolo especializado para tratamento de enxaquecas e dores de cabeça",
        price=47.00,
        type="course",
        features=[
            "3 horas de conteúdo",
            "Técnicas específicas para enxaqueca",
            "Casos práticos",
            "Certificado de participação"
        ]
    ),
    "course_stress": ProductPackage(
        id="course_stress",
        name="Protocolo Anti-Stress",
        description="Técnicas de acupressão para redução de stress e ansiedade",
        price=67.00,
        type="course",
        features=[
            "4 horas de conteúdo",
            "Técnicas de relaxamento",
            "Exercícios práticos",
            "Guia de emergência para crises de ansiedade"
        ]
    ),
    
    # Corporate Plans
    "corporate_starter": ProductPackage(
        id="corporate_starter",
        name="Plano Corporativo Starter",
        description="Para pequenas empresas até 50 funcionários",
        price=750.00,  # R$ 15/funcionário * 50
        type="corporate",
        billing_period="monthly",
        max_users=50,
        features=[
            "Acesso premium para todos os funcionários",
            "Dashboard administrativo",
            "Relatórios de uso básicos",
            "Suporte por email"
        ]
    ),
    "corporate_business": ProductPackage(
        id="corporate_business",
        name="Plano Corporativo Business",
        description="Para médias empresas até 200 funcionários",
        price=2400.00,  # R$ 12/funcionário * 200
        type="corporate",
        billing_period="monthly",
        max_users=200,
        features=[
            "Todas as funcionalidades do Starter",
            "Relatórios avançados de bem-estar",
            "Integração com RH",
            "Sessões de grupo virtuais",
            "Suporte telefônico"
        ]
    ),
    "corporate_enterprise": ProductPackage(
        id="corporate_enterprise",
        name="Plano Corporativo Enterprise",
        description="Para grandes empresas com 500+ funcionários",
        price=5000.00,  # R$ 10/funcionário * 500
        type="corporate",
        billing_period="monthly",
        max_users=1000,
        features=[
            "Todas as funcionalidades do Business",
            "API personalizada",
            "Relatórios executivos",
            "Consultor dedicado",
            "Treinamentos presenciais",
            "SLA garantido"
        ]
    ),
    
    # B2B Analytics
    "analytics_basic": ProductPackage(
        id="analytics_basic",
        name="Analytics Básico",
        description="Dados básicos de uso e tendências para clínicas pequenas",
        price=500.00,
        type="analytics",
        billing_period="monthly",
        features=[
            "Relatórios mensais de tendências",
            "Dados anonimizados de eficácia",
            "Até 1.000 consultas API/mês",
            "Suporte por email"
        ]
    ),
    "analytics_professional": ProductPackage(
        id="analytics_professional",
        name="Analytics Profissional",
        description="Insights avançados para clínicas e centros de saúde",
        price=1200.00,
        type="analytics",
        billing_period="monthly",
        features=[
            "Relatórios semanais detalhados",
            "Segmentação por condições médicas",
            "Até 5.000 consultas API/mês",
            "Dashboard em tempo real",
            "Suporte telefônico"
        ]
    ),
    "analytics_enterprise": ProductPackage(
        id="analytics_enterprise",
        name="Analytics Enterprise",
        description="Solução completa para hospitais e redes de saúde",
        price=2000.00,
        type="analytics",
        billing_period="monthly",
        features=[
            "Relatórios personalizados",
            "Dados em tempo real",
            "API ilimitada",
            "Integração com sistemas hospitalares",
            "Consultor dedicado",
            "Suporte 24/7"
        ]
    )
}

# Predefined Courses Data
COURSE_CATALOG = {
    "course_craniopuntura": Course(
        id="course_craniopuntura",
        title="Curso Completo de Craniopuntura",
        description="Aprenda as técnicas mais avançadas de craniopuntura para tratamento de dores de cabeça, stress e fadiga mental. Curso ministrado por especialistas com 20+ anos de experiência.",
        price=97.00,
        duration_hours=8,
        instructor="Dr. Marina Silva - Especialista em MTC",
        modules=[
            "Fundamentos da Craniopuntura",
            "Anatomia do Couro Cabeludo",
            "Pontos Principais e Secundários",
            "Técnicas de Pressão e Timing",
            "Protocolos para Diferentes Condições",
            "Contraindicações e Segurança",
            "Casos Práticos",
            "Avaliação Final"
        ],
        thumbnail="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
        category="craniopuntura",
        level="intermediate"
    ),
    "course_enxaqueca": Course(
        id="course_enxaqueca",
        title="Acupressão para Enxaqueca",
        description="Protocolo especializado para alívio rápido e prevenção de enxaquecas através de técnicas específicas de acupressão.",
        price=47.00,
        duration_hours=3,
        instructor="Prof. João Santos - Fisioterapeuta",
        modules=[
            "Entendendo a Enxaqueca",
            "Pontos Específicos para Enxaqueca",
            "Técnica de Alívio Emergencial",
            "Protocolo Preventivo",
            "Casos Práticos"
        ],
        thumbnail="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=400&h=300&fit=crop",
        category="mtc",
        level="beginner"
    ),
    "course_stress": Course(
        id="course_stress",
        title="Protocolo Anti-Stress",
        description="Técnicas comprovadas de acupressão para redução de stress, ansiedade e promoção do bem-estar mental.",
        price=67.00,
        duration_hours=4,
        instructor="Dra. Ana Costa - Psicóloga e Acupunturista",
        modules=[
            "Fisiologia do Stress",
            "Pontos Calmantes Principais",
            "Sequências para Diferentes Situações",
            "Técnicas de Respiração Integradas",
            "Protocolo de Emergência",
            "Exercícios Práticos"
        ],
        thumbnail="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop",
        category="mtc",
        level="beginner"
    ),
    "course_yamamoto": Course(
        id="course_yamamoto",
        title="Craniopuntura de Yamamoto (YNSA)",
        description="Curso especializado na técnica YNSA desenvolvida pelo Dr. Toshikatsu Yamamoto. Aprenda os 5 pontos básicos e suas aplicações clínicas.",
        price=147.00,
        duration_hours=6,
        instructor="Dr. Hiroshi Tanaka - Especialista em YNSA",
        modules=[
            "História e Fundamentos da YNSA",
            "Anatomia do Couro Cabeludo",
            "Pontos Básicos A, B, C, D, E",
            "Diagnóstico pela Palpação",
            "Técnicas de Estimulação",
            "Protocolos para Condições Específicas",
            "Contraindicações e Segurança",
            "Casos Clínicos Práticos"
        ],
        thumbnail="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
        category="craniopuntura",
        level="advanced"
    )
}