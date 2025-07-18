import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import axiosInstance from "../../axiosInstance";
import '../assets/CSS/Home.css';
import '../assets/CSS/NotificationDropdown.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [missingDailyLog, setMissingDailyLog] = useState(false);
  // Modal cho tiến trình cai thuốc
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Kiểm tra nhật ký hằng ngày bị thiếu
  useEffect(() => {
    const checkMissingLog = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.post('/api/smoking-logs/check-missing', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMissingDailyLog(res.data === true);
      } catch {
        setMissingDailyLog(false);
      }
    };
    checkMissingLog();
  }, [user]);
  // Fetch notifications for unread dot (on mount and when user changes)
  useEffect(() => {
    const fetchUnread = async () => {
      if (user) {
        try {
          const res = await axiosInstance.get('/api/notifications/me');
          if (Array.isArray(res.data)) {
            const unread = res.data.filter(n => !(n.hasBeenRead || n.isRead || n.read));
            setHasUnread(unread.length > 0);
            setUnreadCount(unread.length);
          } else {
            setHasUnread(false);
            setUnreadCount(0);
          }
        } catch (e) {
          setHasUnread(false);
          setUnreadCount(0);
        }
      } else {
        setHasUnread(false);
        setUnreadCount(0);
      }
    };
    fetchUnread();
  }, [user]);

  // Fetch notifications from API when modal opens
  useEffect(() => {
    const fetchNotifications = async () => {
      if (showNotification && user) {
        try {
          const res = await axiosInstance.get('/api/notifications/me');
          if (Array.isArray(res.data)) {
            setNotifications(res.data.map(n => ({
              userNotificationId: n.userNotificationId,
              title: n.notificationTitle || n.title,
              content: n.content,
              isRead: n.hasBeenRead || n.isRead || n.read,
              createdAt: n.sentAt || n.createdAt,
              sender: n.sender || n.from || n.coachName || n.senderName || n.senderEmail || ''
            })));
            const unread = res.data.filter(n => !(n.hasBeenRead || n.isRead || n.read));
            setHasUnread(unread.length > 0);
            setUnreadCount(unread.length);
          } else {
            setNotifications([]);
            setHasUnread(false);
            setUnreadCount(0);
          }
        } catch (e) {
          setNotifications([]);
          setHasUnread(false);
          setUnreadCount(0);
        }
      }
    };
    fetchNotifications();
  }, [showNotification, user]);

  useEffect(() => {
    if (!user) return;
    const scope = user.scope?.toUpperCase();
    const path = window.location.pathname;
    if ((path === '/' || path === '/home')) {
      if (scope === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (scope === 'COACH') {
        navigate('/coach', { replace: true });
      }
    }
  }, [user, navigate]);

  const isActive = (path) => window.location.pathname === path;

  const handleProgressClick = () => {
    if (!user) setShowProgressModal(true);
    else {
      navigate('/progress');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartJourney = () => {
    setShowProgressModal(false);
    navigate('/login');
  };
  const handleCloseModal = () => {
    setShowProgressModal(false);
  };

  return (
    <>
      {showProgressModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.25)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,padding:'32px 28px',boxShadow:'0 4px 32px rgba(0,0,0,0.15)',minWidth:320,maxWidth:360,textAlign:'center',position:'relative'}}>
            <button onClick={handleCloseModal} style={{position:'absolute',top:12,right:16,border:'none',background:'none',fontSize:22,cursor:'pointer',color:'#888'}}>&times;</button>
            <h3 style={{fontWeight:800,fontSize:'1.2rem',marginBottom:12}}>Bạn chưa đăng nhập</h3>
            <p style={{color:'#555',marginBottom:24}}>Hãy bắt đầu hành trình cai thuốc ngay từ hôm nay để theo dõi tiến trình, nhận hỗ trợ và động lực từ cộng đồng!</p>
            <button onClick={handleStartJourney} style={{background:'#43a047',color:'#fff',fontWeight:700,padding:'10px 32px',border:'none',borderRadius:10,fontSize:'1rem',cursor:'pointer',boxShadow:'0 2px 8px rgba(67,160,71,0.10)'}}>Bắt đầu</button>
          </div>
        </div>
      )}
      <div className="home-header-bar">
        {missingDailyLog && (
          <div style={{background:'#fff3cd',color:'#856404',padding:'8px 16px',borderRadius:8,marginBottom:8,border:'1px solid #ffe082',fontWeight:500}}>
            Bạn chưa khai báo nhật ký hằng ngày hôm nay! Vui lòng vào phần Tiến Trình Cai Thuốc để khai báo.
          </div>
        )}
        <a href="/home" className="home-logo">
          <img src="/src/assets/img1/android-chrome-192x192.png" alt="NoSmoke Logo" className="logo-img" />
          <span className="logo-text">NoSmoke</span>
        </a>
        <div className="home-nav">
          <button className={`nav-btn${isActive('/home') || isActive('/') ? ' active' : ''}`} onClick={() => { navigate('/home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Trang chủ</button>
          <button className={`nav-btn${isActive('/blog') ? ' active' : ''}`} onClick={() => { navigate('/blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Blog</button>
          <button className={`nav-btn${isActive('/ranking') ? ' active' : ''}`} onClick={() => { navigate('/ranking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Bảng xếp hạng</button>
          <button className={`nav-btn${isActive('/about') ? ' active' : ''}`} onClick={() => { navigate('/about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Giới thiệu</button>
          <button className={`nav-btn${isActive('/progress') ? ' active' : ''}`} onClick={handleProgressClick}>Tiến Trình Cai Thuốc</button>
        </div>
        <div className="home-auth-buttons">
          {!user ? (
            <>
              <button className="nav-btn" onClick={() => navigate('/login')}>Đăng Nhập</button>
              <button className="nav-btn" onClick={() => navigate('/register')}>Đăng Ký</button>
            </>
          ) : (
            <>
              <button
                className="nav-btn"
                style={{ background: '#ffe082', color: '#222', fontWeight: 600, marginRight: 8 }}
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/payment');
                }}
              >
                Nâng Cấp
              </button>
              {/* Notification Icon + Dropdown */}
              <div className="notification-dropdown-wrapper" style={{ display: 'inline-block', position: 'relative', marginRight: 8 }}>
                <button
                  className="nav-btn"
                  style={{ position: 'relative', background: 'none', border: 'none' }}
                  onClick={() => setShowNotification((prev) => !prev)}
                  title="Thông báo"
                >
                  <FaBell size={22} color='black' />
                  {unreadCount > 0 && (
                    <span className="notification-badge" style={{
                      background:'red', color:'#fff', fontWeight:700, fontSize:13, minWidth:22, height:22, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', position:'absolute', top:-8, right:-8, boxShadow:'0 2px 8px rgba(255,193,7,0.15)', border:'2px solid #fff', transition:'none', animation:'none'
                    }}>{unreadCount}</span>
                  )}
                </button>
                {showNotification && (
                  <div className="notification-dropdown" style={{position:'absolute',top:40,right:0,minWidth:340,maxWidth:400,background:'#fff',borderRadius:14,boxShadow:'0 8px 32px rgba(44,62,80,0.18)',padding:'0 0 8px 0',zIndex:1000}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px 8px 20px',borderBottom:'1px solid #f0f0f0'}}>
                      <span style={{fontWeight:800,fontSize:'1.1rem',color:'black',letterSpacing:0.5}}>Thông báo</span>
                      <button
                        style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#e53935',fontWeight:700,lineHeight:1}}
                        onClick={() => setShowNotification(false)}
                        title="Đóng thông báo"
                      >×</button>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{padding:'24px 0',textAlign:'center',color:'#888',fontSize:'1rem'}}>Không có thông báo nào.</div>
                    ) : (
                      <ul style={{listStyle:'none',margin:0,padding:0,maxHeight:350,overflowY:'auto'}}>
                        {notifications.map(n => (
                          <li
                            key={n.userNotificationId}
                            style={{
                              background: n.isRead ? '#f8f9fa' : '#fffbe6',
                              borderLeft: n.isRead ? '4px solid #e0e0e0' : '4px solid #ffc107',
                              margin:'0 0 8px 0',
                              padding:'14px 18px 10px 14px',
                              borderRadius:10,
                              boxShadow:'0 2px 8px rgba(44,62,80,0.04)',
                              cursor:'pointer',
                              transition:'background 0.2s',
                              position:'relative',
                              fontFamily:'inherit'
                            }}
                            onClick={async () => {
                              if (!n.isRead) {
                                try {
                                  await axiosInstance.put(`/api/notifications/mark-as-read/${n.userNotificationId}`);
                                  setNotifications(prev => prev.map(item => item.userNotificationId === n.userNotificationId ? { ...item, isRead: true } : item));
                                  setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
                                  setHasUnread(prev => {
                                    return prev && notifications.some(item => item.userNotificationId !== n.userNotificationId && !item.isRead);
                                  });
                                } catch (e) {}
                              }
                            }}
                          >
                            <div style={{fontWeight:700,fontSize:'1.05rem',color:'#222',marginBottom:4}}>{n.title}</div>
                            <div style={{color:'#444',fontSize:'0.97rem',marginBottom:6,whiteSpace:'pre-line'}}>{n.content}</div>
                            <div style={{display:'flex',alignItems:'center',fontSize:'0.93rem',marginTop:2,flexWrap:'wrap'}}>
                              {n.sender && <span style={{color:'navy',fontWeight:600,marginRight:12}}>Từ: {n.sender}</span>}
                              <span style={{color:'#888',fontSize:'0.93rem'}}>{n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}</span>
                              {!n.isRead && <span style={{marginLeft:10,color:'#e53935',fontWeight:600,fontSize:'0.97rem'}}>Chưa đọc</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <div className="user-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  className="nav-btn"
                  style={{ fontWeight: 600, background: 'none', border: 'none', color: '#222', cursor: 'pointer' }}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {user.name || user.email}
                  <span style={{ marginLeft: 6 }}>&#9662;</span>
                </button>
                {showDropdown && (
                  <div className="dropdown-menu custom-dropdown2">
                    <button
                      className="dropdown-item2 profile-btn2"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/profile');
                      }}
                    >
                      <span className="dropdown-icon2" role="img" aria-label="profile">👤</span>
                      Tài khoản
                    </button>
                    <button
                      className="dropdown-item2 logout-btn2"
                      onClick={() => {
                        logout();
                        localStorage.removeItem('token');
                        setShowDropdown(false);
                        setTimeout(() => {
                          window.location.href = '/login';
                        }, 100);
                      }}
                    >
                      <span className="dropdown-icon2" role="img" aria-label="logout">🚪</span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
  
};

export default Header;
