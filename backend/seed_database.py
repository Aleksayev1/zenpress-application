import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Conectar ao MongoDB
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Técnicas com imagens atualizadas
SEED_TECHNIQUES = [
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
        "image": "https://i.imgur.com/3yulsbz_d.jpeg?maxwidth=520&shape=thumb&fidelity=high",
        "duration": 60,
        "pressure": "Leve a moderada",
        "warnings": ["Não aplicar muita pressão", "Parar se sentir tontura"],
        "is_premium": False
    },
    {
        "id": "2", 
        "name": "Dor nas costas Ponto Extra - Craniopuntura Ponto Extra",
        "category": "craniopuntura",
        "condition": "Dor nas costas, tensões musculares",
        "description": "Ponto Extra da Craniopuntura especializado em dores nas costas e tensões",
        "instructions": [
            "Localize o ponto no topo da cabeça, onde uma linha das orelhas se encontra",
            "Use a ponta dos dedos para aplicar pressão suave",
            "Mantenha por 1 minuto com respiração profunda",
            "Realize pequenos movimentos circulares"
        ],
        "image": "https://i.imgur.com/Se2j0Mn.jpeg",
        "duration": 60,
        "pressure": "Leve",
        "warnings": ["Não pressionar muito forte", "Ideal fazer sentado"],
        "is_premium": False
    },
    {
        "id": "3",
        "name": "Dor nas mãos - Craniopuntura ponto C",
        "category": "craniopuntura", 
        "condition": "Dor nas mãos, articulações",
        "description": "Técnica do Ponto C da Craniopuntura focada em dores e tensões nas mãos",
        "instructions": [
            "Localize as depressões nas têmporas, ao lado dos olhos",
            "Use os dedos indicador e médio de ambas as mãos",
            "Aplique pressão suave e simétrica em ambos os lados",
            "Mantenha por 1 minuto com movimentos circulares lentos"
        ],
        "image": "https://i.imgur.com/1MvTRPx.jpeg",
        "duration": 60,
        "pressure": "Leve a moderada",
        "warnings": ["Pressão simétrica em ambos os lados", "Parar se aumentar a dor"],
        "is_premium": False
    },
    {
        "id": "7",
        "name": "Ponto F: Nervo isquiático (ciático)",
        "category": "craniopuntura",
        "condition": "Lombalgia, isquialgias, dor ciática",
        "description": "Ponto específico para tratamento do nervo isquiático, usado principalmente para lombalgia e isquialgias",
        "instructions": [
            "Localize o ponto na região posterior da cabeça, próximo ao occipital",
            "Use o dedo indicador para aplicar pressão firme e direcionada",
            "Mantenha pressão constante por 1 minuto",
            "Realize movimentos circulares lentos no sentido horário"
        ],
        "image": "https://i.imgur.com/6GnGbqz.jpeg",
        "duration": 60,
        "pressure": "Moderada",
        "warnings": ["Técnica para assinantes", "Consulte profissional para dores crônicas"],
        "is_premium": True
    },
    {
        "id": "4",
        "name": "Ponto Hegu (LI4)",
        "category": "mtc",
        "condition": "Dor geral, imunidade, dor de cabeça",
        "description": "Localizado na mão, entre o polegar e indicador",
        "instructions": [
            "Localize o ponto na membrana entre polegar e indicador",
            "Use o polegar da mão oposta para aplicar pressão",
            "Pressione firmemente por 1 minuto", 
            "Alterne entre as duas mãos"
        ],
        "image": "https://i.imgur.com/FT6j1Od.jpeg",
        "duration": 60,
        "pressure": "Moderada a forte",
        "warnings": ["Contraindicado na gravidez", "Pode causar sensibilidade inicial"],
        "is_premium": False
    },
    {
        "id": "5",
        "name": "Ponto Zusanli (ST36)",
        "category": "mtc",
        "condition": "Digestão, energia, imunidade",
        "description": "Localizado na perna, abaixo do joelho",
        "instructions": [
            "Localize o ponto 4 dedos abaixo da rótula, na lateral externa da perna",
            "Use o polegar para aplicar pressão firme",
            "Mantenha por 1 minuto em cada perna",
            "Realize movimentos circulares pequenos"
        ],
        "image": "https://i.imgur.com/b5K0duf_d.jpeg?maxwidth=520&shape=thumb&fidelity=high",
        "duration": 60,
        "pressure": "Moderada",
        "warnings": ["Localização precisa é importante", "Pode sentir sensação elétrica"],
        "is_premium": False
    },
    {
        "id": "6",
        "name": "Ponto C7 - Shenmen (HE7)",
        "category": "mtc", 
        "condition": "Ansiedade, insônia, stress",
        "description": "C7 acalma a mente - localizado no punho, na dobra junto ao dedo mínimo",
        "instructions": [
            "Localize na dobra do punho, do lado do dedo mínimo",
            "Use o polegar para aplicar pressão suave",
            "Mantenha por 1 minuto, respirando calmamente",
            "Pode ser feito várias vezes ao dia"
        ],
        "image": "https://i.imgur.com/k6kdCzS.jpeg",
        "duration": 60,
        "pressure": "Leve a moderada",
        "warnings": ["Evitar pressão excessiva", "Parar se sentir formigamento"],
        "is_premium": False
    }
]

async def seed_database():
    try:
        print("🔄 Iniciando seed do banco de dados...")
        
        # Limpar coleção existente
        await db.techniques.delete_many({})
        print("🗑️ Coleção techniques limpa")
        
        # Inserir técnicas
        if SEED_TECHNIQUES:
            result = await db.techniques.insert_many(SEED_TECHNIQUES)
            print(f"📝 Inseridas {len(result.inserted_ids)} técnicas")
            
        # Verificar Yamamoto A especificamente
        yamamoto_a = await db.techniques.find_one({"name": "Ponto Yamamoto A (YNSA)"})
        if yamamoto_a:
            print(f"✅ Yamamoto A inserido com imagem: {yamamoto_a['image']}")
        else:
            print("❌ Yamamoto A não encontrado")
            
        # Verificar todas as técnicas
        all_techniques = await db.techniques.find({}).to_list(100)
        print(f"📊 Total de técnicas no banco: {len(all_techniques)}")
        
        for tech in all_techniques:
            print(f"  - {tech['name']} ({'Premium' if tech.get('is_premium') else 'Gratuita'})")
        
        print("✅ Seed executado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro no seed: {e}")

if __name__ == "__main__":
    asyncio.run(seed_database())