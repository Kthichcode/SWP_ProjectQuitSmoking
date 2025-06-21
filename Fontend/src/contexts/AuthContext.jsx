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

      if (!storedUser || !storedToken) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (parsedUser) {
        setUser({ ...parsedUser, token: storedToken }); // ✅ Đảm bảo token trong user
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Lỗi khi parse localStorage:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const login = (data) => {
    const receivedToken = data.token || data;

    try {
      const decoded = jwtDecode(receivedToken);
      const userObj = {
        ...decoded,
        name: decoded.full_name || decoded.sub || 'No name',
        token: receivedToken, // ✅ Đảm bảo token luôn nằm trong user
      };

      setUser(userObj);
      setToken(receivedToken);

      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', receivedToken);
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
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
