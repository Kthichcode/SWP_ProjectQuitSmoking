import React, { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useGoogleLogin } from '@react-oauth/google';
import '../assets/CSS/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

function Login() {
  const { login, user } = useAuth();
  const [accessToken, setAccessToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      
      if (user.scope?.toUpperCase() === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.scope?.toUpperCase() === 'COACH') {
        navigate('/coach', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [user, navigate]);
  
  useEffect(() => {
  const handlePageShow = (e) => {
    const token = localStorage.getItem('token');
    if (token && user) {
      window.location.reload();
    }
  };

  window.addEventListener('pageshow', handlePageShow);
  return () => window.removeEventListener('pageshow', handlePageShow);
}, [user]);


  const googleLogin = useGoogleLogin({
    scope: 'openid profile email https://www.googleapis.com/auth/userinfo.profile',
    onSuccess: async (tokenResponse) => {
      const googleToken = tokenResponse.access_token;
      setAccessToken(googleToken);

      try {
        const res = await axios.post("http://localhost:5175/api/auth/google-login", {
          access_token: googleToken,
        });

        const token = res.data.data.token;
        localStorage.setItem('token', token);
        login(token);

        navigate('/home', { replace: true });
      } catch (err) {
        console.error('Gửi access_token về backend thất bại:', err);
        setErrorMessage('Đăng nhập Google thất bại. Vui lòng thử lại.');
      }
    },
    onError: () => {
      console.error('Google login failed');
      setErrorMessage('Đăng nhập Google thất bại. Vui lòng thử lại.');
    },
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5175/api/auth/login", {
        username,
        password,
      });

      const token = response.data.data.token;
      localStorage.setItem('token', token);
      login(token);

      const decoded = jwtDecode(token);
      const role = decoded.scope?.toUpperCase();

      if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'COACH') {
        navigate('/coach', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }

      setErrorMessage('');
    } catch (error) {
      console.error("Login failed", error);
      if (error.response && error.response.status === 401) {
        setErrorMessage("Sai tài khoản hoặc mật khẩu");
      } else {
        setErrorMessage("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  return (
    <section className="login-section">
     
      <div className="login-cloud"></div>
      <div className="login-cloud login-cloud-2"></div>
      <div className="login-container">
        <img src="/src/assets/img1/android-chrome-192x192.png" alt="Logo" className="logo" />
        <h2>Đăng nhập</h2>
        <p className="subtitle">Chào mừng bạn quay lại với hành trình không khói thuốc</p>

        <form className="login-form" onSubmit={handleLoginSubmit}>
          <div className="login-quote-box">
            <span role="img" aria-label="muscle" className="login-quote-emoji">💪</span>
            <span className="login-quote-text">"Mỗi ngày mới là một cơ hội để trở thành phiên bản tốt hơn của chính mình"</span>
          </div>

          <label htmlFor="username">Tên đăng nhập</label>
          <div className="input-password-wrapper">
            <input
              type="text"
              id="username"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <label htmlFor="password">Mật khẩu</label>
          <div className="input-password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="input-password-eye"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              tabIndex={0}
            >
              {showPassword ? (
                <FiEye size={18} />
              ) : (
                <FiEyeOff size={18} />
              )}
            </span>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="forgot-password">
            <span style={{ cursor: 'pointer', color: '#4CAF50' }} onClick={() => setShowForgotModal(true)}>
              Quên mật khẩu?
            </span>
          </div>

          <button type="submit" className="btn-login">→ Đăng nhập</button>

          <div className="google-login-container">
            <p className="or-divider">Hoặc</p>
            <div className="google-login-button">
              <button
                type="button"
                onClick={() => googleLogin()}
                className="btn-google-custom"
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google logo"
                  className="google-logo"
                />
                <span>Đăng nhập bằng Google</span>
              </button>
            </div>
          </div>

          <p className="register-link">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </form>
      </div>
      <ForgotPasswordModal show={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </section>
  );
}

export default Login;
