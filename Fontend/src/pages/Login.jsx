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
  //từ khúc này là phần đăng nhập bằng tài khoản email và mật khẩu gửi qua bên BACKEND 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login success:', data);
        localStorage.setItem('token', data.token);//luu token nếu cần nha
      } else {
        setErrorMessage('Sai tài khoản hoặc mật khẩu');
      }
    } catch (error) {
      setErrorMessage('Lỗi khi gọi API');
    }
  }; //đến khúc này là hết phần đăng nhập bằng tài khoản email và mật khẩu gửi qua bên BACKEND

  return (
    <>
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
                  {accessToken.substring(0, 50000)}
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
