// Mock data para o app de acupressão
export const mockData = {
  categories: [
    {
      id: 1,
      name: "Craniopuntura",
      description: "Técnicas de estimulação de pontos no couro cabeludo para alívio de dores e melhoria da saúde geral",
      icon: "🧠",
      color: "bg-gradient-to-br from-blue-500 to-indigo-600"
    },
    {
      id: 2, 
      name: "MTC (Medicina Tradicional Chinesa)",
      description: "Pontos de acupressão baseados na medicina tradicional chinesa para equilibrio energético",
      icon: "☯️",
      color: "bg-gradient-to-br from-emerald-500 to-teal-600"
    }
  ],

  techniques: {
    craniopuntura: [
      {
        id: 1,
        name: "Dor de Cabeça - Craniopuntura Ponto A",
        category: "craniopuntura",
        condition: "Dor de cabeça, cefaleia",
        description: "Técnica específica do Ponto A da Craniopuntura para alívio de dores de cabeça",
        instructions: [
          "Localize o ponto no centro da testa, entre as sobrancelhas",
          "Use o dedo médio para aplicar pressão suave e constante",
          "Mantenha a pressão por 1 minuto, respirando profundamente",
          "Realize movimentos circulares leves no sentido horário"
        ],
        image: "https://i.imgur.com/3yulsbz.jpeg",
        duration: 60,
        pressure: "Leve a moderada",
        warnings: ["Não aplicar muita pressão", "Parar se sentir tontura"]
      },
      {
        id: 2,
        name: "Dor nas costas Ponto Extra - Craniopuntura Ponto Extra",
        category: "craniopuntura",
        condition: "Dor nas costas, tensões musculares",
        description: "Ponto Extra da Craniopuntura especializado em dores nas costas e tensões",
        instructions: [
          "Localize o ponto no topo da cabeça, onde uma linha das orelhas se encontra",
          "Use a ponta dos dedos para aplicar pressão suave",
          "Mantenha por 1 minuto com respiração profunda",
          "Realize pequenos movimentos circulares"
        ],
        image: "https://i.imgur.com/tjjobPp.jpeg",
        duration: 60,
        pressure: "Leve",
        warnings: ["Não pressionar muito forte", "Ideal fazer sentado"]
      },
      {
        id: 3,
        name: "Dor nas mãos - Craniopuntura ponto C",
        category: "craniopuntura", 
        condition: "Dor nas mãos, articulações",
        description: "Técnica do Ponto C da Craniopuntura focada em dores e tensões nas mãos",
        instructions: [
          "Localize as depressões nas têmporas, ao lado dos olhos",
          "Use os dedos indicador e médio de ambas as mãos",
          "Aplique pressão suave e simétrica em ambos os lados",
          "Mantenha por 1 minuto com movimentos circulares lentos"
        ],
        image: "https://i.imgur.com/1MvTRPx.jpeg",
        duration: 60,
        pressure: "Leve a moderada",
        warnings: ["Pressão simétrica em ambos os lados", "Parar se aumentar a dor"]
      },
      {
        id: 7,
        name: "Ponto F: Nervo isquiático (ciático)",
        category: "craniopuntura",
        condition: "Lombalgia, isquialgias, dor ciática",
        description: "Ponto específico para tratamento do nervo isquiático, usado principalmente para lombalgia e isquialgias",
        instructions: [
          "Localize o ponto na região posterior da cabeça, próximo ao occipital",
          "Use o dedo indicador para aplicar pressão firme e direcionada",
          "Mantenha pressão constante por 1 minuto",
          "Realize movimentos circulares lentos no sentido horário"
        ],
        image: "https://i.imgur.com/6GnGbqz.jpeg",
        duration: 60,
        pressure: "Moderada",
        warnings: ["Técnica para assinantes", "Consulte profissional para dores crônicas"],
        is_premium: true
      }
    ],
    mtc: [
      {
        id: 4,
        name: "Ponto Hegu (LI4)",
        category: "mtc",
        condition: "Dor geral, imunidade, dor de cabeça",
        description: "Localizado na mão, entre o polegar e indicador",
        instructions: [
          "Localize o ponto na membrana entre polegar e indicador",
          "Use o polegar da mão oposta para aplicar pressão",
          "Pressione firmemente por 1 minuto",
          "Alterne entre as duas mãos"
        ],
        image: "https://i.imgur.com/FT6j1Od.jpeg",
        duration: 60,
        pressure: "Moderada a forte",
        warnings: ["Contraindicado na gravidez", "Pode causar sensibilidade inicial"]
      },
      {
        id: 5,
        name: "Ponto Zusanli (ST36)",
        category: "mtc",
        condition: "Digestão, energia, imunidade",
        description: "Localizado na perna, abaixo do joelho",
        instructions: [
          "Localize o ponto 4 dedos abaixo da rótula, na lateral externa da perna",
          "Use o polegar para aplicar pressão firme",
          "Mantenha por 1 minuto em cada perna",
          "Realize movimentos circulares pequenos"
        ],
        image: "https://i.imgur.com/b5K0duf.jpeg",
        duration: 60,
        pressure: "Moderada",
        warnings: ["Localização precisa é importante", "Pode sentir sensação elétrica"]
      },
      {
        id: 6,
        name: "Ponto C7 - Shenmen (HE7)",
        category: "mtc",
        condition: "Ansiedade, insônia, stress",
        description: "C7 acalma a mente - localizado no punho, na dobra junto ao dedo mínimo",
        instructions: [
          "Localize na dobra do punho, do lado do dedo mínimo",
          "Use o polegar para aplicar pressão suave",
          "Mantenha por 1 minuto, respirando calmamente",
          "Pode ser feito várias vezes ao dia"
        ],
        image: "https://i.imgur.com/k6kdCzS.jpeg",
        duration: 60,
        pressure: "Leve a moderada", 
        warnings: ["Ideal para relaxamento", "Não pressionar muito forte"]
      }
    ]
  },

  // Histórico de queixas mais comuns
  commonComplaints: [
    { id: 1, complaint: "Dor de cabeça tensional", count: 45, trending: true },
    { id: 2, complaint: "Ansiedade e stress", count: 38, trending: true },
    { id: 3, complaint: "Dor nas costas", count: 32, trending: false },
    { id: 4, complaint: "Insônia", count: 28, trending: true },
    { id: 5, complaint: "Fadiga mental", count: 25, trending: false },
    { id: 6, complaint: "Problemas digestivos", count: 22, trending: false },
    { id: 7, complaint: "Enxaqueca", count: 19, trending: true },
    { id: 8, complaint: "Baixa imunidade", count: 15, trending: false }
  ],

  // Favoritos do usuário (simulado)
  userFavorites: [1, 4, 6],

  // Histórico de uso
  userHistory: [
    {
      id: 1,
      techniqueId: 1,
      techniqueName: "Ponto Yintang (EX-HN3)",
      date: "2025-01-15",
      duration: 60,
      complaint: "Dor de cabeça tensional",
      rating: 4
    },
    {
      id: 2,
      techniqueId: 4,
      techniqueName: "Ponto Hegu (LI4)",
      date: "2025-01-14",
      duration: 60,
      complaint: "Stress",
      rating: 5
    },
    {
      id: 3,
      techniqueId: 6,
      techniqueName: "Ponto Shenmen (HE7)",
      date: "2025-01-13",
      duration: 60,
      complaint: "Ansiedade",
      rating: 4
    }
  ],

  // Disclaimers médicos
  medicalDisclaimers: {
    general: "Este aplicativo é apenas para fins educacionais e informativos. Não substitui consulta médica profissional.",
    contraindications: [
      "Gravidez (alguns pontos são contraindicados)",
      "Condições cardíacas graves",
      "Infecções ou feridas na área de aplicação",
      "Medicamentos anticoagulantes (consulte médico)"
    ],
    whenToSeekHelp: [
      "Dor intensa que não melhora",
      "Sintomas que pioram após aplicação",
      "Febre ou sinais de infecção",
      "Dores que persistem por mais de uma semana"
    ]
  }
};

// Funções utilitárias para o mock
export const getMockTechniques = (category) => {
  return mockData.techniques[category] || [];
};

export const getMockTechniqueById = (id) => {
  const allTechniques = [...mockData.techniques.craniopuntura, ...mockData.techniques.mtc];
  return allTechniques.find(tech => tech.id === parseInt(id));
};

export const addToMockFavorites = (techniqueId) => {
  if (!mockData.userFavorites.includes(techniqueId)) {
    mockData.userFavorites.push(techniqueId);
  }
};

export const removeFromMockFavorites = (techniqueId) => {
  const index = mockData.userFavorites.indexOf(techniqueId);
  if (index > -1) {
    mockData.userFavorites.splice(index, 1);
  }
};

export const addToMockHistory = (session) => {
  const newEntry = {
    id: mockData.userHistory.length + 1,
    ...session,
    date: new Date().toISOString().split('T')[0]
  };
  mockData.userHistory.unshift(newEntry);
};