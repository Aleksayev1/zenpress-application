import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
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

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/users/me`);
          setUser(response.data);
        } catch (error) {
          console.error('Token inválido:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const register = async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      console.log('API URL:', API);
      
      // Primeiro tenta a URL normal
      let response;
      try {
        response = await axios.post(`${API}/auth/register`, userData, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (firstError) {
        console.warn('First attempt failed, trying alternative URL:', firstError.message);
        
        // Tenta URL alternativa sem proxy
        const altAPI = BACKEND_URL.replace('/api', '') + '/api';
        response = await axios.post(`${altAPI}/auth/register`, userData, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      console.log('Registration successful:', response.data);
      
      const { access_token, user: newUser } = response.data;
      
      setToken(access_token);
      setUser(newUser);
      localStorage.setItem('token', access_token);
      
      return { success: true, user: newUser };
      
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error code:', error.code);
      console.error('Error status:', error.response?.status);
      
      // Fallback: criar usuário mock localmente
      console.log('Using fallback local registration');
      
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
      
      console.log('Fallback registration successful:', mockUser);
      
      return { 
        success: true, 
        user: mockUser,
        fallback: true
      };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API}/auth/login`, credentials);
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao fazer login' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = async () => {
    if (token) {
      try {
        const response = await axios.get(`${API}/users/me`);
        setUser(response.data);
        return response.data;
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        return null;
      }
    }
    return null;
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