import React from 'react';
import '../assets/CSS/Home.css';
import { Link } from 'react-router-dom';
function Home() {

  return (
    <div>
      {/* XÓA TOÀN BỘ ĐOẠN NÀY */}
      {/* <div className="home-header-bar">
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
          <Link to="/ranking">
            <button className="nav-btn">Bảng xếp hạng</button>
          </Link>
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
      </div> */}
      {/* KẾT THÚC ĐOẠN XÓA */}

      <div className="home-main-section">
        <div className="main-left">
          <h1>Bắt đầu cuộc sống không khói thuốc ngay hôm nay</h1>
          <p>Nền tảng hỗ trợ cai nghiện thuốc lá hiệu quả với cộng đồng hỗ trợ và công cụ theo dõi tiến trình cá nhân.</p>
          <div className="main-buttons">
            <button className="green-btn">Bắt đầu ngay</button>
            <button className="white-btn">Tìm hiểu thêm</button>
          </div>
        </div>
        <div className="main-right">
          <div className="box">
            <img src="/src/assets/img/no-smoking.png" alt="Tự do không khói thuốc" className="icon" />
            <h3>Tự do không khói thuốc</h3>
            <p>Hơn 10,000+ người đã thành công cai nghiện thuốc lá với nền tảng của chúng tôi.</p>
          </div>
        </div>
      </div>

      <div className="why-nosmoke">
        <h2>Tại sao nên chọn NoSmoke?</h2>
        <p>Nền tảng của chúng tôi cung cấp những công cụ và hỗ trợ thiết thực để giúp bạn từng bước cai nghiện thuốc lá thành công.</p>
        <div className="features">
          <div className="feature-box">
            <img src="/src/assets/img/progress.png" alt="Theo dõi tiến trình" />
            <h4>Theo dõi tiến trình</h4>
            <p>Ghi lại và xem quá trình cai nghiện với các thống kê trực quan.</p>
          </div>
          <div className="feature-box">
            <img src="/src/assets/img/health.png" alt="Cải thiện sức khỏe" />
            <h4>Cải thiện sức khỏe</h4>
            <p>Xem những lợi ích sức khỏe và thay đổi tích cực sau khi bỏ thuốc.</p>
          </div>
          <div className="feature-box">
            <img src="/src/assets/img/time.png" alt="Đếm thời gian thực" />
            <h4>Đếm thời gian thực</h4>
            <p>Theo dõi chính xác thời gian bạn đã không hút thuốc và đạt được các cột mốc.</p>
          </div>
          <div className="feature-box">
            <img src="/src/assets/img/save-money.png" alt="Tiết kiệm chi phí" />
            <h4>Tiết kiệm chi phí</h4>
            <p>Tính toán số tiền bạn đã tiết kiệm được kể từ khi bỏ thuốc.</p>
          </div>
        </div>
      </div>
      <div className="ranking-section">
        <h2>Bảng xếp hạng thành tích</h2>
        <p>Hãy xem những người xuất sắc trong việc cai thuốc và số ngày không hút thuốc họ đã đạt được.</p>
        <div className="ranking-list">
          <div className="rank-card top">
            <div className="rank-avatar"></div>
            <h4>Nguyễn Văn A</h4>
            <p>120 ngày</p>
            <strong>2,400,000₫</strong>
          </div>
          <div className="rank-card">
            <div className="rank-avatar"></div>
            <h4>Trần Thị B</h4>
            <p>95 ngày</p>
            <strong>1,900,000₫</strong>
          </div>
          <div className="rank-card">
            <div className="rank-avatar"></div>
            <h4>Phạm Văn C</h4>
            <p>70 ngày</p>
            <strong>1,400,000₫</strong>
          </div>
          <div className="rank-card">
            <div className="rank-avatar"></div>
            <h4>Lê Thị D</h4>
            <p>60 ngày</p>
            <strong>1,200,000₫</strong>
          </div>
        </div>
        <button className="white-btn">Xem bảng xếp hạng đầy đủ</button>
      </div>

      <div className="blog-section">
        <h2>Blog chia sẻ kinh nghiệm</h2>
        <p>Cùng lắng nghe những câu chuyện, lời khuyên chân thực từ cộng đồng và chuyên gia trong hành trình bỏ thuốc lá.</p>
        <div className="blog-list">
          <div className="blog-card">
            <img src="/src/assets/img/blog1.jpg" alt="Blog 1" />
            <h4>10 lợi ích sức khỏe khi bạn bỏ thuốc lá trong 30 ngày đầu tiên</h4>
            <p>Khám phá những thay đổi kỳ diệu trong cơ thể bạn chỉ sau 1 tháng không hút thuốc.</p>
            <span>Đọc tiếp →</span>
          </div>
          <div className="blog-card">
            <img src="/src/assets/img/blog2.jpg" alt="Blog 2" />
            <h4>Phương pháp giữ vững cam kết bỏ thuốc hiệu quả nhất</h4>
            <p>Các mẹo thực tế giúp bạn kiên trì và vượt qua cám dỗ.</p>
            <span>Đọc tiếp →</span>
          </div>
          <div className="blog-card">
            <img src="/src/assets/img/blog3.jpg" alt="Blog 3" />
            <h4>Câu chuyện thành công: Thử 2-3 lần rồi cũng bỏ được thuốc</h4>
            <p>Một câu chuyện truyền cảm hứng từ người từng thất bại nhiều lần.</p>
            <span>Đọc tiếp →</span>
          </div>
        </div>
        <button className="white-btn">Xem tất cả bài viết</button>
      </div>
    </div>
  );
}

export default Home;
