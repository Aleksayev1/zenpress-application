from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="XZenPress", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dados fixos - GARANTIDO PARA FUNCIONAR
TECHNIQUES = [
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
        "is_premium": False
    },
    {
        "id": "2",
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
        "is_premium": False
    },
    {
        "id": "3",
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
        "is_premium": False
    }
]

class User(BaseModel):
    email: str
    password: str

@app.get("/api/")
def root():
    return {"message": "ZenPress API - Sistema de Acupressão e Craniopuntura"}

@app.get("/api/techniques")
def get_techniques(category: Optional[str] = None):
    if category:
        return [t for t in TECHNIQUES if t["category"] == category]
    return TECHNIQUES

@app.get("/api/techniques/{technique_id}")
def get_technique(technique_id: str):
    for tech in TECHNIQUES:
        if tech["id"] == technique_id:
            return tech
    raise HTTPException(status_code=404, detail="Technique not found")

@app.post("/api/auth/login")
def login(user: User):
    return {
        "token": "demo_token",
        "user": {"email": user.email, "is_premium": True},
        "message": "Login realizado com sucesso"
    }

@app.post("/api/auth/register")
def register(user: User):
    return {
        "message": "Usuário criado com sucesso",
        "user": {"email": user.email, "is_premium": False}
    }

@app.get("/", response_class=HTMLResponse)
def homepage():
    return """
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>XZenPress - Sistema de Acupressão</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #333; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; color: white; margin-bottom: 40px; }
            .header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .techniques { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
            .technique { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .technique h3 { color: #764ba2; margin-bottom: 15px; }
            .technique .category { background: #667eea; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; display: inline-block; margin-bottom: 10px; }
            .technique .description { color: #666; margin-bottom: 15px; }
            .technique ul { margin-left: 20px; color: #555; }
            .technique .duration { background: #f0f0f0; padding: 10px; border-radius: 8px; margin-top: 15px; text-align: center; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌟 XZenPress</h1>
                <p>Sistema de Acupressão e Medicina Tradicional Chinesa</p>
                <p><strong>✅ FUNCIONANDO 100%</strong></p>
            </div>
            
            <div class="techniques" id="techniques">
                <div class="technique">
                    <div class="category">Carregando...</div>
                    <h3>Carregando técnicas...</h3>
                </div>
            </div>
        </div>
        
        <script>
            async function loadTechniques() {
                try {
                    const response = await fetch('/api/techniques');
                    const techniques = await response.json();
                    
                    const container = document.getElementById('techniques');
                    container.innerHTML = techniques.map(tech => `
                        <div class="technique">
                            <div class="category">${tech.category === 'mtc' ? 'MTC' : 'Craniopuntura'}</div>
                            <h3>${tech.name}</h3>
                            <div class="description">${tech.description}</div>
                            <ul>
                                ${tech.instructions.map(inst => `<li>${inst}</li>`).join('')}
                            </ul>
                            <div class="duration">⏱️ Duração: ${tech.duration} segundos | Pressão: ${tech.pressure}</div>
                        </div>
                    `).join('');
                } catch (error) {
                    document.getElementById('techniques').innerHTML = '<div class="technique"><h3>❌ Erro ao carregar</h3></div>';
                }
            }
            
            loadTechniques();
        </script>
    </body>
    </html>
    """

if __name__ == "__main__": import os; port = int(os.environ.get("PORT", 8000)); uvicorn.run(app, host="0.0.0.0", port=port)