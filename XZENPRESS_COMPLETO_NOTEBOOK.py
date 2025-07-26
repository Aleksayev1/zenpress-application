# XZenPress - Sistema Completo de Acupressão
# Instale as dependências primeiro: pip install fastapi uvicorn

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import asyncio
from datetime import datetime

# Configuração da aplicação
app = FastAPI(
    title="XZenPress - Sistema de Acupressão",
    description="API completa para técnicas de acupressão e medicina tradicional chinesa",
    version="1.0.0"
)

# CORS para permitir acesso web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de dados
class User(BaseModel):
    email: str
    password: str

class Technique(BaseModel):
    id: str
    name: str
    category: str
    description: str
    instructions: List[str]
    image: str
    duration: int
    pressure: str
    warnings: List[str]
    is_premium: bool

# Base de dados em memória
USERS_DB = [
    {"email": "admin@zenpress.com", "password": "admin123", "is_premium": True},
    {"email": "Aleksayevacupress@gmail.com", "password": "user123", "is_premium": False}
]

TECHNIQUES_DB = [
    {
        "id": "1",
        "name": "Dor de Cabeça - Craniopuntura Ponto A",
        "category": "craniopuntura",
        "condition": "Dor de cabeça, cefaleia",
        "description": "Técnica específica do Ponto A da Craniopuntura para alívio de dores de cabeça",
        "instructions": [
            "Localize o ponto no centro da testa, entre as sobrancelhas",
            "Use o dedo médio para aplicar pressão suave e constante",
            "Mantenha a pressão por 1 minuto, respirando profundamente",
            "Realize movimentos circulares leves no sentido horário"
        ],
        "image": "https://i.imgur.com/3yulsbz.jpeg",
        "duration": 60,
        "pressure": "Leve a moderada",
        "warnings": ["Não aplicar muita pressão", "Parar se sentir tontura"],
        "is_premium": False,
        "created_at": "2024-01-01T10:00:00"
    },
    {
        "id": "2", 
        "name": "Dor nas costas Ponto Extra - Craniopuntura",
        "category": "craniopuntura",
        "condition": "Dor nas costas, lombalgia",
        "description": "Ponto extra da craniopuntura para alívio de dores nas costas",
        "instructions": [
            "Localize o ponto na região temporal direita",
            "Aplique pressão com o polegar",
            "Mantenha por 90 segundos",
            "Alterne entre os lados"
        ],
        "image": "https://i.imgur.com/costas.jpeg",
        "duration": 90,
        "pressure": "Moderada",
        "warnings": ["Não aplicar em caso de hipertensão"],
        "is_premium": False,
        "created_at": "2024-01-01T10:00:00"
    },
    {
        "id": "3",
        "name": "Dor nas mãos - Craniopuntura ponto C",
        "category": "craniopuntura", 
        "condition": "Dor nas mãos, artrite",
        "description": "Ponto C da craniopuntura para tratamento de dores nas mãos",
        "instructions": [
            "Localize o ponto C na região parietal",
            "Use pressão circular suave",
            "Mantenha por 2 minutos",
            "Combine com respiração profunda"
        ],
        "image": "https://i.imgur.com/maos.jpeg",
        "duration": 120,
        "pressure": "Leve",
        "warnings": ["Evitar pressão excessiva"],
        "is_premium": False,
        "created_at": "2024-01-01T10:00:00"
    },
    {
        "id": "4",
        "name": "Ponto F: Nervo isquiático (ciático)",
        "category": "craniopuntura",
        "condition": "Dor ciática, nervo isquiático",
        "description": "Ponto F especializado para tratamento de dor ciática",
        "instructions": [
            "Localize o ponto F na região occipital",
            "Aplique pressão firme e constante",
            "Mantenha por 3 minutos",
            "Repita 2-3 vezes ao dia"
        ],
        "image": "https://i.imgur.com/ciatico.jpeg",
        "duration": 180,
        "pressure": "Firme",
        "warnings": ["Consulte médico se dor persistir"],
        "is_premium": True,
        "created_at": "2024-01-01T10:00:00"
    },
    {
        "id": "5",
        "name": "Ponto Hegu (LI4)",
        "category": "mtc",
        "condition": "Dor geral, tensão",
        "description": "Ponto clássico da medicina tradicional chinesa, localizado entre polegar e indicador",
        "instructions": [
            "Localize o ponto entre o polegar e o indicador",
            "Pressione firmemente com o polegar da outra mão",
            "Mantenha a pressão por 1 minuto",
            "Alterne entre as mãos"
        ],
        "image": "https://i.imgur.com/hegu.jpeg",
        "duration": 60,
        "pressure": "Firme",
        "warnings": ["Evitar durante a gravidez"],
        "is_premium": False,
        "created_at": "2024-01-01T10:00:00"
    },
    {
        "id": "6",
        "name": "Ponto Zusanli (ST36)",
        "category": "mtc",
        "condition": "Digestão, energia",
        "description": "Ponto do estômago 36, excelente para problemas digestivos e aumento de energia",
        "instructions": [
            "Localize o ponto 4 dedos abaixo da patela",
            "Na borda externa da tíbia",
            "Pressione com o polegar por 1-2 minutos",
            "Massageie em movimentos circulares"
        ],
        "image": "https://i.imgur.com/zusanli.jpeg",
        "duration": 90,
        "pressure": "Moderada a firme",
        "warnings": ["Não aplicar se houver feridas na perna"],
        "is_premium": False,
        "created_at": "2024-01-01T10:00:00"
    },
    {
        "id": "7",
        "name": "Ponto C7 - Shenmen (HE7)",
        "category": "mtc",
        "condition": "Ansiedade, insônia",
        "description": "Ponto do coração 7, conhecido como 'Portão do Espírito', ideal para acalmar a mente",
        "instructions": [
            "Localize o ponto na dobra do punho",
            "Do lado do dedo mindinho",
            "Pressione suavemente com a ponta do dedo",
            "Mantenha por 1-2 minutos respirando calmamente"
        ],
        "image": "https://i.imgur.com/shenmen.jpeg",
        "duration": 90,
        "pressure": "Leve a moderada",
        "warnings": ["Ideal antes de dormir"],
        "is_premium": False,
        "created_at": "2024-01-01T10:00:00"
    }
]

FAVORITES_DB = []
SESSIONS_DB = []

# Endpoints da API
@app.get("/api/")
def root():
    return {
        "message": "XZenPress API - Sistema de Acupressão e Craniopuntura",
        "version": "1.0.0",
        "techniques_count": len(TECHNIQUES_DB),
        "categories": ["craniopuntura", "mtc"]
    }

@app.get("/api/techniques")
def get_techniques(category: Optional[str] = None):
    """Retorna todas as técnicas ou filtradas por categoria"""
    if category:
        return [t for t in TECHNIQUES_DB if t["category"] == category]
    return TECHNIQUES_DB

@app.get("/api/techniques/{technique_id}")
def get_technique(technique_id: str):
    """Retorna uma técnica específica"""
    for technique in TECHNIQUES_DB:
        if technique["id"] == technique_id:
            return technique
    raise HTTPException(status_code=404, detail="Técnica não encontrada")

@app.post("/api/auth/login")
def login(user: User):
    """Sistema de login"""
    for db_user in USERS_DB:
        if db_user["email"] == user.email and db_user["password"] == user.password:
            return {
                "token": f"token_{user.email}",
                "user": {
                    "email": user.email,
                    "is_premium": db_user["is_premium"]
                },
                "message": "Login realizado com sucesso"
            }
    raise HTTPException(status_code=401, detail="Credenciais inválidas")

@app.post("/api/auth/register")
def register(user: User):
    """Registro de novos usuários"""
    # Verificar se usuário já existe
    for db_user in USERS_DB:
        if db_user["email"] == user.email:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Adicionar novo usuário
    new_user = {
        "email": user.email,
        "password": user.password,
        "is_premium": False
    }
    USERS_DB.append(new_user)
    
    return {
        "message": "Usuário criado com sucesso",
        "user": {"email": user.email, "is_premium": False}
    }

@app.get("/api/categories")
def get_categories():
    """Retorna categorias disponíveis"""
    categories = {}
    for technique in TECHNIQUES_DB:
        cat = technique["category"]
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += 1
    
    return [
        {"name": "craniopuntura", "count": categories.get("craniopuntura", 0), "display": "Craniopuntura"},
        {"name": "mtc", "count": categories.get("mtc", 0), "display": "Medicina Tradicional Chinesa"}
    ]

@app.post("/api/favorites/{technique_id}")
def add_favorite(technique_id: str):
    """Adicionar técnica aos favoritos"""
    if technique_id not in FAVORITES_DB:
        FAVORITES_DB.append(technique_id)
        return {"message": "Técnica adicionada aos favoritos"}
    return {"message": "Técnica já está nos favoritos"}

@app.delete("/api/favorites/{technique_id}")
def remove_favorite(technique_id: str):
    """Remover técnica dos favoritos"""
    if technique_id in FAVORITES_DB:
        FAVORITES_DB.remove(technique_id)
        return {"message": "Técnica removida dos favoritos"}
    return {"message": "Técnica não está nos favoritos"}

@app.get("/api/favorites")
def get_favorites():
    """Retorna técnicas favoritas"""
    return [get_technique(fav_id) for fav_id in FAVORITES_DB]

@app.post("/api/sessions")
def create_session(data: dict):
    """Criar nova sessão de prática"""
    session = {
        "id": len(SESSIONS_DB) + 1,
        "technique_id": data.get("technique_id"),
        "duration": data.get("duration", 60),
        "date": datetime.now().isoformat(),
        "notes": data.get("notes", "")
    }
    SESSIONS_DB.append(session)
    return session

@app.get("/api/sessions")
def get_sessions():
    """Retorna histórico de sessões"""
    return SESSIONS_DB

# Página HTML para teste
@app.get("/", response_class=HTMLResponse)
def get_homepage():
    return """
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>XZenPress - Acupressão e TCM</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; color: white; margin-bottom: 40px; }
            .header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .header p { font-size: 1.2rem; opacity: 0.9; }
            .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px; }
            .card { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
            .card:hover { transform: translateY(-5px); }
            .card h3 { color: #764ba2; margin-bottom: 15px; font-size: 1.4rem; }
            .card p { color: #666; margin-bottom: 20px; }
            .btn { background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 1rem; transition: all 0.3s ease; text-decoration: none; display: inline-block; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
            .techniques { display: none; background: white; border-radius: 15px; padding: 20px; margin-top: 20px; }
            .technique { border: 1px solid #eee; border-radius: 10px; padding: 15px; margin: 10px 0; }
            .technique h4 { color: #764ba2; margin-bottom: 10px; }
            .api-info { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 15px; padding: 30px; color: white; }
            .api-info h3 { margin-bottom: 20px; }
            .endpoint { background: rgba(255,255,255,0.1); padding: 10px 15px; margin: 10px 0; border-radius: 8px; font-family: monospace; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌟 XZenPress</h1>
                <p>Sistema Completo de Acupressão e Medicina Tradicional Chinesa</p>
            </div>
            
            <div class="cards">
                <div class="card">
                    <h3>🎯 Técnicas de Craniopuntura</h3>
                    <p>Métodos especializados de craniopuntura para alívio de dores específicas como cefaleia, dor nas costas e problemas neurológicos.</p>
                    <button class="btn" onclick="loadTechniques('craniopuntura')">Ver Técnicas</button>
                </div>
                
                <div class="card">
                    <h3>🌿 Medicina Tradicional Chinesa</h3>
                    <p>Pontos clássicos da MTC como Hegu, Zusanli e Shenmen para equilibrio energético e bem-estar geral.</p>
                    <button class="btn" onclick="loadTechniques('mtc')">Ver Técnicas</button>
                </div>
                
                <div class="card">
                    <h3>📊 Sistema Completo</h3>
                    <p>API completa com autenticação, favoritos, histórico de sessões e controle de usuários premium.</p>
                    <button class="btn" onclick="showAPI()">Ver API</button>
                </div>
            </div>
            
            <div id="techniques" class="techniques"></div>
            
            <div id="api-info" class="api-info" style="display: none;">
                <h3>📡 Endpoints da API</h3>
                <div class="endpoint">GET /api/ - Informações gerais</div>
                <div class="endpoint">GET /api/techniques - Todas as técnicas</div>
                <div class="endpoint">GET /api/techniques/{id} - Técnica específica</div>
                <div class="endpoint">POST /api/auth/login - Login de usuário</div>
                <div class="endpoint">POST /api/auth/register - Registro</div>
                <div class="endpoint">GET /api/categories - Categorias disponíveis</div>
                <div class="endpoint">GET /api/favorites - Técnicas favoritas</div>
                <div class="endpoint">GET /api/sessions - Histórico de sessões</div>
                <p><strong>Usuários de teste:</strong></p>
                <div class="endpoint">admin@zenpress.com / admin123 (Premium)</div>
                <div class="endpoint">user@zenpress.com / user123 (Gratuito)</div>
            </div>
        </div>
        
        <script>
            async function loadTechniques(category) {
                try {
                    const response = await fetch(`/api/techniques?category=${category}`);
                    const techniques = await response.json();
                    
                    const container = document.getElementById('techniques');
                    container.innerHTML = `
                        <h3>Técnicas de ${category === 'craniopuntura' ? 'Craniopuntura' : 'Medicina Tradicional Chinesa'}</h3>
                        ${techniques.map(tech => `
                            <div class="technique">
                                <h4>${tech.name} ${tech.is_premium ? '⭐ Premium' : ''}</h4>
                                <p><strong>Condição:</strong> ${tech.condition}</p>
                                <p><strong>Descrição:</strong> ${tech.description}</p>
                                <p><strong>Duração:</strong> ${tech.duration} segundos</p>
                                <p><strong>Pressão:</strong> ${tech.pressure}</p>
                                <p><strong>Instruções:</strong></p>
                                <ul>
                                    ${tech.instructions.map(inst => `<li>${inst}</li>`).join('')}
                                </ul>
                                ${tech.warnings.length > 0 ? `<p><strong>⚠️ Avisos:</strong> ${tech.warnings.join(', ')}</p>` : ''}
                            </div>
                        `).join('')}
                    `;
                    container.style.display = 'block';
                    document.getElementById('api-info').style.display = 'none';
                } catch (error) {
                    console.error('Erro ao carregar técnicas:', error);
                }
            }
            
            function showAPI() {
                document.getElementById('api-info').style.display = 'block';
                document.getElementById('techniques').style.display = 'none';
            }
        </script>
    </body>
    </html>
    """

# Função para executar o servidor
def run_server(host="0.0.0.0", port=8000):
    """
    Execute o servidor XZenPress
    
    Parâmetros:
    - host: endereço IP (padrão: 0.0.0.0 para aceitar conexões externas)
    - port: porta do servidor (padrão: 8000)
    """
    print("🌟 Iniciando XZenPress...")
    print(f"📡 Servidor disponível em: http://{host}:{port}")
    print(f"📚 Documentação da API: http://{host}:{port}/docs")
    print(f"🎯 Interface web: http://{host}:{port}")
    print("\n✨ Sistema pronto! Pressione Ctrl+C para parar.")
    
    uvicorn.run(app, host=host, port=port, log_level="info")

# Para executar em Jupyter Notebook, use:
if __name__ == "__main__": run_server()