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
    fetch('http://localhost:5175/api/member-badge/ranking')
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
          <div className="home-ranking-list" style={{ 
            display: 'flex', 
            gap: '40px', 
            justifyContent: 'center', 
            alignItems: 'flex-start',
            flexWrap: 'nowrap',
            marginBottom: 24,
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto 24px auto',
            padding: '0 40px',
            boxSizing: 'border-box'
          }}>
            {ranking.slice(0, 3).map((rankUser, idx) => {
              // Xử lý tên hiển thị giống Ranking.jsx
              let displayName = rankUser.fullName;
              if (!displayName && rankUser.email) {
                displayName = rankUser.email.replace(/@gmail\.com$/, '');
              }
              
              // Kiểm tra xem có phải user hiện tại không
              const currentUserId = user?.userId || user?.id;
              const isCurrentUser = currentUserId && currentUserId.toString() === rankUser.memberId?.toString();
              
              return (
                <div
                  key={rankUser.memberId}
                  className={`home-userCard top${idx + 1}`}
                  style={{
                    background: idx === 0 ? 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)' : 
                               idx === 1 ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' : 
                               'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
                    border: idx === 0 ? '2px solid #ffc107' : 
                           idx === 1 ? '2px solid #2196f3' : 
                           '2px solid #d1aaff',
                    borderRadius: '16px',
                    padding: '60px',
                    textAlign: 'center',
                    width: '220px',
                    height: '320px',
                    flex: '0 0 220px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    animation: idx < 3 ? `pulse-glow-${idx + 1} 2s infinite` : 'none',
                    transform: 'translateY(0)',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: idx === 0 ? '0 4px 20px rgba(255, 193, 7, 0.2)' : 
                              idx === 1 ? '0 4px 20px rgba(33, 150, 243, 0.2)' : 
                              '0 4px 20px rgba(255, 152, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = idx === 0 ? '0 12px 32px rgba(255, 193, 7, 0.3)' : 
                                                    idx === 1 ? '0 12px 32px rgba(33, 150, 243, 0.3)' : 
                                                    '0 12px 32px rgba(255, 152, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onClick={() => navigate('/ranking')}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1' }}>
                    <div className="emoji" style={{ fontSize: '40px', marginBottom: '8px' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </div>
                    {rankUser.avatarUrl ? (
                      <img 
                        src={rankUser.avatarUrl} 
                        alt="avatar" 
                        style={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: '50%', 
                          objectFit: 'cover', 
                          marginBottom: 8,
                          border: '2px solid #fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }} 
                      />
                    ) : (
                      <div 
                        className="avatar-placeholder" 
                        style={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: '50%', 
                          background: idx === 0 ? '#ffc107' : idx === 1 ? '#2196f3' : '#ff9800', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: 20, 
                          fontWeight: 'bold',
                          color: '#fff',
                          marginBottom: 8,
                          border: '2px solid #fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {(displayName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80px', justifyContent: 'center' }}>
                    <h3 style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '1rem', 
                      fontWeight: '600',
                      color: idx === 0 ? '#f57c00' : idx === 1 ? '#1976d2' : '#e65100',
                      lineHeight: '1.2',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '180px'
                    }}>
                      {displayName}
                    </h3>
                    {isCurrentUser && (
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#2e7dff', 
                        fontWeight: 'bold', 
                        marginBottom: '4px' 
                      }}>
                        (Bạn)
                      </div>
                    )}
                    <p style={{ 
                      margin: '4px 0 0', 
                      fontSize: '0.9rem', 
                      color: idx === 0 ? '#e65100' : idx === 1 ? '#0d47a1' : '#bf360c',
                      fontWeight: '500'
                    }}>
                      Điểm: {rankUser.totalScore}
                    </p>
                  </div>
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
