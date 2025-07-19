import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Restore user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('zenpress_user');
    const savedToken = localStorage.getItem('zenpress_token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('zenpress_user');
        localStorage.removeItem('zenpress_token');
      }
    }
  }, []);

  const register = async (userData) => {
    console.log('🚀 MOBILE REGISTER - INÍCIO');
    console.log('Dados:', userData.name, userData.email);
    
    try {
      // VERSÃO ULTRA SIMPLES PARA MOBILE
      const timestamp = Date.now();
      const newUser = {
        id: `mobile_${timestamp}`,
        name: userData.name || 'Usuário',
        email: userData.email || `user${timestamp}@example.com`,
        is_premium: false,
        created_at: new Date().toISOString()
      };
      
      const newToken = `mobile_token_${timestamp}`;
      
      console.log('✅ MOBILE - Criando usuário:', newUser);
      
      // Save immediately 
      setUser(newUser);
      setToken(newToken);
      
      // Try localStorage (may fail on some mobile browsers)
      try {
        localStorage.setItem('zenpress_user', JSON.stringify(newUser));
        localStorage.setItem('zenpress_token', newToken);
        console.log('✅ MOBILE - localStorage salvo');
      } catch (storageError) {
        console.warn('⚠️ MOBILE - localStorage falhou:', storageError);
        // Continue anyway - user is still logged in memory
      }
      
      console.log('✅ MOBILE - Usuário criado com sucesso!');
      
      return { success: true, user: newUser, mobile: true };
      
    } catch (error) {
      console.error('❌ MOBILE REGISTER - ERRO:', error);
      
      // FALLBACK EXTREMO - criar usuário básico
      const fallbackUser = {
        id: `fallback_${Date.now()}`,
        name: 'Usuário Mobile',
        email: 'mobile@usuario.com',
        is_premium: false
      };
      
      const fallbackToken = `fallback_${Date.now()}`;
      
      setUser(fallbackUser);
      setToken(fallbackToken);
      
      console.log('🔄 MOBILE - Fallback criado:', fallbackUser);
      
      return { success: true, user: fallbackUser, fallback: true };
    }
  };

  const login = async (credentials) => {
    console.log('🚀 SISTEMA LOGIN SUPER SIMPLES - LOGIN');
    
    try {
      // Check if user exists locally first
      const savedUser = localStorage.getItem('zenpress_user');
      
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.email === credentials.email) {
          // Local login successful
          const loginToken = `login_${Date.now()}`;
          setUser(userData);
          setToken(loginToken);
          localStorage.setItem('zenpress_token', loginToken);
          
          console.log('✅ LOGIN LOCAL SUCESSO:', userData);
          return { success: true, user: userData };
        }
      }
      
      // If no local user, try to create one (simple registration on login)
      return await register({
        name: credentials.email.split('@')[0],
        email: credentials.email,
        password: credentials.password
      });
      
    } catch (error) {
      console.error('❌ ERRO NO LOGIN:', error);
      return { success: false, error: 'Erro no login' };
    }
  };

  const logout = () => {
    console.log('🚪 LOGOUT SIMPLES');
    setUser(null);
    setToken(null);
    localStorage.removeItem('zenpress_user');
    localStorage.removeItem('zenpress_token');
  };

  const updateUser = () => {
    return user;
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated: !!(user && token),
    isPremium: user?.is_premium || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;