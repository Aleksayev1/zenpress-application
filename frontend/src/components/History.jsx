import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Clock, 
  Star, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  ArrowRight,
  Activity
} from 'lucide-react';
import { mockData } from '../mock';

const History = () => {
  const { userHistory, commonComplaints } = mockData;
  
  // Calculate stats
  const totalSessions = userHistory.length;
  const avgRating = userHistory.reduce((acc, session) => acc + session.rating, 0) / totalSessions || 0;
  const mostUsedComplaint = userHistory.reduce((acc, session) => {
    acc[session.complaint] = (acc[session.complaint] || 0) + 1;
    return acc;
  }, {});
  
  const topComplaint = Object.entries(mostUsedComplaint).sort(([,a], [,b]) => b - a)[0];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-0.5">
        {[1,2,3,4,5].map(star => (
          <Star 
            key={star} 
            className={`h-3 w-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Histórico de Tratamentos
        </h1>
        <p className="text-lg text-gray-600">
          Acompanhe seu progresso e análise suas sessões de acupressão
        </p>
      </div>

      {userHistory.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma sessão registrada ainda
            </h3>
            <p className="text-gray-500 mb-6">
              Comece a usar as técnicas para ver seu histórico e progresso aqui
            </p>
            <Button asChild>
              <Link to="/">Iniciar Primeira Sessão</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  Sessões realizadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
                <div className="flex items-center space-x-2 mt-1">
                  {renderStars(Math.round(avgRating))}
                  <span className="text-xs text-muted-foreground">de 5</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Principal Queixa</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{topComplaint ? topComplaint[0] : 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  {topComplaint ? `${topComplaint[1]} sessões` : 'Sem dados'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Sessões Recentes</span>
              </CardTitle>
              <CardDescription>
                Suas últimas sessões de acupressão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userHistory.slice(0, 5).map((session, index) => (
                  <div key={session.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium text-gray-800">
                            {session.techniqueName}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {session.complaint}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(session.date)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{session.duration}s</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {renderStars(session.rating)}
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/technique/${session.techniqueId}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    {index < userHistory.slice(0, 5).length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Community Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Tendências da Comunidade</span>
              </CardTitle>
              <CardDescription>
                Veja as queixas mais tratadas pela comunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {commonComplaints.slice(0, 8).map((complaint) => (
                  <div key={complaint.id} className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <span className="text-sm font-medium text-gray-700">{complaint.complaint}</span>
                      {complaint.trending && (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {complaint.count} pessoas
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default History;