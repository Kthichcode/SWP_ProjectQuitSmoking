import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          setUser(parsedUser);
          setToken(storedToken);
        }
      }
    } catch (error) {
      console.error('Lỗi khi parse localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const login = (data) => {
    const token = data.token || data;

    try {
      const decoded = jwtDecode(token); 

      const userObj = {
        ...decoded,
        name: decoded.full_name || decoded.sub || 'No name',
      };

      setUser(userObj);
      setToken(token);

      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Lỗi khi decode token:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
