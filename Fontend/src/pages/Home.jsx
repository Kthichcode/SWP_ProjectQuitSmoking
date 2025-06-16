import React, { useEffect } from 'react';
import '../assets/CSS/Home.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (!user) return;
    const scope = user.scope?.toUpperCase();
    const currentPath = window.location.pathname;

    if (scope === 'ADMIN' && (currentPath === '/' || currentPath === '/home')) {
      window.location.replace('/admin/dashboard'); 
    } else if (scope === 'COACH' && (currentPath === '/' || currentPath === '/home')) {
      window.location.replace('/coach'); 
    }
  }, [user]);

  const handleProtectedClick = (targetPath) => {
    if (user) {
      navigate(targetPath);
    } else {
      navigate('/login');
    }
  };

  return (
    <div>
      {/* Section 1 - Hero */}
      <div className="home-main-section">
        <div className="main-left">
          <h1>Bắt đầu cuộc sống không khói thuốc ngay hôm nay</h1>
          <p>Nền tảng hỗ trợ cai nghiện thuốc lá hiệu quả với cộng đồng hỗ trợ và công cụ theo dõi tiến trình cá nhân.</p>
          <div className="main-buttons">
            {!user && (
              <button className="green-btn" onClick={() => handleProtectedClick('/register')}>
                Bắt đầu ngay
              </button>
            )}
            <button className="white-btn" onClick={() => navigate('/about')}>
              Tìm hiểu thêm
            </button>
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

      {/* Section 2 - Lý do chọn */}
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

      {/* Section 3 - Bảng xếp hạng */}
      <div className="ranking-section">
        <h2>Bảng xếp hạng thành tích</h2>
        <p>Hãy xem những người xuất sắc trong việc cai thuốc và số ngày không hút thuốc họ đã đạt được.</p>
        <div className="ranking-list">
          {[
            { name: 'Nguyễn Văn A', days: 120, money: '2,400,000₫' },
            { name: 'Trần Thị B', days: 95, money: '1,900,000₫' },
            { name: 'Phạm Văn C', days: 70, money: '1,400,000₫' },
            { name: 'Lê Thị D', days: 60, money: '1,200,000₫' },
          ].map((user, index) => (
            <div className={`rank-card ${index === 0 ? 'top' : ''}`} key={user.name}>
              <div className="rank-avatar"></div>
              <h4>{user.name}</h4>
              <p>{user.days} ngày</p>
              <strong>{user.money}</strong>
            </div>
          ))}
        </div>
        <button className="white-btn" aria-label="Xem bảng xếp hạng đầy đủ" onClick={() => handleProtectedClick('/ranking')}>
          Xem bảng xếp hạng đầy đủ
        </button>
      </div>

      {/* Section 4 - Blog */}
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
        <button className="white-btn" aria-label="Xem tất cả bài viết" onClick={() => handleProtectedClick('/blog')}>
          Xem tất cả bài viết
        </button>
      </div>
    </div>
  );
}

export default Home;
