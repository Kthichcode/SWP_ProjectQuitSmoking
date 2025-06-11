import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/CSS/Home.css';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="home-header-bar">
      <Link to="/" className="home-logo" onClick={scrollToTop}>
        <img src="/src/assets/img1/android-chrome-192x192.png" alt="NoSmoke Logo" className="logo-img" />
        <span className="logo-text">NoSmoke</span>
      </Link>
      <div className="home-nav">
        <Link to="/" onClick={scrollToTop}><button className="nav-btn">Trang chủ</button></Link>
        <Link to="/blog" onClick={scrollToTop}><button className="nav-btn">Blog</button></Link>
        <Link to="/ranking" onClick={scrollToTop}><button className="nav-btn">Bảng xếp hạng</button></Link>
        <Link to="/about" onClick={scrollToTop}><button className="nav-btn">Giới thiệu</button></Link>
        <button className="nav-btn" onClick={scrollToTop}>Tiến Trình Cai Thuốc</button>
      </div>
      <div className="home-auth-buttons">
        {!user ? (
          <>
            <Link to="/login"><button className="nav-btn">Đăng Nhập</button></Link>
            <Link to="/register"><button className="nav-btn">Đăng Ký</button></Link>
          </>
        ) : (
          <div className="user-dropdown" style={{ position: 'relative' }}>
            <button
              className="nav-btn"
              style={{ fontWeight: 600, background: 'none', border: 'none', color: '#222', cursor: 'pointer' }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user.name || user.email}
              <span style={{ marginLeft: 6 }}>&#9662;</span>
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div>{user.name || 'No name'}</div>
                  <div>{user.email}</div>
                </div>
                <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  Thông tin cá nhân
                </Link>
                <button className="dropdown-item logout-btn" onClick={() => { logout(); setShowDropdown(false); }}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;