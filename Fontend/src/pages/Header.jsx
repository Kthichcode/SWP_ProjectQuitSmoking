import React, { useState, useEffect } from 'react';
import '../assets/CSS/Home.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Chuyển hướng nếu là ADMIN hoặc COACH
  useEffect(() => {
    if (!user) return;
    const scope = user.scope?.toUpperCase();
    const path = window.location.pathname;
    if ((path === '/' || path === '/home')) {
      if (scope === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (scope === 'COACH') {
        navigate('/coach', { replace: true });
      }
    }
  }, [user, navigate]);

  // Hàm kiểm tra active
  const isActive = (path) => window.location.pathname === path;

  return (
    <div className="home-header-bar">
      <a href="/home" className="home-logo">
        <img src="/src/assets/img1/android-chrome-192x192.png" alt="NoSmoke Logo" className="logo-img" />
        <span className="logo-text">NoSmoke</span>
      </a>

      <div className="home-nav">
        <button className={`nav-btn${isActive('/home') || isActive('/') ? ' active' : ''}`} onClick={() => (window.location.href = '/home')}>Trang chủ</button>
        <button className={`nav-btn${isActive('/blog') ? ' active' : ''}`} onClick={() => (window.location.href = '/blog')}>Blog</button>
        <button className={`nav-btn${isActive('/ranking') ? ' active' : ''}`} onClick={() => (window.location.href = '/ranking')}>Bảng xếp hạng</button>
        <button className={`nav-btn${isActive('/about') ? ' active' : ''}`} onClick={() => (window.location.href = '/about')}>Giới thiệu</button>
        <button className={`nav-btn${isActive('/process') ? ' active' : ''}`} onClick={() => (window.location.href = '/process')}>Tiến Trình Cai Thuốc</button>
      </div>

      <div className="home-auth-buttons">
        {!user ? (
          <>
            <button className="nav-btn" onClick={() => (window.location.href = '/login')}>Đăng Nhập</button>
            <button className="nav-btn" onClick={() => (window.location.href = '/register')}>Đăng Ký</button>
          </>
        ) : (
          <>
            <button
              className="nav-btn"
              style={{ background: '#ffe082', color: '#222', fontWeight: 600, marginRight: 8 }}
              onClick={() => {
                setShowDropdown(false);
                navigate('/payment');
              }}
            >
              Nâng Cấp
            </button>
            <div className="user-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className="nav-btn"
                style={{ fontWeight: 600, background: 'none', border: 'none', color: '#222', cursor: 'pointer' }}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {user.name || user.email}
                <span style={{ marginLeft: 6 }}>&#9662;</span>
              </button>
              {showDropdown && (
                <div className="dropdown-menu custom-dropdown2">
                  <button
                    className="dropdown-item2 profile-btn2"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/profile');
                    }}
                  >
                    <span className="dropdown-icon2" role="img" aria-label="profile">👤</span>
                    Tài khoản
                  </button>
                  <button
                    className="dropdown-item2 logout-btn2"
                    onClick={() => {
                      logout();
                      localStorage.removeItem('token');
                      setShowDropdown(false);
                      setTimeout(() => {
                        window.location.href = '/login';
                      }, 100);
                    }}
                  >
                    <span className="dropdown-icon2" role="img" aria-label="logout">🚪</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
