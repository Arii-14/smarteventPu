import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

// Key localStorage untuk override profil Super Admin
const SA_PROFILE_KEY = 'smartevent_sa_profile';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('smartevent_token');
      if (token) {
        try {
          const { data } = await api.get('/users/me');

          // Jika Super Admin, merge override dari localStorage (username & photo)
          if (data.role === 'super_admin') {
            const saved = localStorage.getItem(SA_PROFILE_KEY);
            if (saved) {
              const override = JSON.parse(saved);
              setUser({ ...data, ...override });
            } else {
              setUser(data);
            }
          } else {
            setUser(data);
          }
        } catch (error) {
          console.error('Failed to fetch user', error);
          localStorage.removeItem('smartevent_token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('smartevent_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('smartevent_token');
    setUser(null);
  };

  const updateUser = (data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      // Persist Super Admin overrides ke localStorage
      if (updated.role === 'super_admin') {
        const { username, photo, avatar } = updated;
        const override = {};
        if (username) override.username = username;
        if (photo) override.photo = photo;
        if (avatar) override.avatar = avatar;
        localStorage.setItem(SA_PROFILE_KEY, JSON.stringify(override));
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        isSuperAdmin: user?.role === 'super_admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
