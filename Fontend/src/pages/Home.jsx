import React, { useEffect, useState } from 'react';
import '../assets/CSS/Home.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);

  // ✅ Điều hướng ADMIN / COACH
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

  // ✅ Gọi API lấy blog
  useEffect(() => {
    setLoadingBlogs(true);
    axios.get('/api/blog/getAllBlog')
      .then(res => {
        const data = res.data?.data || [];
        setBlogs(data);
      })
      .catch(err => {
        setBlogs([]);
      })
      .finally(() => setLoadingBlogs(false));
  }, []);

  // ✅ Chuyển hướng khi click nút cần login
  const handleProtectedClick = (targetPath) => {
    if (user) navigate(targetPath);
    else navigate('/login');
  };

  // ✅ Xử lý đọc tiếp
  const handleReadMore = (blog) => {
    const blogId = blog.id || blog._id;
    if (!user) {
      navigate('/login');
    } else if (blogId) {
      navigate(`/blog/${blogId}`);
    }
  };

  // ✅ Tạm thời không lọc theo ảnh để tránh bị loại
  const validBlogs = blogs.filter(blog =>
    blog.title && blog.content // && (blog.coverImage || blog.image)
  );

  console.log('📦 Danh sách blog từ API:', blogs);
  console.log('✅ Blog hợp lệ sau lọc:', validBlogs);

  return (
    <div>
      {/* Hero section */}
      <div className="home-main-section">
        <img
          className="quit-smoking-anim"
          src="https://openmoji.org/data/color/svg/1F6AD.svg"
          alt="No Smoking Support"
        />
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
            <img src="/src/assets/img1/android-chrome-192x192.png" alt="Tự do không khói thuốc" className="icon" />
            <h3>Tự do không khói thuốc</h3>
            <p>Hơn 10,000+ người đã thành công cai nghiện thuốc lá với nền tảng của chúng tôi.</p>
          </div>
        </div>
      </div>

      {/* Lý do chọn */}
      <div className="why-nosmoke">
        <h2>Tại sao nên chọn NoSmoke?</h2>
        <p>Nền tảng của chúng tôi cung cấp những công cụ và hỗ trợ thiết thực để giúp bạn từng bước cai nghiện thuốc lá thành công.</p>
        <div className="features">
          {[
            { icon: 'progress.png', title: 'Theo dõi tiến trình', desc: 'Ghi lại và xem quá trình cai nghiện với các thống kê trực quan.' },
            { icon: 'health.png', title: 'Cải thiện sức khỏe', desc: 'Xem những lợi ích sức khỏe và thay đổi tích cực sau khi bỏ thuốc.' },
            { icon: 'time.png', title: 'Đếm thời gian thực', desc: 'Theo dõi chính xác thời gian bạn đã không hút thuốc và đạt được các cột mốc.' },
            { icon: 'save-money.png', title: 'Tiết kiệm chi phí', desc: 'Tính toán số tiền bạn đã tiết kiệm được kể từ khi bỏ thuốc.' },
          ].map(f => (
            <div className="feature-box" key={f.title}>
              <img src={`/src/assets/img/${f.icon}`} alt={f.title} />
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking */}
      <div className="ranking-section">
        <h2>Bảng xếp hạng thành tích</h2>
        <p>Hãy xem những người xuất sắc trong việc cai thuốc và số ngày không hút thuốc họ đã đạt được.</p>
        <div className="ranking-list">
          {[
            { name: 'Nguyễn Văn A', days: 120, money: '2,400,000₫' },
            { name: 'Trần Thị B', days: 95, money: '1,900,000₫' },
            { name: 'Phạm Văn C', days: 70, money: '1,400,000₫' },
            { name: 'Lê Thị D', days: 60, money: '1,200,000₫' },
          ].map((user, i) => (
            <div className={`rank-card ${i === 0 ? 'top' : ''}`} key={user.name}>
              <div className="rank-avatar"></div>
              <h4>{user.name}</h4>
              <p>{user.days} ngày</p>
              <strong>{user.money}</strong>
            </div>
          ))}
        </div>
        <button className="white-btn" onClick={() => handleProtectedClick('/ranking')}>
          Xem bảng xếp hạng đầy đủ
        </button>
      </div>

      {/* Blog section */}
      <div className="blog-section">
        <h2>Blog chia sẻ kinh nghiệm</h2>
        <p>Cùng lắng nghe những câu chuyện, lời khuyên chân thực từ cộng đồng và chuyên gia trong hành trình bỏ thuốc lá.</p>
        <div className="blog-list" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          margin: '24px 0'
        }}>
          {loadingBlogs ? (
            <p>Đang tải...</p>
          ) : validBlogs.length > 0 ? (
            validBlogs.slice(0, 6).map(blog => (
              <div className="blog-card" key={blog.id || blog._id}>
                <img
                  src={blog.coverImage || blog.image || '/default-image.jpg'}
                  alt={blog.title || 'Bài viết'}
                />
                <h4>{blog.title || 'Không có tiêu đề'}</h4>
                <p>{blog.content?.slice(0, 100) || 'Không có nội dung.'}</p>
                <span
                  style={{ color: '#2e7dff', cursor: 'pointer' }}
                  onClick={() => handleReadMore(blog)}
                >
                  Đọc tiếp →
                </span>
              </div>
            ))
          ) : (
            <p>Không có bài viết nào phù hợp.</p>
          )}
        </div>
        <button className="white-btn" onClick={() => handleProtectedClick('/blog')}>
          Xem tất cả bài viết
        </button>
      </div>
    </div>
  );
}

export default Home;
