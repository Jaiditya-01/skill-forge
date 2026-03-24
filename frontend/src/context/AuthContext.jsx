import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            setStats(res.data.data.stats);
            setProfile(res.data.data.profile);
          }
        } catch (error) {
          console.error('Failed to load user', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.data.access_token);
      setUser(res.data.data.user);
      // Fetch fresh stats after login
      const meRes = await api.get('/auth/me');
      setStats(meRes.data.data.stats);
      setProfile(meRes.data.data.profile);
      return true;
    }
    return false;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('token', res.data.data.access_token);
      setUser(res.data.data.user);
      // Fetch fresh stats after register
      const meRes = await api.get('/auth/me');
      setStats(meRes.data.data.stats);
      setProfile(meRes.data.data.profile);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setStats(null);
    setProfile(null);
  };

  const refreshUser = async () => {
    try {
      const meRes = await api.get('/auth/me');
      setUser(meRes.data.data.user);
      setStats(meRes.data.data.stats);
      setProfile(meRes.data.data.profile);
    } catch (error) {
      console.error('Failed to refresh user', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, stats, profile, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
