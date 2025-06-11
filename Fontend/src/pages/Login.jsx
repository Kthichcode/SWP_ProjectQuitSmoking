import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import '../assets/CSS/Login.css';
import { Link,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [accessToken, setAccessToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    scope: 'openid profile email https://www.googleapis.com/auth/userinfo.profile',
    onSuccess: async (tokenResponse) => {
      console.log('Google login success:', tokenResponse);
      setAccessToken(tokenResponse.access_token);

      try {
        const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        console.log('Google User Info:', res.data);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    },
    onError: () => {
      console.error('Google login failed');
    },
  });
  const { login } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    // Fake login
    if (email === 'test@gmail.com' && password === '1') {
      login({
        email,
        name: 'Người dùng thử',
        avatar: '/src/assets/img1/android-chrome-192x192.png'
      });
      setErrorMessage('');
      // Có thể chuyển hướng về trang chủ nếu muốn
      navigate('/');
    } else {
      setErrorMessage('Sai tài khoản hoặc mật khẩu');
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <img src="/src/assets/img1/android-chrome-192x192.png" alt="Logo" className="logo" />
        <h2>Đăng nhập</h2>
        <p className="subtitle">Chào mừng bạn quay lại với hành trình không khói thuốc</p>

        <form className="login-form" onSubmit={handleLoginSubmit}>
          <h3>Đăng nhập tài khoản</h3>
          <p className="form-subtitle">Nhập thông tin đăng nhập của bạn bên dưới</p>

          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Mật khẩu</label>
          <input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <div className="forgot-password">
            <Link to="#">Quên mật khẩu?</Link>
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

          {accessToken && (
            <div className="token-display">
              <h4>Google Access Token:</h4>
              <div className="token-text">
                {accessToken}
              </div>
            </div>
          )}

          <p className="register-link">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Login;
