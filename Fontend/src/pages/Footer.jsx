import React, { useState } from 'react';
import Modal from '../components/Modal';
import '../assets/CSS/Footer.css';

// Custom scrollbar style for modal content
const modalScrollStyle = {
  color: '#222',
  maxHeight: '60vh',
  overflowY: 'auto',
  scrollbarColor: '#111 #eee',
  scrollbarWidth: 'thin',
};
import { FaFacebookF, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
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
            <li><a href="about">Giới thiệu</a></li>
            <li><a href="blog">Blog</a></li>
            <li><a href="ranking">Bảng xếp hạng</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Hỗ trợ</h4>
          <ul>  
            <li><a href="contact">Liên hệ</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setShowPrivacy(true); }}>Chính sách bảo mật</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setShowTerms(true); }}>Điều khoản sử dụng</a></li>
            <li><a href="support">Trung tâm trợ giúp</a></li>
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
      {showTerms && (
        <Modal title={<span style={{ color: '#222' }}>Điều khoản sử dụng</span>} onClose={() => setShowTerms(false)}>
          <div style={modalScrollStyle} className="modal-scroll-custom">
            <h4>1. Mục đích sử dụng</h4>
            <p>Nền tảng được phát triển nhằm hỗ trợ người dùng trong hành trình cai thuốc lá, bao gồm việc lập kế hoạch bỏ thuốc, theo dõi tiến trình, nhận thông báo động viên và kết nối cộng đồng.</p>
            <h4>2. Trách nhiệm của người dùng</h4>
            <ul>
              <li>Không cung cấp thông tin sai lệch khi đăng ký tài khoản.</li>
              <li>Không đăng tải nội dung gây hại, xúc phạm, hoặc trái pháp luật.</li>
              <li>Không sử dụng nền tảng cho mục đích gian lận hoặc thương mại trái phép.</li>
            </ul>
            <h4>3. Quyền của nền tảng</h4>
            <ul>
              <li>Có quyền khóa tài khoản nếu người dùng vi phạm điều khoản.</li>
              <li>Có thể thay đổi nội dung và chức năng mà không cần báo trước.</li>
            </ul>
            <h4>4. Miễn trừ trách nhiệm</h4>
            <p>Nền tảng không thay thế tư vấn y tế chuyên môn. Người dùng nên tham khảo bác sĩ nếu cần hỗ trợ y tế cụ thể.</p>
          </div>
        </Modal>
      )}
      {showPrivacy && (
        <Modal title={<span style={{ color: '#222' }}>Chính sách bảo mật</span>} onClose={() => setShowPrivacy(false)}>
          <div style={modalScrollStyle} className="modal-scroll-custom">
            <h4>1. Thông tin thu thập</h4>
            <ul>
              <li>Họ tên, email, tên đăng nhập, mật khẩu</li>
              <li>Thông tin tiến trình cai thuốc</li>
              <li>Thông tin hành vi sử dụng (ẩn danh)</li>
            </ul>
            <h4>2. Mục đích sử dụng thông tin</h4>
            <ul>
              <li>Cung cấp và cải thiện dịch vụ</li>
              <li>Gửi thông báo, lời nhắc và lời khuyên</li>
              <li>Hỗ trợ kỹ thuật và phản hồi người dùng</li>
            </ul>
            <h4>3. Bảo mật và chia sẻ thông tin</h4>
            <ul>
              <li>Thông tin của bạn được bảo mật bằng các biện pháp kỹ thuật phù hợp.</li>
              <li>Chúng tôi không chia sẻ dữ liệu cá nhân cho bên thứ ba, trừ khi có sự đồng ý của bạn hoặc theo yêu cầu pháp luật.</li>
            </ul>
            <h4>4. Quyền của người dùng</h4>
            <ul>
              <li>Có thể xem, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân.</li>
              <li>Có thể yêu cầu xóa tài khoản bất cứ lúc nào.</li>
            </ul>
          </div>
        </Modal>
      )}
    </footer>
  );
};

export default Footer;
