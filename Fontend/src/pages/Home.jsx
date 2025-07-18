import React, { useEffect, useState } from 'react';
import { MdTimeline } from 'react-icons/md';
import { FaHeartbeat } from 'react-icons/fa';
import { BiTimeFive } from 'react-icons/bi';
import '../assets/CSS/Home.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../../axiosInstance';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [rankingError, setRankingError] = useState('');
  // ...existing code...

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
    axiosInstance.get('/api/blog/getAllBlog')
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

  // ...đã xóa kiểm tra membership...

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingBlogId, setPendingBlogId] = useState(null);
  const handleReadMore = (blog) => {
    const blogId = blog.id || blog._id;
    if (!user) {
      setShowLoginModal(true);
      setPendingBlogId(blogId);
    } else if (blogId) {
      navigate(`/blog/${blogId}`);
    }
  };

  const handleStartJourney = () => {
    setShowLoginModal(false);
    navigate('/login');
  };
  const handleCloseModal = () => {
    setShowLoginModal(false);
    setPendingBlogId(null);
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
      {/* Modal thông báo chưa đăng nhập */}
      {showLoginModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.25)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,padding:'32px 28px',boxShadow:'0 4px 32px rgba(0,0,0,0.15)',minWidth:320,maxWidth:360,textAlign:'center',position:'relative'}}>
            <button onClick={handleCloseModal} style={{position:'absolute',top:12,right:16,border:'none',background:'none',fontSize:22,cursor:'pointer',color:'#888'}}>&times;</button>
            <h3 style={{fontWeight:800,fontSize:'1.2rem',marginBottom:12}}>Bạn chưa đăng nhập</h3>
            <p style={{color:'#555',marginBottom:24}}>Hãy bắt đầu hành trình của bạn ngay bây giờ để đọc các bài viết, chia sẻ kinh nghiệm và nhận hỗ trợ từ các tư vấn viên!</p>
            <button onClick={handleStartJourney} style={{background:'#43a047',color:'#fff',fontWeight:700,padding:'10px 32px',border:'none',borderRadius:10,fontSize:'1rem',cursor:'pointer',boxShadow:'0 2px 8px rgba(67,160,71,0.10)'}}>Bắt đầu</button>
          </div>
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
            <p>Nhiều người đã tham gia và nhận được sự hỗ trợ từ nền tảng của chúng tôi.</p>
          </div>
        </div>
      </div>
      <div className="why-nosmoke">
        <h2>Tại sao nên chọn NoSmoke?</h2>
        <p>Nền tảng của chúng tôi cung cấp những công cụ và hỗ trợ thiết thực để giúp bạn từng bước cai nghiện thuốc lá thành công.</p>
        <div className="features">
          {[
            {
              icon: <MdTimeline size={48} color="#1976d2" style={{ marginBottom: 12 }} />,
              title: 'Theo dõi tiến trình',
              desc: 'Ghi lại và xem quá trình cai nghiện với các thống kê trực quan.'
            },
            {
              icon: <FaHeartbeat size={48} color="#d81b60" style={{ marginBottom: 12 }} />,
              title: 'Cải thiện sức khỏe',
              desc: 'Xem những lợi ích sức khỏe và thay đổi tích cực sau khi bỏ thuốc.'
            },
            {
              icon: <BiTimeFive size={48} color="#43a047" style={{ marginBottom: 12 }} />,
              title: 'Đếm thời gian thực',
              desc: 'Theo dõi chính xác thời gian bạn đã không hút thuốc và đạt được các cột mốc.'
            }
          ].map(f => (
            <div className="feature-box" key={f.title}>
              {f.icon}
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
            {ranking.slice(0, 3).map((user, i) => {
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
          <button className="white-btn" style={{ fontWeight: 600, fontSize: '1rem', padding: '10px 28px', borderRadius: 12, boxShadow: '0 2px 8px rgba(44,62,80,0.08)' }} onClick={() => navigate('/ranking')}>
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
              <div className="blog-card" key={blog.id || blog._id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div
                  className="blog-card-image"
                  style={{
                    backgroundImage: `url(${blog.coverImage || blog.image || '/default-image.jpg'})`,
                    cursor: 'pointer'
                  }}
                  onClick={() => handleReadMore(blog)}
                  title="Xem chi tiết bài viết"
                ></div>
                <div className="blog-card-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4
                    className="blog-card-title"
                    style={{ cursor: 'pointer', marginBottom: 6, transition: 'text-decoration 0.15s' }}
                    onClick={() => handleReadMore(blog)}
                    title="Xem chi tiết bài viết"
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {blog.title || 'Không có tiêu đề'}
                  </h4>
                  <p className="blog-card-summary" style={{ marginBottom: 'auto' }}>
                    {(() => {
                      const content = blog.content || '';
                      if (!content) return 'Không có nội dung.';
                      if (content.length <= 100) return content;
                      let preview = content.slice(0, 100);
                      const lastSpace = preview.lastIndexOf(' ');
                      if (lastSpace > 0) preview = preview.slice(0, lastSpace);
                      return preview + '...';
                    })()}
                  </p>
                  <span
                    className="blog-card-readmore"
                    onClick={() => handleReadMore(blog)}
                    style={{ alignSelf: 'flex-end', marginTop: 16, cursor: 'pointer' }}
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
        <button className="white-btn" onClick={() => navigate('/blog')}>
          Xem tất cả bài viết
        </button>
      </div>
    </div>
  );
}

export default Home;
