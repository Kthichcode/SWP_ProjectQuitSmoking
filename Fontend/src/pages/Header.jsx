import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import axiosInstance from "../../axiosInstance";
import '../assets/CSS/Home.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  // Fetch notifications from API when modal opens
  useEffect(() => {
    const fetchNotifications = async () => {
      if (showNotification && user) {
        try {
          const res = await axiosInstance.get('/api/notifications/me');
          // API trả về mảng UserNotificationResponse
          if (Array.isArray(res.data)) {
            setNotifications(res.data.map(n => ({
              userNotificationId: n.userNotificationId,
              title: n.notificationTitle || n.title,
              content: n.content,
              isRead: n.hasBeenRead || n.isRead || n.read,
              createdAt: n.sentAt || n.createdAt
            })));
          } else {
            setNotifications([]);
          }
        } catch (e) {
          setNotifications([]);
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
        {/* Notification Icon */}
        {user && (
          <button
            className="nav-btn"
            style={{ position: 'relative', background: 'none', border: 'none', marginLeft: 8 }}
            onClick={() => setShowNotification(true)}
            title="Thông báo"
          >
            <FaBell size={22} color="#222" />
            {notifications.some(n => !n.isRead) && (
              <span style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 10,
                height: 10,
                background: '#ff5252',
                borderRadius: '50%',
                display: 'inline-block',
                border: '2px solid #fff',
                boxShadow: '0 0 2px #0003'
              }}></span>
            )}
          </button>
        )}
      </div>
      {/* Notification Modal */}
      {showNotification && (
        <div className="admin-modal" style={{zIndex: 2000}}>
          <div className="admin-modal-content" style={{maxWidth: 400, minWidth: 320, padding: 24, position: 'relative'}}>
            <button
              className="admin-modal-close"
              style={{position: 'absolute', top: 8, right: 12, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer'}} 
              onClick={() => setShowNotification(false)}
              type="button"
            >×</button>
            <h3 style={{marginBottom: 16, fontWeight: 700, fontSize: 20}}>Thông báo</h3>
            {notifications.length === 0 ? (
              <div style={{color: '#888'}}>Không có thông báo nào.</div>
            ) : (
              <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                {notifications.map(n => (
                  <li
                    key={n.userNotificationId}
                    style={{marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8, background: n.isRead ? '#f6f6f6' : '#fffbe7', cursor: n.isRead ? 'default' : 'pointer'}}
                    onClick={async () => {
                      if (!n.isRead) {
                        try {
                          await axiosInstance.put(`/api/notifications/mark-as-read/${n.userNotificationId}`);
                          setNotifications(prev => prev.map(item => item.userNotificationId === n.userNotificationId ? { ...item, isRead: true } : item));
                        } catch (e) {
                          // Xử lý lỗi nếu cần
                        }
                      }
                    }}
                  >
                    <div style={{fontWeight: 600, fontSize: 16}}>{n.title}</div>
                    <div style={{color: '#444', fontSize: 14}}>{n.content}</div>
                    <div style={{color: '#888', fontSize: 12, marginTop: 2}}>{n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}</div>
                    {!n.isRead && <span style={{color:'#f59e42', fontSize:12, fontWeight:600}}>Chưa đọc</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

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
