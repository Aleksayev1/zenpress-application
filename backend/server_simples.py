from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dados estáticos para funcionar IMEDIATAMENTE
TECHNIQUES = [
    {
        "id": "1",
        "name": "Dor de Cabeça - Craniopuntura Ponto A",
        "category": "craniopuntura",
        "description": "Técnica para alívio de dores de cabeça",
        "instructions": [
            "Localize o ponto no centro da testa",
            "Aplique pressão suave por 1 minuto",
            "Respire profundamente",
            "Realize movimentos circulares leves"
        ],
        "image": "https://i.imgur.com/3yulsbz.jpeg",
        "duration": 60,
        "pressure": "Leve a moderada",
        "warnings": ["Não aplicar muita pressão"],
        "is_premium": False
    },
    {
        "id": "2", 
        "name": "Ponto Hegu (LI4)",
        "category": "mtc",
        "description": "Ponto clássico da medicina tradicional chinesa",
        "instructions": ["Localize entre polegar e indicador", "Pressione firmemente", "Mantenha por 30 segundos"],
        "image": "https://i.imgur.com/zusanli.jpeg",
        "duration": 30,
        "pressure": "Moderada",
        "warnings": ["Evitar durante gravidez"],
        "is_premium": False
    }
]

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
def login():
    return {"token": "demo_token", "user": {"email": "demo@zenpress.com"}}

@app.post("/api/auth/register") 
def register():
    return {"message": "Usuário criado com sucesso", "user": {"email": "demo@zenpress.com"}}

if __name__ == "__main__": import uvicorn; uvicorn.run(app, host="0.0.0.0", port=8001)