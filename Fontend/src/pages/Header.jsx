import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/CSS/Home.css'; 

const Header = () => {
  return (
    <div className="home-header-bar">
      <Link to="/" className="home-logo">
        <img src="/src/assets/img1/android-chrome-192x192.png" alt="NoSmoke Logo" className="logo-img" />
        <span className="logo-text">NoSmoke</span>
      </Link>
      <div className="home-nav">
        <Link to="/">
          <button className="nav-btn">Trang chủ</button>
        </Link>
        <Link to="/blog">
          <button className="nav-btn">Blog</button>
        </Link>
        <button className="nav-btn">Bảng xếp hạng</button>
        <Link to="/about">
          <button className="nav-btn">Giới thiệu</button>
        </Link>
        <button className="nav-btn">Tiến Trình Cai Thuốc</button>
      </div>
      <div className="home-auth-buttons">
        <Link to="/login">
          <button className="nav-btn">Đăng Nhập</button>
        </Link>
        <Link to="/register">
          <button className="nav-btn">Đăng Ký</button>
        </Link>
      </div>
    </div>
  );
};

export default Header;