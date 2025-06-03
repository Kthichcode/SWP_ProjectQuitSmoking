import React from 'react';
import '../assets/CSS/Home.css';

function Home() {
  return (
    <div>
      <div className="home-header-bar">
        <div className="home-logo">
          <img src="/src/assets/img/favicon_io/android-chrome-192x192.png" alt="NoSmoke Logo" className="logo-img" />
          <span className="logo-text">NoSmoke</span>
        </div>
        <div className="home-nav">
          <button className="nav-btn">Trang chủ</button>
          <button className="nav-btn">Blog</button>
          <button className="nav-btn">Bảng xếp hạng</button>
          <button className="nav-btn">Giới thiệu</button>
        </div>
        <div className="home-auth-buttons">
          <button style={{ marginRight: '10px' }}>Đăng Nhập</button>
          <button>Đăng Ký</button>
        </div>
      </div>
      <div className="home-container">        
        <h1 className="title">Bắt đầu cuộc sống không khói thuốc ngay hôm nay</h1>
        <p>Chào mừng bạn đến với trang hỗ trợ cai nghiện thuốc lá!</p>
        <p>Hãy cùng nhau xây dựng một cuộc sống khỏe mạnh, không khói thuốc.</p>
      </div>
    </div>
  );
}

export default Home;
