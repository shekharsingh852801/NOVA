import { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('nova_admin_token');
      if (token) {
        try {
          // Verify token by fetching user profile
          const res = await adminApi.getMe();
          if (res && res.user) {
            setUser(res.user);
            setIsAuthenticated(true);
          } else {
            throw new Error('Invalid user');
          }
        } catch (error) {
          console.error('Authentication failed on startup:', error);
          localStorage.removeItem('nova_admin_token');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    }
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await adminApi.login(email, password);
      if (res && res.token) {
        localStorage.setItem('nova_admin_token', res.token);
        setUser(res.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('nova_admin_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
