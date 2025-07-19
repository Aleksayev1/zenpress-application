import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, AlertCircle, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { mockData } from '../mock';

const CategoryView = () => {
  const { categoryId } = useParams();
  const { t } = useTranslation();
  const [techniques, setTechniques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const category = mockData.categories.find(cat => 
    (cat.id === 1 && categoryId === 'craniopuntura') || 
    (cat.id === 2 && categoryId === 'mtc')
  );

  useEffect(() => {
    const loadTechniques = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getTechniques(categoryId);
        setTechniques(data);
      } catch (err) {
        console.error('Erro ao carregar técnicas:', err);
        setError('Erro ao carregar técnicas. Usando dados offline.');
        // Fallback adicional se o apiService falhar
        try {
          const { getMockTechniques } = await import('../mock');
          const mockTechniques = getMockTechniques(categoryId);
          setTechniques(mockTechniques);
        } catch (mockError) {
          console.error('Erro no fallback offline:', mockError);
          setTechniques([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadTechniques();
    }
  }, [categoryId]);

  if (!category) {
    return <div className="text-center py-8">{t('common.categoryNotFound', 'Categoria não encontrada')}</div>;
  }

  if (loading) {
    return <div className="text-center py-8">{t('common.loadingTechniques', 'Carregando técnicas...')}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{category.icon}</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          {categoryId === 'craniopuntura' ? t('home.categories.craniopuncture.name', 'Craniopuntura') : t('home.categories.tcm.name', 'MTC (Medicina Tradicional Chinesa)')}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
          {categoryId === 'craniopuntura' ? t('home.categories.craniopuncture.description', 'Técnicas de estimulação de pontos no couro cabeludo para alívio de dores e melhoria da saúde geral') : t('home.categories.tcm.description', 'Pontos de acupressão baseados na medicina tradicional chinesa para equilibrio energético')}
        </p>
        <Badge variant="secondary" className="text-sm">
          {techniques.length} {t('home.techniques', 'técnicas')} {t('common.available', 'disponíveis')}
        </Badge>
      </div>

      {/* Techniques Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {techniques.map((technique) => (
          <Card key={technique.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="relative">
              <img 
                src={technique.image} 
                alt={technique.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                {mockData.userFavorites.includes(technique.id) && (
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                )}
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-black/70 text-white border-0">
                  {technique.pressure}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                {technique.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                <Badge variant="outline" className="mr-2 text-xs">
                  {technique.condition}
                </Badge>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {technique.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{technique.duration}{t('common.seconds', 's')}</span>
                </div>
                
                {technique.warnings.length > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>{technique.warnings.length} {t('common.warnings', 'avisos')}</span>
                  </div>
                )}
              </div>
              
              <Button asChild className="w-full" size="sm">
                <Link to={`/technique/${technique.id}`}>
                  {t('techniques.startTechnique', 'Iniciar Técnica')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Safety Information */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            <span>Informações de Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-700">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Contraindicações:</h4>
              <ul className="text-sm space-y-1">
                {mockData.medicalDisclaimers.contraindications.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Procure ajuda médica se:</h4>
              <ul className="text-sm space-y-1">
                {mockData.medicalDisclaimers.whenToSeekHelp.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryView;