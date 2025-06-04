import React from 'react';
import '../assets/CSS/Footer.css';
import { FaFacebookF, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <div className="footer-logo-row">
            <img src="/src/assets/img1/favicon-32x32.png" alt="NoSmoke Logo" className="footer-logo-img" />
            <h3 className="footer-logo-text">NoSmoke</h3>
          </div>
          <p className="footer-desc">
            Nền tảng hỗ trợ cai nghiện thuốc lá hiệu quả và an toàn điện, giúp mọi người tìm lại cuộc sống khỏe mạnh không khói thuốc.
          </p>
          <div className="footer-socials">
            <FaFacebookF />
            <FaInstagram /> 
            <FaYoutube />
          </div>
        </div>

        <div className="footer-column">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="#about">Giới thiệu</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#ranking">Bảng xếp hạng</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Hỗ trợ</h4>
          <ul>  
            <li><a href="#contact">Liên hệ</a></li>
            <li><a href="#privacy">Chính sách bảo mật</a></li>
            <li><a href="#terms">Điều khoản sử dụng</a></li>
            <li><a href="#support">Trung tâm trợ giúp</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Liên hệ</h4>
          <ul className="footer-contact">
            <li><FaMapMarkerAlt /> 123 Đường ABC, Quận 1, TP. Hồ Chí Minh</li>
            <li><FaPhone /> +84 123 456 789</li>
            <li><FaEnvelope /> info@nosmoke.com</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 NoSmoke. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;
