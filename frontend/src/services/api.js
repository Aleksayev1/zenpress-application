import axios from 'axios';

// Configuração da API
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  // Try both token keys (legacy 'token' and new 'zenpress_token')
  const token = localStorage.getItem('zenpress_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 API - Token enviado:', token.substring(0, 20) + '...');
  } else {
    console.log('⚠️ API - Nenhum token encontrado no localStorage');
  }
  return config;
});

// Serviços de API
export const apiService = {
  // Técnicas
  async getTechniques(category = null) {
    try {
      const url = category ? `/techniques?category=${category}` : '/techniques';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.warn('API failed, using offline data:', error.message);
      // Fallback para dados offline usando a função específica
      const { getMockTechniques } = await import('../mock');
      return getMockTechniques(category);
    }
  },

  async getTechniqueById(id) {
    try {
      const response = await api.get(`/techniques/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API failed, using offline data:', error.message);
      // Fallback para dados offline usando a função específica
      const { getMockTechniqueById } = await import('../mock');
      const technique = getMockTechniqueById(id);
      if (!technique) {
        throw new Error(`Técnica com ID ${id} não encontrada`);
      }
      return technique;
    }
  },

  // Autenticação
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Favoritos
  async getFavorites() {
    const response = await api.get('/favorites');
    return response.data;
  },

  async addToFavorites(techniqueId) {
    const response = await api.post('/favorites', { technique_id: techniqueId });
    return response.data;
  },

  async removeFromFavorites(techniqueId) {
    const response = await api.delete(`/favorites/${techniqueId}`);
    return response.data;
  },

  // Sessões/Histórico
  async createSession(sessionData) {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  },

  async getSessions() {
    const response = await api.get('/sessions');
    return response.data;
  },

  // Estatísticas
  async getUserStats() {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Premium/Assinatura
  async createSubscription(planData) {
    const response = await api.post('/subscription/create', planData);
    return response.data;
  },

  // Reviews/Avaliações
  async createReview(reviewData) {
    const response = await api.post('/reviews/create', reviewData);
    return response.data;
  },

  async getReviewStats() {
    const response = await api.get('/reviews/stats');
    return response.data;
  },

  async getTechniqueReviews(techniqueId) {
    const response = await api.get(`/reviews/technique/${techniqueId}`);
    return response.data;
  },

  async getDeveloperAnalytics(days = 30) {
    const response = await api.get(`/reviews/analytics?days=${days}`);
    return response.data;
  },

  async getUserReviews() {
    const response = await api.get('/reviews/my-reviews');
    return response.data;
  },

  async deleteReview(reviewId) {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Helper methods para API
  async get(url) {
    const response = await api.get(url);
    return response;
  },

  async post(url, data) {
    const response = await api.post(url, data);
    return response;
  },

  async put(url, data) {
    const response = await api.put(url, data);
    return response;
  },

  async delete(url) {
    const response = await api.delete(url);
    return response;
  }
};

export default api;