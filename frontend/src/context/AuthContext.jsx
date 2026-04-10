import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          // Token expired — force logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    
    // Save to local storage & state
    localStorage.setItem('token', data.token);
    const userData = { _id: data._id, name: data.name, email: data.email };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    
    localStorage.setItem('token', data.token);
    const userData = { _id: data._id, name: data.name, email: data.email };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const loginWithGoogle = async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    
    localStorage.setItem('token', data.token);
    const userData = { _id: data._id, name: data.name, email: data.email, avatar: data.avatar };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin: loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
