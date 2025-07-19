import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Clock, 
  Heart, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowLeft, 
  AlertTriangle,
  Star,
  CheckCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { ReviewModal, TechniqueReviews } from './ReviewsAnalytics';

const TechniqueDetail = () => {
  const { techniqueId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Technique state
  const [technique, setTechnique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Breathing states
  const [breathingCycle, setBreathingCycle] = useState(0); // 0: inhale, 1: hold, 2: exhale, 3: pause
  const [breathingTimer, setBreathingTimer] = useState(4); // countdown for current breathing phase
  const [currentBreathingPhase, setCurrentBreathingPhase] = useState('prepare'); // prepare, 4-7-8, diaphragmatic
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Audio context for breathing sounds
  const audioContext = useRef(null);
  const oscillator = useRef(null);
  
  // UI states
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Load technique from API
  useEffect(() => {
    const loadTechnique = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading technique ID:', techniqueId);
        
        const data = await apiService.getTechniqueById(techniqueId);
        console.log('Technique loaded:', data);
        
        // Apply translations based on technique
        const techniqueKey = getTechniqueKey(data.name);
        console.log('Using translation key:', techniqueKey);
        
        const translatedTechnique = {
          ...data,
          name: t(`techniques.${techniqueKey}.name`, data.name),
          condition: t(`techniques.${techniqueKey}.condition`, data.condition),
          description: t(`techniques.${techniqueKey}.description`, data.description),
          instructions: data.instructions.map((instruction, index) => 
            t(`techniques.${techniqueKey}.instructions.${index}`, instruction)
          ),
          warnings: data.warnings?.map((warning, index) => 
            t(`techniques.${techniqueKey}.warnings.${index}`, warning)
          ) || []
        };
        
        console.log('Final translated technique:', translatedTechnique);
        setTechnique(translatedTechnique);
        setTimeLeft(data.duration || 60);
      } finally {
        setLoading(false);
      }
    };

    loadTechnique();
  }, [techniqueId, t]);

  // Helper function to get technique translation key
  const getTechniqueKey = (name) => {
    if (name.includes('Yintang')) return 'yintang';
    if (name.includes('Fengchi')) return 'fengchi';
    if (name.includes('Yinbai')) return 'yinbai';
    if (name.includes('Hegu')) return 'hegu';
    if (name.includes('Zusanli')) return 'zusanli';
    if (name.includes('Shenmen')) return 'shenmen';
    return 'yintang'; // default
  };

  useEffect(() => {
    if (technique) {
      // Check if technique is in favorites (this would come from API in real app)
      setIsFavorite(false); // For now, default to false
    }
  }, [technique]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Breathing cycle logic - CORRECTED 4-7-8 order
  useEffect(() => {
    let breathingInterval;
    if (isRunning && !isCompleted && technique) {
      // Correct order: 4s inspire → 7s hold → 8s exhale
      
      // Initialize on start
      if (timeLeft === technique.duration) {
        setCurrentBreathingPhase('inspire');
        setBreathingTimer(4);
        setBreathingCycle(0);
      }
      
      breathingInterval = setInterval(() => {
        setBreathingTimer(prev => {
          if (prev <= 1) {
            // Switch to next phase
            if (currentBreathingPhase === 'inspire') {
              setCurrentBreathingPhase('hold');
              setBreathingTimer(7);
            } else if (currentBreathingPhase === 'hold') {
              setCurrentBreathingPhase('exhale');
              setBreathingTimer(8);
            } else if (currentBreathingPhase === 'exhale') {
              setCurrentBreathingPhase('inspire');
              setBreathingTimer(4);
            }
            return prev;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(breathingInterval);
      setCurrentBreathingPhase('prepare');
    }
    return () => clearInterval(breathingInterval);
  }, [isRunning, isCompleted, technique?.duration, currentBreathingPhase]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(technique?.duration || 60);
    setIsCompleted(false);
    setCurrentStep(0);
    setCurrentBreathingPhase('prepare');
    setBreathingCycle(0);
    setBreathingTimer(4);
  };

  // Get breathing instruction text
  const getBreathingInstruction = () => {
    if (!isRunning) return {
      text: 'Pressione Iniciar para começar com a respiração guiada',
      color: 'text-gray-600',
      instruction: 'Técnica 4-7-8: Inspire 4s → Segure 7s → Expire 8s'
    };
    
    if (currentBreathingPhase === 'inspire') {
      return {
        text: `Inspire pelo nariz por ${breathingTimer}s`,
        color: 'text-blue-600',
        instruction: 'Respire lentamente pelo nariz por 4 segundos'
      };
    } else if (currentBreathingPhase === 'hold') {
      return {
        text: `Segure a respiração por ${breathingTimer}s`,
        color: 'text-yellow-600',
        instruction: 'Prenda a respiração por 7 segundos'
      };
    } else if (currentBreathingPhase === 'exhale') {
      return {
        text: `Expire pela boca por ${breathingTimer}s`,
        color: 'text-green-600',
        instruction: 'Expire completamente pela boca por 8 segundos'
      };
    }
    
    return {
      text: 'Preparando...',
      color: 'text-gray-600',
      instruction: 'Prepare-se para iniciar a técnica de respiração 4-7-8'
    };
  };

  const toggleFavorite = async () => {
    if (!technique) return;
    
    try {
      if (isFavorite) {
        await apiService.removeFromFavorites(technique.id);
      } else {
        await apiService.addToFavorites(technique.id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Erro ao alterar favorito:', err);
      // Fallback para mock
      const { addToMockFavorites, removeFromMockFavorites } = await import('../mock');
      if (isFavorite) {
        removeFromMockFavorites(technique.id);
      } else {
        addToMockFavorites(technique.id);
      }
      setIsFavorite(!isFavorite);
    }
  };

  // Audio functions for breathing guidance
  const initAudio = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playBreathingTone = (frequency, duration) => {
    if (!soundEnabled || !audioContext.current) return;

    try {
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);
      
      oscillator.start(audioContext.current.currentTime);
      oscillator.stop(audioContext.current.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Play different tones for each breathing phase
  useEffect(() => {
    if (isRunning && currentBreathingPhase === '4-7-8') {
      const frequencies = [220, 330, 440]; // Different tones for each phase (inspirar, prender, expirar)
      if (breathingTimer === (breathingCycle === 0 ? 4 : breathingCycle === 1 ? 7 : 8)) {
        playBreathingTone(frequencies[breathingCycle], 0.3);
      }
    } else if (isRunning && currentBreathingPhase === 'diaphragmatic') {
      // Som sutil para respiração abdominal no início de cada fase (4 segundos)
      if (breathingTimer === 4) { // Som no início de cada fase
        const isInhaling = breathingCycle === 0;
        playBreathingTone(isInhaling ? 220 : 440, 0.2);
      }
    }
  }, [breathingCycle, breathingTimer, isRunning, currentBreathingPhase, soundEnabled]);

  // Get visual effect class for image
  const getImageEffectClass = () => {
    if (!isRunning) return '';
    
    const baseClass = 'transition-all duration-1000 ease-in-out';
    
    if (currentBreathingPhase === '4-7-8') {
      switch (breathingCycle) {
        case 0: return `${baseClass} filter brightness-110 drop-shadow-lg animate-pulse-blue`; // Inspire
        case 1: return `${baseClass} filter brightness-125 drop-shadow-xl animate-pulse-yellow`; // Hold
        case 2: return `${baseClass} filter brightness-105 drop-shadow-md animate-pulse-green`; // Expire
        default: return baseClass;
      }
    } else if (currentBreathingPhase === 'diaphragmatic') {
      const isInhaling = breathingCycle === 0;
      return `${baseClass} filter brightness-110 ${isInhaling ? 'animate-pulse-blue' : 'animate-pulse-green'}`;
    }
    
    return baseClass;
  };

  // Get breathing overlay effect
  const getBreathingOverlayClass = () => {
    if (!isRunning) return '';
    
    if (currentBreathingPhase === '4-7-8') {
      switch (breathingCycle) {
        case 0: return 'bg-blue-400/20 animate-pulse'; // Inspire
        case 1: return 'bg-yellow-400/25'; // Hold
        case 2: return 'bg-green-400/20 animate-pulse'; // Expire
        default: return '';
      }
    } else if (currentBreathingPhase === 'diaphragmatic') {
      const isInhaling = breathingCycle === 0;
      return `${isInhaling ? 'bg-blue-400/15' : 'bg-green-400/15'} animate-pulse`;
    }
    
    return '';
  };

  const completeSession = async (rating = null) => {
    if (!technique) return;
    
    try {
      await apiService.createSession({
        technique_id: technique.id,
        complaint: technique.condition,
        duration: technique.duration,
        rating: rating || 4
      });
    } catch (err) {
      console.error('Erro ao salvar sessão:', err);
      // Fallback para mock
      const { addToMockHistory } = await import('../mock');
      addToMockHistory({
        techniqueId: technique.id,
        techniqueName: technique.name,
        duration: technique.duration,
        complaint: technique.condition,
        rating: rating || 4
      });
    }
    
    setIsCompleted(true);
    
    // Mostrar modal de avaliação após 2 segundos se não foi avaliado ainda
    if (!rating) {
      setTimeout(() => {
        setShowReviewModal(true);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Carregando técnica...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
      </div>
    );
  }

  if (!technique) {
    return (
      <div className="text-center py-8">
        <p>Técnica não encontrada</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Voltar ao Início
        </Button>
      </div>
    );
  }

  const progressPercentage = technique ? ((technique.duration - timeLeft) / technique.duration) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>
        
        <Button variant="ghost" onClick={toggleFavorite} className="flex items-center space-x-2">
          <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
          <span>{isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</span>
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Technique Info */}
        <div>
          <Card className="mb-6">
            <div className="relative">
              <img 
                src={technique.image} 
                alt={technique.name}
                className={`w-full h-64 object-cover rounded-t-lg ${getImageEffectClass()}`}
              />
              <Badge className="absolute top-4 right-4 bg-black/70 text-white border-0">
                {technique.pressure}
              </Badge>
              
              {/* Sound Toggle Button */}
              <Button
                variant={soundEnabled ? "default" : "outline"}
                size="sm"
                className="absolute top-4 left-4"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) initAudio();
                }}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </Button>
              
              {/* Breathing Effect Overlay */}
              {isRunning && (
                <div className={`absolute inset-0 rounded-t-lg pointer-events-none ${getBreathingOverlayClass()}`}>
                </div>
              )}
            </div>
            
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {technique.name}
              </CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mr-2">
                  {technique.condition}
                </Badge>
                <Badge variant="secondary">
                  {technique.category === 'craniopuntura' ? 'Craniopuntura' : 'MTC'}
                </Badge>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">{technique.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{technique.duration}s de pressão</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {technique.warnings.length > 0 && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Avisos importantes:</strong>
                <ul className="mt-2 space-y-1">
                  {technique.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span>•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Right Column - Instructions & Timer */}
        <div>
          {/* Timer Section */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Timer de Aplicação</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <Progress value={progressPercentage} className="mb-4" />
              </div>
              
              <div className="flex justify-center space-x-2 mb-4">
                <Button 
                  onClick={toggleTimer} 
                  size="lg"
                  disabled={isCompleted}
                  className="flex items-center space-x-2"
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isRunning ? 'Pausar' : 'Iniciar'}</span>
                </Button>
                
                <Button onClick={resetTimer} variant="outline" size="lg">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Breathing Instructions */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className={`text-xl font-bold mb-2 ${getBreathingInstruction().color}`}>
                    {getBreathingInstruction().text}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {getBreathingInstruction().instruction}
                  </div>
                  
                  {(currentBreathingPhase === 'inspire' || currentBreathingPhase === 'hold' || currentBreathingPhase === 'exhale') && (
                    <div className="text-xs text-blue-700 bg-blue-100 rounded-full px-3 py-1 inline-block">
                      Técnica 4-7-8: Inspire 4s → Segure 7s → Expire 8s
                    </div>
                  )}
                </div>
              </div>

              {isCompleted && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Sessão concluída!</strong> Como você se sente?
                    <div className="flex justify-center space-x-1 mt-2">
                      {[1,2,3,4,5].map(rating => (
                        <Button
                          key={rating}
                          variant="ghost"
                          size="sm"
                          onClick={() => completeSession(rating)}
                          className="p-1"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instruções Passo a Passo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technique?.instructions?.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${index <= currentStep ? 'text-gray-800' : 'text-gray-500'}`}>
                        {instruction}
                      </p>
                    </div>
                  </div>
                )) || []}
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Passo Anterior
                </Button>
                
                <Button 
                  size="sm"
                  onClick={() => setCurrentStep(Math.min((technique?.instructions?.length || 1) - 1, currentStep + 1))}
                  disabled={currentStep === (technique?.instructions?.length || 1) - 1}
                >
                  Próximo Passo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avaliações da Comunidade</CardTitle>
            </CardHeader>
            <CardContent>
              <TechniqueReviews techniqueId={techniqueId} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        techniqueId={techniqueId}
        techniqueName={technique?.name || ''}
        onReviewSubmitted={() => {
          setShowReviewModal(false);
          // Recarregar reviews se necessário
        }}
      />
    </div>
  );
};

export default TechniqueDetail;