import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Xóa dữ liệu lỗi (nếu có) để tránh lỗi vĩnh viễn
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}, []);


  const login = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
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