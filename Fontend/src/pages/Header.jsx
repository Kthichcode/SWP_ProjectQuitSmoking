import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/CSS/Home.css';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="home-header-bar">
      <Link to="/" className="home-logo">
        <img src="/src/assets/img1/android-chrome-192x192.png" alt="NoSmoke Logo" className="logo-img" />
        <span className="logo-text">NoSmoke</span>
      </Link>
      <div className="home-nav">
        <Link to="/"><button className="nav-btn">Trang chủ</button></Link>
        <Link to="/blog"><button className="nav-btn">Blog</button></Link>
        <Link to="/ranking"><button className="nav-btn">Bảng xếp hạng</button></Link>
        <Link to="/about"><button className="nav-btn">Giới thiệu</button></Link>
        <button className="nav-btn">Tiến Trình Cai Thuốc</button>
      </div>
      <div className="home-auth-buttons">
        {!user ? (
          <>
            <Link to="/login"><button className="nav-btn">Đăng Nhập</button></Link>
            <Link to="/register"><button className="nav-btn">Đăng Ký</button></Link>
          </>
        ) : (
          <div className="avatar-dropdown" style={{ position: 'relative' }}>
            <img
              src={user.avatar || '/src/assets/img1/android-chrome-192x192.png'}
              alt="avatar"
              className="avatar-img"
              style={{ width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div className="dropdown-menu" style={{
                position: 'absolute', right: 0, top: 50, background: '#fff', boxShadow: '0 2px 8px #ccc', borderRadius: 8, minWidth: 150, zIndex: 10
              }}>
                <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>Trang cá nhân</Link>
                <button className="dropdown-item" onClick={() => { logout(); setShowDropdown(false); }}>Đăng xuất</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;