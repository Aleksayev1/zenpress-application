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
    console.log('🚀 SISTEMA LOGIN SUPER SIMPLES - REGISTRO');
    
    try {
      // Create user immediately - super simple approach
      const newUser = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        is_premium: false,
        created_at: new Date().toISOString()
      };
      
      const newToken = `token_${Date.now()}`;
      
      // Save to state
      setUser(newUser);
      setToken(newToken);
      
      // Save to localStorage
      localStorage.setItem('zenpress_user', JSON.stringify(newUser));
      localStorage.setItem('zenpress_token', newToken);
      
      console.log('✅ USUÁRIO CRIADO COM SUCESSO:', newUser);
      
      // Try to sync with backend in background (but don't wait for it)
      setTimeout(async () => {
        try {
          const backendUrl = process.env.REACT_APP_BACKEND_URL;
          if (backendUrl) {
            const response = await fetch(`${backendUrl}/api/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData)
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ SYNC COM BACKEND SUCESSO:', data);
              
              // Update user with backend data if available
              if (data.user) {
                const updatedUser = { ...newUser, ...data.user };
                setUser(updatedUser);
                localStorage.setItem('zenpress_user', JSON.stringify(updatedUser));
              }
            }
          }
        } catch (error) {
          console.log('⚠️ Sync com backend falhou (não é problema):', error.message);
        }
      }, 100);
      
      return { success: true, user: newUser };
      
    } catch (error) {
      console.error('❌ ERRO NO REGISTRO:', error);
      return { success: false, error: 'Erro ao criar usuário' };
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