import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (!storedUser || !storedToken || !storedRefreshToken) {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        localStorage.clear();
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser({ ...parsedUser, token: storedToken });
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
    } catch (error) {
      console.error('Lỗi khi parse localStorage:', error);
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.clear();
    }
  }, []);

  const login = (data) => {
    const receivedToken = data.token || data;
    const receivedRefreshToken = data.refreshToken;

    try {
      const decoded = jwtDecode(receivedToken);
      const userObj = {
        ...decoded,
        name: decoded.full_name || decoded.sub || 'No name',
        token: receivedToken,
      };

      setUser(userObj);
      setToken(receivedToken);
      setRefreshToken(receivedRefreshToken);

      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('refreshToken', receivedRefreshToken);
    } catch (error) {
      console.error('Lỗi khi decode token:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.clear();
    window.location.href = "/login"; // Optional redirect
  };

  const refreshAccessToken = async () => {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken');
      if (!currentRefreshToken) {
        logout();
        return;
      }

      const response = await fetch('http://localhost:5175/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      const resData = await response.json();

      if (resData.status === 'success' && resData.data?.token) {
        const newToken = resData.data.token;
        const newRefreshToken = resData.data.refreshToken;

        setToken(newToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Update token in user object
        setUser((prevUser) => prevUser ? { ...prevUser, token: newToken } : null);

        console.log('Token refreshed successfully.');
        return newToken;
      } else {
        logout();
      }
    } catch (e) {
      console.error('Lỗi khi refresh token:', e);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
