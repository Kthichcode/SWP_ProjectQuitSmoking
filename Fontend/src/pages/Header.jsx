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

  return (
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
        <button className={`nav-btn${isActive('/progress') ? ' active' : ''}`} onClick={() => { navigate('/progress'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Tiến Trình Cai Thuốc</button>
        
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
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              {showNotification && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-title">Thông báo</div>
                  {notifications.length === 0 ? (
                    <div className="notification-dropdown-empty">Không có thông báo nào.</div>
                  ) : (
                    <ul className="notification-dropdown-list">
                      {notifications.map(n => (
                        <li
                          key={n.userNotificationId}
                          className={`notification-dropdown-item${n.isRead ? ' read' : ' unread'}`}
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
                          <div className="notification-dropdown-item-title">{n.title}</div>
                          <div className="notification-dropdown-item-content">{n.content}</div>
                          {n.sender && <div className="notification-dropdown-item-sender">Từ: {n.sender}</div>}
                          <div className="notification-dropdown-item-time">{n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}</div>
                          {!n.isRead && <span className="notification-dropdown-item-unread">Chưa đọc</span>}
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
  );
};

export default Header;
