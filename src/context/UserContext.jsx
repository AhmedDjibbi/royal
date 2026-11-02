import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api.js';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('rt:unauthorized', handleUnauthorized);
    Promise.resolve().then(() => {
      const token = sessionStorage.getItem('rt_token');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      return api.currentUser()
        .then(({ user: current }) => setUser(current))
        .catch(() => {
          sessionStorage.removeItem('rt_token');
          setUser(null);
        })
        .finally(() => setAuthLoading(false));
    });
      return () => window.removeEventListener('rt:unauthorized', handleUnauthorized);
  }, []);

  const acceptSession = ({ user: nextUser, token }) => {
    sessionStorage.setItem('rt_token', token);
    setUser(nextUser);
    return nextUser;
  };

  const login = async (credentials) => acceptSession(await api.login(credentials));
  const register = async (details) => acceptSession(await api.register(details));
  const logout = () => {
    sessionStorage.removeItem('rt_token');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, authLoading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
