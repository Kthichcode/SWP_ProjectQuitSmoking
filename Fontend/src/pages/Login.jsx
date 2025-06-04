import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import '../assets/CSS/Login.css';
import { Link } from 'react-router-dom';

function Login() {
  const [accessToken, setAccessToken] = useState('');

  const handleGoogleLoginSuccess = (credentialResponse) => {
    console.log('Google login success:', credentialResponse);
    if (credentialResponse.credential) {
      setAccessToken(credentialResponse.credential);
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Google login failed');
  };

  return (
    <>
      <section className="login-section">
        <div className="login-container">
          <img src="/src/assets/img1/android-chrome-192x192.png" alt="Logo" className="logo" />
          <h2>Đăng nhập</h2>
          <p className="subtitle">Chào mừng bạn quay lại với hành trình không khói thuốc</p>

          <form className="login-form">
            <h3>Đăng nhập tài khoản</h3>
            <p className="form-subtitle">Nhập thông tin đăng nhập của bạn bên dưới</p>

            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="your@email.com" />

            <label htmlFor="password">Mật khẩu</label>
            <input type="password" id="password" placeholder="••••••••" />

            <div className="forgot-password">
              <Link to="#">Quên mật khẩu?</Link>
            </div>

            <button type="submit" className="btn-login">→ Đăng nhập</button>

            <div className="google-login-container">
              <p className="or-divider">Hoặc</p>
              <div className="google-login-button">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  useOneTap
                />
              </div>
            </div>

            {accessToken && (
              <div className="token-display">
                <h4>Google Access Token:</h4>
                <div className="token-text">
                  {accessToken.substring(0, 500000)}
                </div>
              </div>
            )}

            <p className="register-link">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}

export default Login;
