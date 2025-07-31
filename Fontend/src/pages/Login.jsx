import React, { useState, useEffect } from 'react';
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
  const [needUsername, setNeedUsername] = useState(false);
  const [emailFromGoogle, setEmailFromGoogle] = useState('');
  const [nameFromGoogle, setNameFromGoogle] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [loginFormError, setLoginFormError] = useState({});
  const navigate = useNavigate();
  // Modal UI cho errorMessage
  const [showErrorModal, setShowErrorModal] = useState(false);
  useEffect(() => {
    if (errorMessage) setShowErrorModal(true);
  }, [errorMessage]);
  // ...existing code...
  const checkInitialInfoAndNavigate = async (token) => {
    try {
      const res = await axios.get('http://localhost:5175/api/member-initial-info/has-submitted', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data === true) {
        navigate('/home', { replace: true });
      } else {
        navigate('/initial-info', { replace: true });
      }
    } catch {
      navigate('/initial-info', { replace: true });
    }
  };

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

        const status = res.data.status;

        if (status === 'success') {
          const token = res.data.data.token;
          localStorage.setItem('token', token);
          login(token);
          const decoded = jwtDecode(token);
          const role = decoded.scope?.toUpperCase();
          if (role === 'ADMIN') {
            navigate('/admin/dashboard', { replace: true });
          } else if (role === 'COACH') {
            navigate('/coach', { replace: true });
          } else if (role === 'MEMBER' || role === 'USER') {
            await checkInitialInfoAndNavigate(token);
          } else {
            navigate('/home', { replace: true });
          }
        } else if (status === 'need_username') {
          setEmailFromGoogle(res.data.data.email);
          setNameFromGoogle(res.data.data.name);
          setNeedUsername(true);
        }
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

  const handleSetUsername = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5175/api/auth/set-username', {
        email: emailFromGoogle,
        username: newUsername,
      });

      if (res.data.status === 'error') {
        setErrorMessage(res.data.message || 'Đã có lỗi xảy ra.');
        return;
      }

      const token = res.data.data.token;
      localStorage.setItem('token', token);
      login(token);
      const decoded = jwtDecode(token);
      const role = decoded.scope?.toUpperCase();
      if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'COACH') {
        navigate('/coach', { replace: true });
      } else if (role === 'MEMBER' || role === 'USER') {
        await checkInitialInfoAndNavigate(token);
      } else {
        navigate('/home', { replace: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      setErrorMessage(msg || 'Đã có lỗi xảy ra.');
    }
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!username.trim()) errors.username = 'Vui lòng nhập tên đăng nhập.';
    if (!password.trim()) errors.password = 'Vui lòng nhập mật khẩu.';
    setLoginFormError(errors);
    if (Object.keys(errors).length > 0) return;
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
      } else if (role === 'MEMBER' || role === 'USER') {
        await checkInitialInfoAndNavigate(token);
      } else {
        navigate('/home', { replace: true });
      }    
    } catch (error) {
      console.error("Login failed", error);
      if (error.response && (error.response.status === 401 || error.response.status === 400)) {
        const msg = error.response.data?.message;
        if (msg) {
          setErrorMessage(msg);
        } else {
          setErrorMessage("Sai tài khoản hoặc mật khẩu");
        }
      } else {
        setErrorMessage("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };
  if (needUsername) {
    return (
        <section className="login-section">
          <div className="login-container">
            <h2>Chào {nameFromGoogle}!</h2>
            <p>Đây là lần đầu bạn đăng nhập. Vui lòng chọn username để hoàn tất đăng ký.</p>
            <form onSubmit={handleSetUsername}>
              <label htmlFor="newUsername">Username</label>
              <input
                  id="newUsername"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
              />
              <button type="submit" className="btn-login">Xác nhận</button>
            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        </section>
    );
  }

  return (
      <section className="login-section">
        {showErrorModal && errorMessage && (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'#fff',padding:32,borderRadius:12,minWidth:300,boxShadow:'0 2px 16px #0003',textAlign:'center'}}>
              <div style={{marginBottom:20,color:'#ef4444',fontWeight:600,fontSize:18}}>{errorMessage}</div>
              <button onClick={()=>setShowErrorModal(false)} style={{padding:'8px 24px',borderRadius:6,background:'#2563eb',color:'#fff',border:'none',fontWeight:500,fontSize:16,cursor:'pointer'}}>OK</button>
            </div>
          </div>
        )}
        <div className="login-container">
          <img src="/src/assets/img1/android-chrome-192x192.png" alt="Logo" className="logo" />
          <h2>NoSmoke</h2>
          <p className="subtitle">Chào mừng bạn quay lại với hành trình không khói thuốc</p>

          <form className="login-form" onSubmit={handleLoginSubmit}>
            <div className="login-quote-box">
            <span className="login-quote-emoji" role="img" aria-label="motivation">💪</span>
            <span className="login-quote-text">"Mỗi ngày mới là một cơ hội để trở thành phiên bản tốt hơn"</span>
          </div>

            <label htmlFor="username">Tên đăng nhập</label>
            <div className="input-password-wrapper">
              <input
                  type="text"
                  id="username"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
              />
              {loginFormError.username && <div style={{ color: 'red', fontSize: 13, marginTop: 4, textAlign: 'left' }}>{loginFormError.username}</div>}
            </div>

            <label htmlFor="password">Mật khẩu</label>
            <div className="input-password-wrapper">
              <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
              <span
                  className="input-password-eye"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  tabIndex={0}
              >
              {showPassword ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06M1 1l22 22"/></svg>
              )}
            </span>
              {loginFormError.password && <div style={{ color: 'red', fontSize: 13, marginTop: 4, textAlign: 'left' }}>{loginFormError.password}</div>}
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="forgot-password">
            <span style={{ cursor: 'pointer' }} onClick={() => setShowForgotModal(true)}>
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
