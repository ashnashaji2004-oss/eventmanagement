import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('schoolfest_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('schoolfest_access_token');
    if (token) {
      api.get('/auth/me/')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('schoolfest_user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('schoolfest_access_token');
          localStorage.removeItem('schoolfest_refresh_token');
          localStorage.removeItem('schoolfest_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    const { access, refresh, user: userData, teacher_profile, parent_profile } = res.data;
    localStorage.setItem('schoolfest_access_token', access);
    localStorage.setItem('schoolfest_refresh_token', refresh);
    
    const fullUser = {
      ...userData,
      teacher_profile,
      parent_profile
    };
    localStorage.setItem('schoolfest_user', JSON.stringify(fullUser));
    setUser(fullUser);
    return fullUser;
  };

  const logout = () => {
    localStorage.removeItem('schoolfest_access_token');
    localStorage.removeItem('schoolfest_refresh_token');
    localStorage.removeItem('schoolfest_user');
    setUser(null);
  };

  const value = {
    user,
    role: user?.role,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'ADMIN' || user?.is_superuser,
    isTeacher: user?.role === 'TEACHER',
    isParent: user?.role === 'PARENT',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
