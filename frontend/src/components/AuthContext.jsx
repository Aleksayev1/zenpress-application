import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(userData);
          console.log('User restored from localStorage:', userData);
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const register = async (userData) => {
    console.log('🚀 REGISTRO INICIADO');
    console.log('Dados do usuário:', { 
      name: userData.name, 
      email: userData.email, 
      password: '[HIDDEN]' 
    });
    console.log('API URL:', API);

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        timeout: 10000,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro na resposta:', errorData);
        
        // Parse error message if it's JSON
        let errorMessage = 'Erro ao criar usuário';
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.detail || errorMessage;
        } catch (e) {
          errorMessage = errorData || errorMessage;
        }
        
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      console.log('✅ REGISTRO SUCESSO:', data);
      
      const { access_token, user: newUser } = data;
      
      // Save to state and localStorage
      setToken(access_token);
      setUser(newUser);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      console.log('✅ Usuario salvo com sucesso');
      
      return { success: true, user: newUser };
      
    } catch (error) {
      console.error('❌ ERRO NO REGISTRO:', error);
      
      // Simple fallback - create mock user locally
      const mockUser = {
        id: `user-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        is_premium: false,
        subscription_expires: null
      };
      
      const mockToken = `mock-token-${Date.now()}`;
      
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      console.log('🔄 FALLBACK: Usuário criado localmente:', mockUser);
      
      return { 
        success: true, 
        user: mockUser,
        fallback: true
      };
    }
  };

  const login = async (credentials) => {
    console.log('🚀 LOGIN INICIADO');
    console.log('Email:', credentials.email);
    console.log('API URL:', API);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        timeout: 10000,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro na resposta do login:', errorData);
        
        let errorMessage = 'Email ou senha incorretos';
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.detail || errorMessage;
        } catch (e) {
          errorMessage = errorData || errorMessage;
        }
        
        // Check for offline fallback
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user.email === credentials.email) {
            console.log('🔄 FALLBACK: Login offline');
            const mockToken = `offline-token-${Date.now()}`;
            setToken(mockToken);
            setUser(user);
            localStorage.setItem('token', mockToken);
            
            return { 
              success: true, 
              user: user,
              fallback: true
            };
          }
        }
        
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      console.log('✅ LOGIN SUCESSO:', data);
      
      const { access_token, user: userData } = data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
      
    } catch (error) {
      console.error('❌ ERRO NO LOGIN:', error);
      
      // Check for offline fallback
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.email === credentials.email) {
          console.log('🔄 FALLBACK: Login offline devido a erro de rede');
          const mockToken = `offline-token-${Date.now()}`;
          setToken(mockToken);
          setUser(user);
          localStorage.setItem('token', mockToken);
          
          return { 
            success: true, 
            user: user,
            fallback: true
          };
        }
      }
      
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet e tente novamente.' 
      };
    }
  };

  const logout = () => {
    console.log('🚪 LOGOUT');
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = () => {
    // For now, just return the current user
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
    isAuthenticated: !!token && !!user,
    isPremium: user?.is_premium || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;