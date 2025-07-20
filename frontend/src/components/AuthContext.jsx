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
    console.log('🚀 FINAL FIX - REGISTRO');
    console.log('Dados:', userData);
    
    try {
      // FORÇA BACKEND SEMPRE - sem fallback
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('🌐 FORÇANDO BACKEND SEMPRE:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email.trim().toLowerCase(), // Sanitize email
          password: userData.password
        }),
        timeout: 30000 // 30 seconds timeout
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ BACKEND SUCESSO:', data);
        
        // Use REAL JWT token
        setUser(data.user);
        setToken(data.access_token);
        
        localStorage.setItem('zenpress_user', JSON.stringify(data.user));
        localStorage.setItem('zenpress_token', data.access_token);
        
        return { success: true, user: data.user, realToken: true };
      } else {
        const errorText = await response.text();
        console.log('❌ BACKEND ERROR:', response.status, errorText);
        
        // Se email já existe, tenta login
        if (response.status === 400 && errorText.includes('already registered')) {
          console.log('🔄 Email já existe, tentando login');
          return await login({ email: userData.email, password: userData.password });
        }
        
        return { success: false, error: `Erro do servidor: ${response.status}` };
      }
      
    } catch (error) {
      console.error('❌ ERRO TOTAL:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return { success: false, error: 'Erro de conexão. Verifique sua internet e tente novamente.' };
      }
      
      return { success: false, error: 'Erro inesperado. Tente novamente.' };
    }
  };

  const login = async (credentials) => {
    console.log('🚀 MOBILE LOGIN - INÍCIO');
    console.log('Email:', credentials.email);
    
    try {
      // TRY BACKEND LOGIN FIRST - para ter token JWT válido
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (backendUrl) {
        try {
          console.log('🌐 MOBILE - Tentando login no backend');
          const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ MOBILE - Login backend sucesso:', data);
            
            // Use REAL JWT token from backend
            setUser(data.user);
            setToken(data.access_token);
            
            try {
              localStorage.setItem('zenpress_user', JSON.stringify(data.user));
              localStorage.setItem('zenpress_token', data.access_token);
            } catch (e) {
              console.warn('⚠️ localStorage save failed');
            }
            
            return { success: true, user: data.user, realToken: true };
          } else {
            console.log('⚠️ MOBILE - Backend login falhou:', response.status);
          }
        } catch (backendError) {
          console.warn('⚠️ MOBILE - Backend login error:', backendError.message);
        }
      }
      
      // FALLBACK LOCAL - Check localStorage
      try {
        const savedUserStr = localStorage.getItem('zenpress_user');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser.email === credentials.email) {
            const loginToken = savedUser.localOnly ? `mobile_login_${Date.now()}` : localStorage.getItem('zenpress_token');
            
            setUser(savedUser);
            setToken(loginToken);
            
            console.log('✅ MOBILE - Login local sucesso:', savedUser);
            return { 
              success: true, 
              user: savedUser, 
              localOnly: savedUser.localOnly,
              warning: savedUser.localOnly ? 'Login local - pagamentos podem não funcionar' : null
            };
          }
        }
      } catch (e) {
        console.warn('⚠️ MOBILE - localStorage read failed:', e);
      }
      
      // No existing user - try to register
      console.log('🆕 MOBILE - Nenhum usuário encontrado, registrando');
      return await register({
        name: credentials.email.split('@')[0],
        email: credentials.email,
        password: credentials.password
      });
      
    } catch (error) {
      console.error('❌ MOBILE LOGIN - ERRO TOTAL:', error);
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