import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(loginData);
    
    if (result.success) {
      onSuccess?.(result.user);
      onClose();
      resetForms();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log('🚀 LOGIN MODAL - INICIADO - handleRegister executado!');
    
    setLoading(true);
    setError('');

    // TIMEOUT DE SEGURANÇA - força reset após 15 segundos
    const timeoutId = setTimeout(() => {
      console.log('⏰ TIMEOUT - Forçando reset do loading');
      setLoading(false);
      setError('Tempo limite atingido. Tente novamente.');
    }, 15000);

    try {
      // Simplified validation with logs
      console.log('📝 VALIDAÇÃO - Dados:', {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        confirmPassword: registerData.confirmPassword
      });

      if (!registerData.name) {
        console.log('❌ VALIDAÇÃO - Nome vazio');
        setError('Nome é obrigatório');
        return;
      }

      if (!registerData.email) {
        console.log('❌ VALIDAÇÃO - Email vazio');
        setError('Email é obrigatório');
        return;
      }

      if (!registerData.password) {
        console.log('❌ VALIDAÇÃO - Senha vazia');
        setError('Senha é obrigatória');
        return;
      }

      if (registerData.password !== registerData.confirmPassword) {
        console.log('❌ VALIDAÇÃO - Senhas não coincidem');
        setError('As senhas não coincidem');
        return;
      }

      console.log('✅ VALIDAÇÃO - Passou em todas as validações');

      console.log('🚀 LOGIN MODAL - Iniciando registro');
      console.log('📝 LOGIN MODAL - Dados:', { name: registerData.name, email: registerData.email });
      
      const result = await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password
      });
      
      console.log('✅ LOGIN MODAL - Resultado:', result);
      
      // Limpar timeout se chegou até aqui
      clearTimeout(timeoutId);
      
      if (result.success) {
        console.log('✅ LOGIN MODAL - Registro bem-sucedido');
        
        // FORÇA FECHAMENTO DO MODAL
        setTimeout(() => {
          onClose();
          resetForms();
        }, 500);
        
        if (result.fallback) {
          alert('Conta criada com sucesso! (Modo offline - suas preferências serão salvas localmente)');
        } else if (result.localOnly) {
          alert('Conta criada localmente! Para pagamentos, certifique-se de ter conexão estável.');
        } else {
          alert('Conta criada com sucesso!');
        }
        
        onSuccess?.(result.user);
      } else {
        console.log('❌ LOGIN MODAL - Falha no registro:', result.error);
        setError(result.error || 'Erro ao registrar usuário');
      }
    } catch (error) {
      console.log('❌ LOGIN MODAL - Erro catch:', error);
      clearTimeout(timeoutId);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      console.log('🏁 LOGIN MODAL - Finalizando, resetando loading');
      setLoading(false);
    }
    } catch (err) {
      setError('Erro inesperado ao registrar usuário');
      console.error('Register error:', err);
    }
    
    setLoading(false);
  };

  const resetForms = () => {
    setLoginData({ email: '', password: '' });
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setActiveTab('login');
    setLoading(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  // Handle quando clica no overlay ou pressiona ESC
  const handleOpenChange = (open) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto" onPointerDownOutside={handleClose}>
        <DialogHeader>
          <DialogTitle>Acesse sua conta</DialogTitle>
          <DialogDescription>
            Entre com sua conta ou crie uma nova para acessar recursos premium
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Criar Conta</TabsTrigger>
          </TabsList>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nome completo</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={registerData.name}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Senha</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">Confirmar senha</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Conta
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;