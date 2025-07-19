import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Crown, 
  BookOpen, 
  Building, 
  BarChart3,
  ArrowLeft,
  Star,
  Users,
  Zap,
  Bitcoin
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import LoginModal from './LoginModal';
import CryptoPaymentForm from './CryptoPaymentForm';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  
  // Get status from URL params
  const sessionId = searchParams.get('session_id');
  const status = searchParams.get('status'); // success, cancel, error

  useEffect(() => {
    loadProducts();
    loadCourses();
    
    // Check payment status if returning from Stripe
    if (sessionId && isAuthenticated) {
      checkPaymentStatus(sessionId);
    }
  }, [sessionId, isAuthenticated]);

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API}/payments/v1/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await axios.get(`${API}/payments/v1/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 seconds

    if (attempts >= maxAttempts) {
      setPaymentStatus({
        status: 'error',
        message: 'Tempo limite para verificação do pagamento. Verifique seu email.'
      });
      return;
    }

    try {
      const response = await axios.get(`${API}/payments/v1/checkout/status/${sessionId}`);
      const data = response.data;
      
      if (data.payment_status === 'paid') {
        setPaymentStatus({
          status: 'success',
          message: 'Pagamento realizado com sucesso! Obrigado pela sua compra.'
        });
        return;
      } else if (data.status === 'expired') {
        setPaymentStatus({
          status: 'error',
          message: 'Sessão de pagamento expirada. Tente novamente.'
        });
        return;
      }

      // Continue polling if payment is still pending
      setTimeout(() => checkPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      setPaymentStatus({
        status: 'error',
        message: 'Erro ao verificar status do pagamento.'
      });
    }
  };

  const handlePurchase = async (productId, productType) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setProcessingPayment(true);

    try {
      // Configure axios with authorization header
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(`${API}/payments/v1/checkout/session`, {
        product_id: productId,
        product_type: productType,
        origin_url: window.location.origin,
        quantity: 1
      }, { headers });

      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Erro ao iniciar pagamento:', error);
      setPaymentStatus({
        status: 'error',
        message: 'Erro ao processar pagamento. Tente novamente.'
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCryptoPurchase = (productId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    // Mapear productId para subscription_type
    let subscriptionType;
    if (productId === 'premium_monthly') {
      subscriptionType = 'premium_monthly';
    } else if (productId === 'premium_annual') {
      subscriptionType = 'premium_yearly';
    }
    
    setSelectedSubscription(subscriptionType);
    setShowCryptoPayment(true);
  };

  const handleCryptoPaymentCreated = (paymentData) => {
    // Callback quando pagamento crypto é criado
    console.log('Pagamento crypto criado:', paymentData);
  };

  const closeCryptoPayment = () => {
    setShowCryptoPayment(false);
    setSelectedSubscription(null);
  };

  const getProductIcon = (type) => {
    switch (type) {
      case 'subscription': return <Crown className="h-6 w-6" />;
      case 'course': return <BookOpen className="h-6 w-6" />;
      case 'corporate': return <Building className="h-6 w-6" />;
      case 'analytics': return <BarChart3 className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Payment status display
  if (paymentStatus) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {paymentStatus.status === 'success' ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className={paymentStatus.status === 'success' ? 'text-green-700' : 'text-red-700'}>
              {paymentStatus.status === 'success' ? 'Pagamento Aprovado!' : 'Erro no Pagamento'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">{paymentStatus.message}</p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <a href="/">Voltar ao Início</a>
              </Button>
              {paymentStatus.status === 'success' && user?.is_premium && (
                <Button variant="outline" asChild className="w-full">
                  <a href="/category/craniopuntura">Explorar Conteúdo Premium</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Planos e Cursos</h1>
          <p className="text-gray-600">Escolha o melhor plano para suas necessidades</p>
        </div>
      </div>

      {status === 'cancel' && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertDescription className="text-yellow-800">
            Pagamento cancelado. Você pode tentar novamente quando quiser.
          </AlertDescription>
        </Alert>
      )}

      {/* Premium Subscriptions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Crown className="h-6 w-6 mr-2 text-yellow-500" />
          Assinaturas Premium
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {products.filter(p => p.type === 'subscription').map((product) => (
            <Card key={product.id} className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
              {product.id === 'premium_annual' && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500">Mais Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getProductIcon(product.type)}
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      /{product.billing_period === 'monthly' ? 'mês' : 'ano'}
                    </div>
                  </div>
                </div>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mb-3" 
                  size="lg"
                  onClick={() => handlePurchase(product.id, 'premium_subscription')}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Pagar com Cartão
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full" 
                  size="lg"
                  onClick={() => handleCryptoPurchase(product.id)}
                  disabled={processingPayment}
                >
                  <Bitcoin className="h-4 w-4 mr-2" />
                  Pagar com Crypto
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <BookOpen className="h-6 w-6 mr-2 text-blue-500" />
          Cursos Especializados
        </h2>
        
        {/* Development Notice */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>🚧 Em Desenvolvimento:</strong> Os cursos estão sendo desenvolvidos e estarão disponíveis em breve. 
            Para mais informações, entre em contato via email Aleksayev@zenpress.org
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-xl transition-all duration-300 opacity-75">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Em Breve
                  </Badge>
                </div>
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className="absolute top-3 left-3 bg-blue-600">
                  {course.level === 'beginner' ? 'Iniciante' : 
                   course.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duração:</span>
                    <span className="font-medium">{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Instrutor:</span>
                    <span className="font-medium">{course.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Módulos:</span>
                    <span className="font-medium">{course.modules.length}</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(course.price)}
                  </span>
                  <Button
                    onClick={() => handlePurchase(course.id, 'course')}
                    disabled={true}
                    variant="outline"
                  >
                    Em Desenvolvimento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Corporate Plans */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Building className="h-6 w-6 mr-2 text-purple-500" />
          Planos Corporativos
        </h2>
        
        {/* Development Notice */}
        <Alert className="mb-6 border-purple-200 bg-purple-50">
          <AlertDescription className="text-purple-800">
            <strong>🚧 Em Desenvolvimento:</strong> Os planos corporativos estão sendo desenvolvidos e estarão disponíveis em breve. 
            Para mais informações, entre em contato via email Aleksayev@zenpress.org
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-6">
          {products.filter(p => p.type === 'corporate').map((product) => (
            <Card key={product.id} className="hover:shadow-xl transition-all duration-300 opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Em Breve
                    </Badge>
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <CardDescription>{product.description}</CardDescription>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-purple-600">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    /mês - até {product.max_users} usuários
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handlePurchase(product.id, 'corporate')}
                  disabled={true}
                >
                  Em Desenvolvimento
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* B2B Analytics */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-indigo-500" />
          Analytics B2B
        </h2>
        
        {/* Development Notice */}
        <Alert className="mb-6 border-indigo-200 bg-indigo-50">
          <AlertDescription className="text-indigo-800">
            <strong>🚧 Em Desenvolvimento:</strong> Os planos de Analytics B2B estão sendo desenvolvidos e estarão disponíveis em breve. 
            Para mais informações, entre em contato via email Aleksayev@zenpress.org
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-6">
          {products.filter(p => p.type === 'analytics').map((product) => (
            <Card key={product.id} className="hover:shadow-xl transition-all duration-300 opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                      Em Breve
                    </Badge>
                    <BarChart3 className="h-6 w-6 text-indigo-500" />
                  </div>
                </div>
                <CardDescription>{product.description}</CardDescription>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-indigo-600">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-sm text-gray-500">/mês</div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handlePurchase(product.id, 'analytics')}
                  disabled={true}
                >
                  Em Desenvolvimento
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />

      {/* Crypto Payment Modal */}
      {showCryptoPayment && selectedSubscription && (
        <CryptoPaymentForm
          subscriptionType={selectedSubscription}
          onPaymentCreated={handleCryptoPaymentCreated}
          onClose={closeCryptoPayment}
        />
      )}
    </div>
  );
};

export default PaymentPage;