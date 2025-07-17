import { useState, useEffect } from 'react';
import { apiService } from './api';

// Configuração para alternar entre mock e dados reais
const USE_REAL_ANALYTICS = false; // Mudar para true quando tiver dados suficientes
const MIN_USERS_FOR_REAL_DATA = 100; // Mínimo de usuários para dados reais

// Dados mock para demonstração
const mockCommunityData = {
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
  totalUsers: 50, // Simulado - em produção viria da API
  lastUpdated: new Date().toISOString(),
  isRealData: false
};

// Serviço de analytics da comunidade
export const communityAnalyticsService = {
  // Obter dados de tendências da comunidade
  async getCommunityTrends() {
    try {
      if (USE_REAL_ANALYTICS) {
        // Quando tiver dados suficientes, usar API real
        const response = await apiService.get('/analytics/community-trends');
        return {
          ...response.data,
          isRealData: true,
          lastUpdated: new Date().toISOString()
        };
      } else {
        // Por enquanto, usar dados mock
        return {
          ...mockCommunityData,
          disclaimer: "Dados simulados para demonstração. Serão atualizados com dados reais quando houver usuários suficientes."
        };
      }
    } catch (error) {
      console.error('Erro ao obter tendências:', error);
      // Fallback para dados mock em caso de erro
      return {
        ...mockCommunityData,
        disclaimer: "Dados temporários. API em desenvolvimento."
      };
    }
  },

  // Verificar se há usuários suficientes para dados reais
  async checkDataAvailability() {
    try {
      const stats = await apiService.get('/analytics/user-stats');
      return stats.data.totalUsers >= MIN_USERS_FOR_REAL_DATA;
    } catch (error) {
      return false;
    }
  },

  // Obter estatísticas gerais
  async getGeneralStats() {
    try {
      if (USE_REAL_ANALYTICS) {
        const response = await apiService.get('/analytics/general-stats');
        return response.data;
      } else {
        return {
          totalSessions: 1247,
          activeUsers: 89,
          averageSessionDuration: 3.2,
          mostUsedTechnique: "Yintang",
          isRealData: false
        };
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return null;
    }
  }
};

// Hook React para usar dados de comunidade
export const useCommunityData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const communityData = await communityAnalyticsService.getCommunityTrends();
        setData(communityData);
      } catch (err) {
        setError('Erro ao carregar dados da comunidade');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export default communityAnalyticsService;