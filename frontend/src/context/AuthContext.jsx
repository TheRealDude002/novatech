import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('novatech_token');
    const cached = localStorage.getItem('novatech_user');
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        /* ignore */
      }
    }
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setUser(data.user);
      localStorage.setItem('novatech_user', JSON.stringify(data.user));
    } catch {
      localStorage.removeItem('novatech_token');
      localStorage.removeItem('novatech_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('novatech_token', data.token);
    localStorage.setItem('novatech_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    localStorage.setItem('novatech_token', data.token);
    localStorage.setItem('novatech_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('novatech_token');
    localStorage.removeItem('novatech_user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    setUser(res.data.user);
    localStorage.setItem('novatech_user', JSON.stringify(res.data.user));
    return res.data;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    reload: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
