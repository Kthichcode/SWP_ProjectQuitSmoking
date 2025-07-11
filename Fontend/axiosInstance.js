import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5175',
});

// Add token before each request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          console.log("No refresh token. Redirecting to login.");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const res = await axios.post('http://localhost:5175/api/auth/refresh-token', {
          refreshToken: refreshToken
        });

        if (res.data.status === 'success' && res.data.data?.token) {
          const newToken = res.data.data.token;
          const newRefreshToken = res.data.data.refreshToken;

          localStorage.setItem("token", newToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } else {
          console.log("Failed to refresh token. Redirecting to login.");
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.log("Refresh token failed:", refreshError);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
