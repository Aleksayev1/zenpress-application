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
        "description": "Técnica do Ponto A da Craniopuntura para alívio de dores de cabeça",
        "instructions": [
            "Localize o ponto no centro da testa",
            "Aplique pressão suave por 1 minuto",
            "Respire profundamente",
            "Movimentos circulares leves"
        ],
        "duration": 60,
        "pressure": "Leve a moderada",
        "is_premium": False
    },
    {
        "id": "2",
        "name": "Ponto Hegu (LI4)",
        "category": "mtc",
        "description": "Ponto clássico da medicina tradicional chinesa",
        "instructions": [
            "Localize entre polegar e indicador",
            "Pressione firmemente por 1 minuto",
            "Alterne entre as mãos"
        ],
        "duration": 60,
        "pressure": "Firme",
        "is_premium": False
    },
    {
        "id": "3",
        "name": "Ponto Zusanli (ST36)",
        "category": "mtc",
        "description": "Ponto do estômago 36 para digestão e energia",
        "instructions": [
            "4 dedos abaixo da patela",
            "Pressione por 1-2 minutos",
            "Massageie em círculos"
        ],
        "duration": 90,
        "pressure": "Moderada",
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
def get_techniques():
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

@app.get("/", response_class=HTMLResponse)
def homepage():
    return """
    <html><body style="font-family: Arial; padding: 40px; background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
        <div style="text-align: center; max-width: 800px; margin: 0 auto;">
            <h1 style="font-size: 3rem; margin-bottom: 20px;">🌟 XZenPress</h1>
            <p style="font-size: 1.2rem; margin-bottom: 40px;">Sistema de Acupressão Funcionando 100%</p>
            <div id="content"></div>
        </div>
        <script>
            fetch('/api/techniques')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('content').innerHTML = 
                        '<h2>✅ ' + data.length + ' Técnicas Carregadas</h2>' +
                        data.map(t => '<div style="background: rgba(255,255,255,0.1); margin: 10px; padding: 20px; border-radius: 10px;"><h3>' + t.name + '</h3><p>' + t.description + '</p></div>').join('');
                });
        </script>
    </body></html>
    """

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

   
