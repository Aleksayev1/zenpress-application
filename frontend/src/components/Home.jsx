import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, TrendingUp, Users, Play, Pause, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCommunityData } from '../services/communityAnalytics';
import { mockData } from '../mock';
import { AuthProvider, useAuth } from './AuthContext';
import SpotifyPlayer from './SpotifyPlayer';

const Home = () => {
  const { t } = useTranslation();
  const { data: communityData, loading: communityLoading } = useCommunityData();
  const { user } = useAuth();
  
  // Timer states for mental health techniques
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  
  // Breathing guide states
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // 'inhale', 'hold', 'exhale'
  const [breathingTimeLeft, setBreathingTimeLeft] = useState(4);
  const [breathingCycle, setBreathingCycle] = useState(0);
  
  // Spotify integration
  const [spotifyReady, setSpotifyReady] = useState(false);

  // Mental health techniques data
  const mentalHealthTechniques = {
    free: [
      {
        id: 'baihui_free',
        name: 'Baihui (GV20)',
        description: 'GV20 Baihui - Beneficia os Sentidos, consciência',
        image: 'https://i.imgur.com/WjvZvu0.jpeg',
        instructions: [
          'Localize o ponto no topo da cabeça',
          'Use o dedo médio para aplicar pressão suave',
          'Mantenha por 1 minuto respirando profundamente'
        ]
      },
      {
        id: 'ren17_free',
        name: 'Ren 17 (VC17)',
        description: 'VC 17 - Cansaço, Imunidade',
        image: 'https://i.imgur.com/gGFyvyd.jpeg',
        instructions: [
          'Localize o ponto no centro do peito',
          'Use os dedos para aplicar pressão suave',
          'Respire profundamente por 1 minuto'
        ]
      }
    ],
    premium: [
      {
        id: 'hegu_premium',
        name: 'Hegu (IG4)',
        description: 'Hegu IG4',
        image: 'https://i.imgur.com/WowkUvz.jpeg',
        instructions: [
          'Localize entre polegar e indicador',
          'Aplique pressão firme por 1 minuto',
          'Alterne entre as duas mãos'
        ]
      },
      {
        id: 'shenmen_premium',
        name: 'Shenmen (C7)',
        description: 'C7 acalma a mente - Tristeza, Estresse',
        image: 'https://i.imgur.com/k6kdCzS.jpeg',
        instructions: [
          'Localize na dobra do punho',
          'Pressione suavemente por 1 minuto',
          'Respire calmamente'
        ]
      },
      {
        id: 'yintang_premium',
        name: 'Yin Tang (Ex2)',
        description: 'Yintang Ex2 - Acalma a mente, determinação',
        image: 'https://i.imgur.com/G8fP2KJ.jpeg',
        instructions: [
          'Localize entre as sobrancelhas',
          'Aplique pressão suave por 1 minuto',
          'Movimentos circulares lentos'
        ]
      },
      {
        id: 'neiguan_premium',
        name: 'Neiguan (PC6)',
        description: 'Acalma a mente, medo, depressão',
        image: 'https://i.imgur.com/sJZbeiu.jpeg',
        instructions: [
          'Localize no antebraço, 3 dedos do punho',
          'Pressione firmemente por 1 minuto',
          'Respire profundamente'
        ]
      }
    ]
  };

  // Timer functions
  const startTimer = (techniqueId) => {
    if (activeTimer === techniqueId && isRunning) {
      setIsRunning(false);
      return;
    }
    
    setActiveTimer(techniqueId);
    setTimeLeft(60);
    setIsRunning(true);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          setActiveTimer(null);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setActiveTimer(null);
    setTimeLeft(60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Breathing guide functions
  const startBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
      setBreathingPhase('inhale');
      setBreathingTimeLeft(4);
      setBreathingCycle(0);
      return;
    }

    setBreathingActive(true);
    setBreathingPhase('inhale');
    setBreathingTimeLeft(4);
    setBreathingCycle(0);

    let currentPhase = 'inhale';
    let timeRemaining = 4;
    
    const breathingTimer = setInterval(() => {
      timeRemaining--;
      setBreathingTimeLeft(timeRemaining);
      
      if (timeRemaining <= 0) {
        if (currentPhase === 'inhale') {
          // Após 4 segundos de inspiração → ir para SEGURE por 7 segundos
          currentPhase = 'hold';
          timeRemaining = 7;
          setBreathingPhase('hold');
          setBreathingTimeLeft(7);
        } else if (currentPhase === 'hold') {
          // Após 7 segundos segurando → ir para EXPIRE por 8 segundos
          currentPhase = 'exhale';
          timeRemaining = 8;
          setBreathingPhase('exhale');
          setBreathingTimeLeft(8);
        } else if (currentPhase === 'exhale') {
          // Após 8 segundos expirando → completar ciclo
          setBreathingCycle((cycle) => {
            const newCycle = cycle + 1;
            if (newCycle >= 4) {
              // Completou 4 ciclos - parar
              clearInterval(breathingTimer);
              setBreathingActive(false);
              setBreathingPhase('inhale');
              setBreathingTimeLeft(4);
              setBreathingCycle(0);
              return 0;
            } else {
              // Iniciar novo ciclo - voltar para INSPIRE por 4 segundos
              currentPhase = 'inhale';
              timeRemaining = 4;
              setBreathingPhase('inhale');
              setBreathingTimeLeft(4);
              return newCycle;
            }
          });
        }
      }
    }, 1000);
  };

  const getBreathingInstruction = () => {
    if (!breathingActive) return 'Iniciar Respiração 4-7-8';
    
    switch (breathingPhase) {
      case 'inhale':
        return `Inspire profundamente (${breathingTimeLeft}s)`;
      case 'hold':
        return `Pare e segure (${breathingTimeLeft}s)`;
      case 'exhale':
        return `Expire completamente (${breathingTimeLeft}s)`;
      default:
        return 'Respiração Guiada 4-7-8';
    }
  };

  const getBreathingColor = () => {
    if (!breathingActive) return 'from-blue-500 to-cyan-500';
    
    switch (breathingPhase) {
      case 'inhale':
        return 'from-green-500 to-emerald-500';
      case 'hold':
        return 'from-yellow-500 to-orange-500';
      case 'exhale':
        return 'from-purple-500 to-indigo-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getBreathingScale = () => {
    if (!breathingActive) return 'scale-100';
    
    switch (breathingPhase) {
      case 'inhale':
        return 'scale-125';
      case 'hold':
        return 'scale-110';
      case 'exhale':
        return 'scale-90';
      default:
        return 'scale-100';
    }
  };

  const MentalHealthTechniqueCard = ({ technique, showTimer = true }) => (
    <div className="bg-gradient-to-br from-white/90 to-emerald-50/90 rounded-xl p-5 shadow-xl hover:shadow-2xl transition-all border-2 border-emerald-200 hover:border-emerald-300">
      <div className="flex items-center mb-4">
        <img 
          src={technique.image} 
          alt={technique.name}
          className="w-20 h-20 rounded-xl object-cover mr-4 shadow-lg border-2 border-emerald-200"
        />
        <div className="flex-1">
          <h4 className="font-bold text-emerald-900 text-base">{technique.name}</h4>
          <p className="text-sm text-gray-700 font-medium">{technique.description}</p>
        </div>
      </div>
      
      {showTimer && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={activeTimer === technique.id ? "default" : "outline"}
              onClick={() => startTimer(technique.id)}
              className="h-9 px-4 text-sm font-semibold border-2 border-emerald-300"
            >
              {activeTimer === technique.id && isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={resetTimer}
              className="h-9 px-3 text-sm border-2 border-gray-300"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-xl font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
            {activeTimer === technique.id ? formatTime(timeLeft) : "1:00"}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-700 bg-white/80 rounded-lg p-3 border border-emerald-200">
        <p className="font-bold mb-2 text-emerald-800">📋 Instruções:</p>
        <ul className="space-y-2">
          {technique.instructions.map((instruction, idx) => (
            <li key={idx} className="flex items-start">
              <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                {idx + 1}
              </span>
              <span className="font-medium">{instruction}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Development Notice */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 mb-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm md:text-base">
            🚀 <strong>{t('home.developmentNotice.title', 'Este aplicativo está sendo aprimorado!')}</strong> 
            <span className="mx-2">•</span>
            {t('home.developmentNotice.forQuestions', 'Para dúvidas')}: 
            <a 
              href="mailto:Aleksayev@zenpress.org" 
              className="underline hover:text-yellow-300 mx-1"
            >
              Aleksayev@zenpress.org
            </a>
          </p>
        </div>
      </div>

      {/* Header Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          {t('home.hero.title', 'Alívio Natural da Dor')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {t('home.hero.subtitle', 'Descubra técnicas milenares de acupressão e craniopuntura para tratar dores de cabeça, dores musculares, problemas digestivos e fortalecer sua imunidade')}
        </p>
      </div>

      {/* Medical Disclaimer Alert */}
      <Alert className="mb-8 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>{t('home.disclaimer.title', 'Aviso Médico:')}</strong> {t('home.disclaimer.text', 'Este aplicativo é apenas para fins educacionais e informativos. Não substitui consulta médica profissional. Consulte sempre um profissional de saúde para diagnósticos e tratamentos.')}
        </AlertDescription>
      </Alert>

      {/* Spotify Player Integration - Temporarily disabled */}
      {/* <div className="mb-12">
        <SpotifyPlayer onSpotifyReady={setSpotifyReady} />
      </div> */}

      {/* Promoção da Saúde Mental e Bem Estar - Seção Destacada */}
      <div className="mb-12">
        <Card className="border-0 bg-gradient-to-br from-emerald-100 via-green-100 to-cyan-100 shadow-2xl overflow-hidden">
          <div className="h-4 bg-gradient-to-r from-emerald-600 via-green-600 to-cyan-600"></div>
          <CardHeader className="text-center pb-6 bg-gradient-to-br from-emerald-50/90 to-green-50/90">
            <div className="mb-4">
              <div className="text-7xl mb-3">🧘‍♀️</div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent mb-4">
              {t('home.mentalHealth.title', 'Promoção da Saúde Mental e Bem Estar')}
            </CardTitle>
            <CardDescription className="text-xl text-gray-800 max-w-4xl mx-auto leading-relaxed font-medium">
              {t('home.mentalHealth.description', 'Descubra como as técnicas de acupressão podem contribuir significativamente para o seu equilíbrio emocional, redução do estresse, melhoria do sono e promoção do bem-estar mental. Nossa abordagem holística conecta corpo e mente para uma vida mais plena e saudável.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-gradient-to-br from-emerald-50/80 to-green-50/80">
            {/* Respiração Guiada */}
            <div className="mb-8 text-center">
              <div className="bg-white/90 rounded-xl p-6 shadow-lg border-2 border-emerald-200">
                <h3 className="text-2xl font-bold text-emerald-800 mb-4">
                  {t('home.mentalHealth.breathing.title', '🌬️ Respiração Guiada 4-7-8')}
                </h3>
                <p className="text-gray-700 mb-4">
                  {t('home.mentalHealth.breathing.description', 'Técnica de respiração para relaxamento profundo e redução da ansiedade')}
                </p>
                
                {/* Breathing Circle Animation */}
                <div className="flex justify-center mb-6">
                  <div 
                    className={`w-32 h-32 rounded-full bg-gradient-to-r ${getBreathingColor()} transition-all duration-1000 ease-in-out flex items-center justify-center shadow-2xl ${getBreathingScale()}`}
                  >
                    <div className="text-white font-bold text-lg text-center">
                      {breathingActive ? (
                        <div>
                          <div className="text-3xl font-mono">{breathingTimeLeft}</div>
                          <div className="text-xs font-semibold">
                            {breathingPhase === 'inhale' ? 'INSPIRE' : 
                             breathingPhase === 'hold' ? 'SEGURE' : 'EXPIRE'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-xl">4-7-8</div>
                          <div className="text-xs">RESPIRAR</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-gray-600 text-sm font-medium">
                    {breathingActive ? (
                      <span className="text-emerald-700 text-lg">
                        {breathingPhase === 'inhale' ? '🌬️ Inspire pelo nariz profundamente...' :
                         breathingPhase === 'hold' ? '⏸️ Pare de respirar e segure...' : 
                         '💨 Expire pela boca completamente...'}
                      </span>
                    ) : (
                      <span className="text-gray-700">
                        <strong>Sequência Correta:</strong><br/>
                        1️⃣ Inspire 4s → 2️⃣ Segure 7s → 3️⃣ Expire 8s (4 ciclos)
                      </span>
                    )}
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={startBreathing}
                  className={`bg-gradient-to-r ${getBreathingColor()} hover:opacity-90 text-white px-8 py-3 text-lg font-semibold transition-all`}
                >
                  {getBreathingInstruction()}
                </Button>
                
                {breathingActive && (
                  <div className="mt-4 text-emerald-700 font-medium">
                    Ciclo {breathingCycle + 1} de 4
                  </div>
                )}
              </div>
            </div>

            {/* Técnicas de Saúde Mental - Sempre disponíveis */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-green-800 mb-4 text-center">
                {t('home.mentalHealth.techniques.title', 'Técnicas Rápidas para Bem-Estar')}
              </h3>
              <p className="text-center text-gray-600 mb-6 text-sm">
                {t('home.mentalHealth.techniques.subtitle', 'Pressione os pontos por 1 minuto cada - Disponível para todos')}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {mentalHealthTechniques.free.map((technique) => (
                  <MentalHealthTechniqueCard key={technique.id} technique={technique} />
                ))}
              </div>
            </div>

            {/* Técnicas Premium - Apenas para usuários logados */}
            {user && (
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Badge variant="secondary" className="bg-emerald-200 text-emerald-900 px-4 py-2 text-lg font-semibold">
                    ✨ {t('home.mentalHealth.premium.badge', 'Técnicas Exclusivas para Usuários')}
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {mentalHealthTechniques.premium.map((technique) => (
                    <MentalHealthTechniqueCard key={technique.id} technique={technique} />
                  ))}
                </div>
              </div>
            )}

            {/* Benefícios - Seção existente */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg border-2 border-emerald-200">
                <div className="text-4xl mb-4">😌</div>
                <h3 className="font-bold text-emerald-800 mb-3 text-lg">
                  {t('home.mentalHealth.benefits.stress.title', 'Redução do Estresse')}
                </h3>
                <p className="text-gray-700 font-medium">
                  {t('home.mentalHealth.benefits.stress.description', 'Técnicas específicas para diminuir tensões e promover relaxamento profundo')}
                </p>
              </div>
              <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg border-2 border-emerald-200">
                <div className="text-4xl mb-4">😴</div>
                <h3 className="font-bold text-emerald-800 mb-3 text-lg">
                  {t('home.mentalHealth.benefits.sleep.title', 'Melhoria do Sono')}
                </h3>
                <p className="text-gray-700 font-medium">
                  {t('home.mentalHealth.benefits.sleep.description', 'Pontos de acupressão que favorecem um sono reparador e de qualidade')}
                </p>
              </div>
              <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg border-2 border-emerald-200">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="font-bold text-emerald-800 mb-3 text-lg">
                  {t('home.mentalHealth.benefits.balance.title', 'Equilíbrio Emocional')}
                </h3>
                <p className="text-gray-700 font-medium">
                  {t('home.mentalHealth.benefits.balance.description', 'Harmonização energética para maior estabilidade emocional e mental')}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-10 py-4 text-lg font-bold shadow-xl">
                <Link to="/category/craniopuntura">
                  {t('home.mentalHealth.exploreButton', 'Explorar Técnicas para Bem Estar Mental')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Categories */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {mockData.categories.map((category) => (
          <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 overflow-hidden">
            <div className={`h-2 ${category.color}`}></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="text-4xl mb-2">{category.icon}</div>
                <Badge variant="secondary" className="text-xs">
                  {category.id === 1 ? mockData.techniques.craniopuntura.length : mockData.techniques.mtc.length} {t('home.techniques', 'técnicas')}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {category.id === 1 ? t('home.categories.craniopuncture.name', 'Craniopuntura') : t('home.categories.tcm.name', 'MTC (Medicina Tradicional Chinesa)')}
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                {category.id === 1 ? t('home.categories.craniopuncture.description', 'Técnicas de estimulação de pontos no couro cabeludo para alívio de dores e melhoria da saúde geral') : t('home.categories.tcm.description', 'Pontos de acupressão baseados na medicina tradicional chinesa para equilibrio energético')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link to={`/category/${category.id === 1 ? 'craniopuntura' : 'mtc'}`}>
                  {t('home.exploreButton', 'Explorar Técnicas')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Common Complaints Stats */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>{t('home.stats.title', 'Queixas Mais Comuns')}</span>
          </CardTitle>
          <CardDescription>
            {t('home.stats.subtitle', 'Baseado no uso da comunidade - veja o que outras pessoas estão tratando')}
          </CardDescription>
          
          {/* Disclaimer para dados simulados */}
          {communityData?.disclaimer && (
            <Alert className="mt-2 border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800 text-xs">
                ℹ️ {communityData.disclaimer}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          {communityLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Carregando dados da comunidade...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(communityData?.commonComplaints || mockData.commonComplaints).slice(0, 8).map((complaint) => (
                <div key={complaint.id} className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-sm font-medium text-gray-700">{complaint.complaint}</span>
                    {complaint.trending && (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    <span>{complaint.count} pessoas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">💡 {t('techniques.quickActions.beginner.title', 'Começando')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              {t('techniques.quickActions.beginner.description', 'Novo na acupressão? Comece com técnicas básicas e seguras.')}
            </p>
            <Button variant="outline" asChild size="sm">
              <Link to="/category/craniopuntura">{t('techniques.quickActions.beginner.button', 'Técnicas Básicas')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">⚡ {t('techniques.quickActions.quick.title', 'Alívio Rápido')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              {t('techniques.quickActions.quick.description', 'Precisa de alívio imediato? Técnicas de 1 minuto para emergências.')}
            </p>
            <Button 
              variant="outline" 
              asChild 
              size="sm"
              className="w-full max-w-full text-xs sm:text-sm px-2 py-1 h-auto leading-tight"
            >
              <Link to="/technique/1" className="text-center break-words">
                {t('techniques.quickActions.quick.button', 'Yintang Ex2 - Dor de Cabeça')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">🎯 {t('techniques.quickActions.personalized.title', 'Personalizado')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              {t('techniques.quickActions.personalized.description', 'Acesse suas técnicas favoritas e histórico de tratamentos.')}
            </p>
            <Button variant="outline" asChild size="sm">
              <Link to="/favorites">{t('techniques.quickActions.personalized.button', 'Meus Favoritos')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-700">🩺 {t('techniques.quickActions.complex.title', 'Caso Complexo?')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-600 mb-4">
              {t('techniques.quickActions.complex.description', 'Dores crônicas ou condições que não melhoram? Fale com especialista.')}
            </p>
            <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
              <Link to="/consultation">{t('techniques.quickActions.complex.button', 'Consulta Especializada')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Premium Banners - ATM e Septicemia */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <Badge className="bg-yellow-600 text-white">Premium</Badge>
            </div>
            <CardTitle className="text-lg text-yellow-700">🦷 {t('home.mentalHealth.banners.atm.title', 'Atendimento de Dor na ATM')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-600 mb-4">
              {t('home.mentalHealth.banners.atm.description', 'Protocolo especializado para disfunção temporomandibular')}
            </p>
            <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700">
              <Link to="/payment">Acessar Premium</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <Badge className="bg-red-600 text-white">Premium</Badge>
            </div>
            <CardTitle className="text-lg text-red-700">🛡️ {t('home.mentalHealth.banners.septicemia.title', 'Atendimento de Septicemia')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              {t('home.mentalHealth.banners.septicemia.description', 'Técnicas complementares para suporte ao sistema imunológico')}
            </p>
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
              <Link to="/payment">Acessar Premium</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;