import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, Users, BarChart3, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';

const ReviewModal = ({ isOpen, onClose, techniqueId, techniqueName, onReviewSubmitted }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async () => {
    if (rating === 0 || !techniqueId) return;
    
    setSubmitting(true);
    try {
      await apiService.createReview({
        technique_id: techniqueId,
        rating: rating,
        comment: comment || '',
        session_duration: 60
      });
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      onClose();
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Avaliar {techniqueName}
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">Como foi sua experiência com esta técnica?</p>
          
          {/* Rating Stars */}
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1"
              >
                <Star 
                  className={`w-8 h-8 ${
                    (hoveredRating || rating) >= star 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          
          {/* Rating Labels */}
          <div className="text-center text-sm text-gray-500 mb-4">
            {rating === 1 && "Muito ruim"}
            {rating === 2 && "Ruim"}
            {rating === 3 && "Regular"}
            {rating === 4 && "Bom"}
            {rating === 5 && "Excelente"}
          </div>
          
          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentário opcional..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={submitReview}
            disabled={rating === 0 || submitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ReviewsAnalytics = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiService.getReviewStats();
      setStats(data || null);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando estatísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-gray-500">
        Nenhuma avaliação disponível ainda.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Analytics de Avaliações</h2>
        <BarChart3 className="w-6 h-6 text-blue-600" />
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">{stats.total_reviews}</div>
          <div className="text-sm text-blue-600">Total de Avaliações</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-900">{stats.positive_reviews}</div>
          <div className="text-sm text-green-600">Positivas (4-5★)</div>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-900">{stats.negative_reviews}</div>
          <div className="text-sm text-red-600">Negativas (1-2★)</div>
        </div>
        
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-900">{stats.average_rating}</div>
          <div className="text-sm text-yellow-600">Média Geral</div>
        </div>
      </div>

      {/* Percentuais */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Distribuição de Feedback</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Avaliações Positivas</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.positive_percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-green-600">
                {stats.positive_percentage}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Avaliações Negativas</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.negative_percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-red-600">
                {stats.negative_percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de Tendência */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status Geral:</span>
          <div className="flex items-center space-x-2">
            {stats.positive_percentage > stats.negative_percentage ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">Tendência Positiva</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-red-600 font-medium">Needs Attention</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar avaliações de uma técnica específica
const TechniqueReviews = ({ techniqueId }) => {
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (techniqueId) {
      loadTechniqueReviews();
    }
  }, [techniqueId]);

  const loadTechniqueReviews = async () => {
    try {
      const data = await apiService.getTechniqueReviews(techniqueId);
      setReviews(data || null);
    } catch (error) {
      console.error('Erro ao carregar avaliações da técnica:', error);
      setReviews(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando avaliações...</div>;
  }

  if (!reviews || reviews.total_reviews === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Nenhuma avaliação ainda.</p>
        <p className="text-sm">Seja o primeiro a avaliar esta técnica!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Avaliações</h3>
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          <span className="font-medium">{reviews.average_rating}</span>
          <span className="text-gray-500 text-sm">({reviews.total_reviews} avaliações)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Positivas:</span>
          <span className="text-green-600 font-medium">{reviews.positive_reviews}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Negativas:</span>
          <span className="text-red-600 font-medium">{reviews.negative_reviews}</span>
        </div>
      </div>

      {/* Últimas avaliações */}
      {reviews.latest_reviews.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Comentários Recentes</h4>
          {reviews.latest_reviews.map((review, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
              <div className="flex items-center space-x-2 mb-1">
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
                <span className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-700">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { ReviewModal, ReviewsAnalytics, TechniqueReviews };