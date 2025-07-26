import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Clock, ArrowRight } from 'lucide-react';
import { mockData, getMockTechniqueById, removeFromMockFavorites } from '../mock';

const Favorites = () => {
  const favoriteTechniques = mockData.userFavorites.map(id => getMockTechniqueById(id)).filter(Boolean);

  const handleRemoveFavorite = (techniqueId) => {
    removeFromMockFavorites(techniqueId);
    // Force re-render by updating the component
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Técnicas Favoritas
        </h1>
        <p className="text-lg text-gray-600">
          Suas técnicas de acupressão salvas para acesso rápido
        </p>
      </div>

      {favoriteTechniques.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma técnica favorita ainda
            </h3>
            <p className="text-gray-500 mb-6">
              Explore as técnicas e adicione suas favoritas para acesso rápido
            </p>
            <Button asChild>
              <Link to="/">Explorar Técnicas</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteTechniques.map((technique) => (
            <Card key={technique.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <div className="relative">
                <img 
                  src={technique.image} 
                  alt={technique.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFavorite(technique.id)}
                    className="bg-black/50 hover:bg-black/70 text-white p-1 h-auto"
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </Button>
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
                  <Badge variant="secondary" className="text-xs">
                    {technique.category === 'craniopuntura' ? 'Craniopuntura' : 'MTC'}
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
                    <span>{technique.duration}s</span>
                  </div>
                </div>
                
                <Button asChild className="w-full" size="sm">
                  <Link to={`/technique/${technique.id}`} className="flex items-center justify-center space-x-2">
                    <span>Aplicar Agora</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {favoriteTechniques.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            {favoriteTechniques.length} técnica{favoriteTechniques.length !== 1 ? 's' : ''} salva{favoriteTechniques.length !== 1 ? 's' : ''}
          </p>
          <Button variant="outline" asChild>
            <Link to="/">Explorar Mais Técnicas</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Favorites;