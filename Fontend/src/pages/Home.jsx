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
  const [ranking, setRanking] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [rankingError, setRankingError] = useState('');
  const [showMembershipMessage, setShowMembershipMessage] = useState(false);

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

  useEffect(() => {
    setLoadingBlogs(true);
    const token = localStorage.getItem('token');
    axios.get('/api/blog/getAllBlog', token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      .then(res => {
        const data = res.data?.data || [];
        setBlogs(data.filter(blog => blog.status === 'APPROVED'));
      })
      .catch(err => {
        setBlogs([]);
      })
      .finally(() => setLoadingBlogs(false));
  }, []);

  useEffect(() => {
    setLoadingRanking(true);
    setRankingError('');
    fetch('/api/member-badge/ranking')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          const sorted = [...data.data].sort((a, b) => b.totalScore - a.totalScore);
          setRanking(sorted);
        } else {
          setRanking([]);
        }
      })
      .catch(() => {
        setRankingError('Không thể tải bảng xếp hạng');
        setRanking([]);
      })
      .finally(() => setLoadingRanking(false));
  }, []);

  const handleProtectedClick = (targetPath) => {
    if (user) navigate(targetPath);
    else navigate('/login');
  };

  // Kiểm tra membership từ localStorage
  const hasMembership = () => {
    const membership = localStorage.getItem('currentMembership');
    if (!membership) return false;
    try {
      const m = JSON.parse(membership);
      return m && m.status === 'ACTIVE';
    } catch {
      return false;
    }
  };

  const handleReadMore = (blog) => {
    const blogId = blog.id || blog._id;
    if (!user) {
      navigate('/login');
    } else if (!hasMembership()) {
      setShowMembershipMessage(true);
      setTimeout(() => setShowMembershipMessage(false), 3000);
    } else if (blogId) {
      navigate(`/blog/${blogId}`);
    }
  };

  const validBlogs = blogs.filter(blog =>
    blog.title && blog.content
  );

  useEffect(() => {
    const checkAndLogout = () => {
      const lastClosed = sessionStorage.getItem('lastClosed');
      if (lastClosed) {
        const diff = Date.now() - parseInt(lastClosed, 10);
        if (diff > 5 * 60 * 1000) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      sessionStorage.removeItem('lastClosed');
    };
    checkAndLogout();
    const handleBeforeUnload = () => {
      sessionStorage.setItem('lastClosed', Date.now().toString());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div>
      {showMembershipMessage && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999, background: '#fffbe6', color: '#d35400', padding: '16px 28px', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontWeight: 600 }}>
          Bạn cần đăng ký gói thành viên để có thể sử dụng chức năng này
        </div>
      )}
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
      <div className="ranking-section">
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: '2rem', marginBottom: 8, letterSpacing: 1 }}>Bảng xếp hạng thành tích</h2>
        <p style={{ textAlign: 'center', color: '#555', marginBottom: 32 }}>Hãy xem những người xuất sắc trong việc cai thuốc và số ngày không hút thuốc họ đã đạt được.</p>
        {loadingRanking ? (
          <div style={{ textAlign: 'center', margin: '40px 0', fontSize: '1.2rem', color: '#2e7dff' }}>Đang tải bảng xếp hạng...</div>
        ) : rankingError ? (
          <div style={{ color: 'red', textAlign: 'center', margin: '40px 0', fontWeight: 600 }}>{rankingError}</div>
        ) : (
          <div className="ranking-list" style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginBottom: 24 }}>
            {ranking.slice(0, 4).map((user, i) => {
              let displayName = user.fullName;
              if (!displayName && user.email) {
                displayName = user.email.replace(/@gmail\.com$/, '');
              }
              let topLabel = '';
              let topIcon = '';
              let cardBg = '#fff';
              let border = '1px solid #eee';
              let shadow = '0 2px 12px rgba(44,62,80,0.08)';
              let nameColor = '#222';
              let scoreColor = '#2e7dff';
              if (i === 0) {
                topLabel = 'Top 1'; topIcon = '🥇';
                cardBg = 'linear-gradient(135deg, #fffbe6 60%, #ffeaa7 100%)';
                border = '2px solid #f39c12';
                shadow = '0 4px 24px rgba(243,156,18,0.15)';
                nameColor = '#f39c12';
                scoreColor = '#d35400';
              } else if (i === 1) {
                topLabel = 'Top 2'; topIcon = '🥈';
                cardBg = 'linear-gradient(135deg, #f0f4f8 60%, #d6e4ff 100%)';
                border = '2px solid #2e7dff';
                shadow = '0 4px 24px rgba(46,125,255,0.12)';
                nameColor = '#2e7dff';
                scoreColor = '#1565c0';
              } else if (i === 2) {
                topLabel = 'Top 3'; topIcon = '🥉';
                cardBg = 'linear-gradient(135deg, #fff0f0 60%, #ffb3b3 100%)';
                border = '2px solid #e67e22';
                shadow = '0 4px 24px rgba(230,126,34,0.12)';
                nameColor = '#e67e22';
                scoreColor = '#b9770e';
              }
              return (
                <div
                  className={`rank-card${i === 0 ? ' top' : ''}`}
                  key={user.memberId}
                  style={{
                    background: cardBg,
                    border,
                    boxShadow: shadow,
                    borderRadius: 18,
                    padding: '24px 32px',
                    minWidth: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    transition: 'transform 0.2s',
                    fontFamily: 'inherit',
                  }}
                >
                  {topLabel && (
                    <div style={{
                      fontWeight: 800,
                      color: nameColor,
                      fontSize: '1.3rem',
                      marginBottom: 8,
                      letterSpacing: 1,
                      textShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>{topIcon} {topLabel}</div>
                  )}
                  <h4 style={{
                    fontWeight: 700,
                    color: nameColor,
                    fontSize: '1.15rem',
                    margin: 0,
                    marginBottom: 6,
                    textAlign: 'center',
                    textShadow: '0 1px 4px rgba(0,0,0,0.07)'
                  }}>{displayName}</h4>
                  <strong style={{
                    color: scoreColor,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginTop: 2,
                    letterSpacing: 1
                  }}>{user.totalScore} điểm</strong>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button className="white-btn" style={{ fontWeight: 600, fontSize: '1rem', padding: '10px 28px', borderRadius: 12, boxShadow: '0 2px 8px rgba(44,62,80,0.08)' }} onClick={() => handleProtectedClick('/ranking')}>
            Xem bảng xếp hạng đầy đủ
          </button>
        </div>
      </div>
      <div className="blog-section">
        <h2>Blog chia sẻ kinh nghiệm</h2>
        <p>Cùng lắng nghe những câu chuyện, lời khuyên chân thực từ cộng đồng và chuyên gia trong hành trình bỏ thuốc lá.</p>
        <div className="blog-list">
          {loadingBlogs ? (
            <p>Đang tải...</p>
          ) : validBlogs.length > 0 ? (
            validBlogs.slice(0, 6).map(blog => (
              <div className="blog-card" key={blog.id || blog._id}>
                <div
                  className="blog-card-image"
                  style={{
                    backgroundImage: `url(${blog.coverImage || blog.image || '/default-image.jpg'})`
                  }}
                ></div>
                <div className="blog-card-content">
                  <h4 className="blog-card-title">{blog.title || 'Không có tiêu đề'}</h4>
                  <p className="blog-card-summary">
                    {blog.content?.slice(0, 100) || 'Không có nội dung.'}
                  </p>
                  <span
                    className="blog-card-readmore"
                    onClick={() => handleReadMore(blog)}
                  >
                    Đọc tiếp →
                  </span>
                </div>
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
