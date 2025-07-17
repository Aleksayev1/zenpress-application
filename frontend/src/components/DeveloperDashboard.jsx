import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Star, 
  MessageSquare,
  Calendar,
  Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReviewsAnalytics } from './ReviewsAnalytics';
import { apiService } from '../services/api';

const DeveloperDashboard = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDeveloperAnalytics(timeRange);
      setAnalytics(data || null);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Carregando Analytics...</h2>
            <p className="text-gray-600">Processando dados de avaliações</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics ZenPress</h1>
            <p className="text-gray-600">Dashboard de feedback e avaliações - Estilo Google Play Console</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={90}>Últimos 90 dias</option>
            </select>
            
            <Button onClick={loadAnalytics} variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <ReviewsAnalytics />

        {analytics && (
          <>
            {/* Gráfico de Tendência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Tendências Diárias ({timeRange} dias)
                </CardTitle>
                <CardDescription>
                  Avaliações positivas vs negativas por dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.daily_reviews.slice(-7).map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(day.date).toLocaleDateString('pt-BR', { 
                            weekday: 'short', 
                            day: '2-digit', 
                            month: '2-digit' 
                          })}
                        </span>
                        <Badge variant="outline">{day.total} avaliações</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">{day.positive}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600 font-medium">{day.negative}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-gray-700 font-medium">{day.average}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ranking de Técnicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Ranking de Técnicas por Avaliação
                </CardTitle>
                <CardDescription>
                  Performance das técnicas ordenada por média de avaliações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.technique_rankings.map((technique, index) => (
                    <div key={technique.technique_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{technique.technique_name}</h3>
                          <p className="text-sm text-gray-600">{technique.total_reviews} avaliações</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-bold text-lg">{technique.average_rating}</span>
                          </div>
                          <span className="text-xs text-gray-500">Média</span>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-green-600 font-semibold">{technique.positive_reviews}</div>
                          <span className="text-xs text-gray-500">Positivas</span>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-red-600 font-semibold">{technique.negative_reviews}</div>
                          <span className="text-xs text-gray-500">Negativas</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Recente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Feedback Recente da Comunidade
                </CardTitle>
                <CardDescription>
                  Últimas avaliações e comentários dos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recent_feedback.map((review, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 py-3 bg-gray-50 rounded-r-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[1,2,3,4,5].map(star => (
                              <Star 
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {review.technique_name}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      {review.comment && (
                        <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights e Tendências */}
            <Card>
              <CardHeader>
                <CardTitle>Insights e Recomendações</CardTitle>
                <CardDescription>Análise automática baseada nos dados coletados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Avaliação Mais Comum
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-xl font-bold text-blue-900">
                        {analytics.trends.most_common_rating}
                      </span>
                      <span className="text-blue-700">estrelas</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">
                      Taxa de Retenção Estimada
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="text-xl font-bold text-green-900">
                        {analytics.trends.user_retention}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                  <h4 className="font-medium text-yellow-900 mb-1">💡 Recomendação</h4>
                  <p className="text-sm text-yellow-800">
                    {analytics.overall_stats.positive_percentage > 80 
                      ? "Excelente performance! Continue focando nas técnicas mais bem avaliadas."
                      : analytics.overall_stats.negative_percentage > 30
                      ? "Atenção: Taxa de avaliações negativas elevada. Considere revisar as técnicas com menor performance."
                      : "Performance moderada. Foque em melhorar a experiência das técnicas com avaliações neutras."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default DeveloperDashboard;