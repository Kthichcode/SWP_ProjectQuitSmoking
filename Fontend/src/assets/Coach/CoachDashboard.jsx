import React, { useState, useEffect } from 'react';
import MembersBarChart from '../../components/MembersBarChart';
import MembersMonthChart from '../../components/MembersMonthChart';
// Modal hiển thị đánh giá
function ReviewsModal({ open, onClose, reviews }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="modal-content" style={{background:'#fff',padding:24,borderRadius:8,minWidth:350,maxWidth:500,position:'relative'}}>
        <h3>Đánh giá của bạn</h3>
        <button style={{position:'absolute',top:10,right:20}} onClick={onClose}>Đóng</button>
        {(!reviews || reviews.length === 0) ? (
          <p>Chưa có đánh giá nào.</p>
        ) : (
          <ul style={{listStyle:'none',padding:0}}>
            {reviews.map((r, idx) => (
              <li key={r.reviewId || idx} style={{borderBottom:'1px solid #eee',marginBottom:8,paddingBottom:8}}>
                <div><b>Điểm:</b> {r.rating} ⭐</div>
                <div><b>Nội dung:</b> {(!r.comment || r.comment === 'string') ? 'Không có comment' : r.comment}</div>
                <div style={{fontSize:12,color:'#888'}}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : ''}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Modal hiển thị danh sách thành viên
function MembersModal({ open, onClose, members }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:16,minWidth:350,maxWidth:480,position:'relative',boxShadow:'0 8px 32px rgba(0,0,0,0.18)'}}>
        <h3 style={{marginBottom:20,fontWeight:600,fontSize:22,textAlign:'center',color:'#2d6cdf'}}>Danh sách thành viên đang kết nối</h3>
        <button style={{position:'absolute',top:16,right:24,background:'#f5f5f5',border:'none',borderRadius:4,padding:'4px 12px',fontWeight:500,cursor:'pointer',color:'#2d6cdf'}} onClick={onClose}>Đóng</button>
        {(!members || members.length === 0) ? (
          <p style={{textAlign:'center',color:'#888'}}>Chưa có thành viên nào.</p>
        ) : (
          <>
            <ul style={{listStyle:'none',padding:0,margin:0}}>
              {members.map((m, idx) => (
                <li key={m.id || idx} style={{display:'flex',alignItems:'center',gap:12,background:'#f6f8fa',borderRadius:8,padding:'12px 16px',marginBottom:10,boxShadow:'0 1px 4px rgba(44,108,223,0.04)'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'#e3eefd',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,color:'#2d6cdf',fontSize:18}}>
                    {(m.full_name || m.fullName || 'Ẩn danh').charAt(0).toUpperCase()}
                  </div>
                  <div style={{fontSize:17,fontWeight:500,color:'#2d6cdf'}}>{m.full_name || m.fullName || 'Ẩn danh'}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
import './CoachDashboard.css';
import { FaUsers, FaCalendarAlt, FaEnvelope, FaStar, FaTachometerAlt, FaSignOutAlt, FaPenNib, FaUserCircle, FaBell } from 'react-icons/fa';
// Notification Modal for Coach (similar to user)
function NotificationModal({ open, onClose, notifications, onMarkRead }) {
  if (!open) return null;
  return (
    <div className="admin-modal" style={{zIndex: 2000}}>
      <div className="admin-modal-content" style={{maxWidth: 400, minWidth: 320, padding: 24, position: 'relative'}}>
        <button
          className="admin-modal-close"
          style={{position: 'absolute', top: 8, right: 12, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer'}} 
          onClick={onClose}
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
                  if (!n.isRead && onMarkRead) {
                    await onMarkRead(n);
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
  );
}
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../../axiosInstance';

function CoachDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOverview = location.pathname === '/coach' || location.pathname === '/coach/';
  const { user, logout } = useAuth();

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  // Fetch notifications from API when modal opens
  useEffect(() => {
    const fetchNotifications = async () => {
      console.log('[CoachDashboard] user context:', user);
      if (showNotification && user && user.token) {
        try {
          const res = await axiosInstance.get('/api/notifications/me');
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
          console.error('[CoachDashboard] Notification API error:', e?.response?.data || e);
          setNotifications([]);
        }
      } else {
        if (showNotification) {
          console.warn('[CoachDashboard] Không gọi API vì user chưa sẵn sàng:', user);
        }
      }
    };
    fetchNotifications();
  }, [showNotification, user]);

  // State cho dữ liệu dashboard
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    totalQuitPlans: 0,
    totalReviews: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [myMembers, setMyMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  // Hàm lấy danh sách thành viên
  const fetchMyMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await axiosInstance.get('/api/coach-members/my-members');
      if (res.data && Array.isArray(res.data)) {
        setMyMembers(res.data);
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        setMyMembers(res.data.data);
      } else {
        setMyMembers([]);
      }
    } catch (e) {
      setMyMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };
  // Hàm lấy đánh giá của tôi
  const fetchMyReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await axiosInstance.get('/api/coach-reviews/my-reviews-coach');
      if (res.data && res.data.data) {
        setMyReviews(res.data.data);
      } else {
        setMyReviews([]);
      }
    } catch (e) {
      setMyReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (user && isOverview) {
      fetchDashboardData();
    }
  }, [user, isOverview]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Gọi API mới để lấy dữ liệu dashboard
      const response = await axiosInstance.get('/api/coach-dashboard');
      if (response.data && response.data.data) {
        setDashboardData(response.data.data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback với dữ liệu mẫu nếu API chưa có
      setDashboardData({
        totalMembers: 1,
        totalQuitPlans: 0,
        totalReviews: 1,
        averageRating: 4
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(); // reset user context
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Coach Dashboard</h3>
        <ul>
          <li>
            <NavLink to="/coach" end className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaTachometerAlt style={{marginRight:8}}/> Tổng quan
            </NavLink>
          </li>
          <li>
            <NavLink to="/coach/users" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaUsers style={{marginRight:8}}/> Người dùng
            </NavLink>
          </li>
          <li>
            <NavLink to="/coach/plans" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaCalendarAlt style={{marginRight:8}}/> Kế hoạch cai thuốc
            </NavLink>
          </li>
          <li>
            <NavLink to="/coach/messages" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaEnvelope style={{marginRight:8}}/> Tin nhắn
            </NavLink>
          </li>
          <li>
            <NavLink to="/coach/blog" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaPenNib style={{marginRight:8}}/> Viết blog
            </NavLink>
          </li>
          <li>
            <NavLink to="/coach/profile" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaUserCircle style={{marginRight:8}}/> Hồ sơ cá nhân
            </NavLink>
          </li>
          <li>
            <button className="sidebar-logout" onClick={handleLogout}>
              <FaSignOutAlt style={{marginRight:8}}/> Đăng xuất
            </button>
          </li>
          {/* Notification Icon */}
          <li style={{marginTop: 16, position: 'relative'}}>
            <button
              className="sidebar-link"
              style={{background: 'none', border: 'none', display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative'}}
              onClick={() => setShowNotification(true)}
              title="Thông báo"
            >
              <FaBell size={20} color="#2d6cdf" style={{marginRight:8}} />
              Thông báo
              {notifications.some(n => !n.isRead) && (
                <span style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
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
          </li>
        </ul>
      </div>
      <div className="main-content">
        {/* Notification Modal */}
        <NotificationModal
          open={showNotification}
          onClose={() => setShowNotification(false)}
          notifications={notifications}
          onMarkRead={async (n) => {
            try {
              await axiosInstance.put(`api/notifications/mark-as-read/${n.userNotificationId}`);
              setNotifications(prev => prev.map(item => item.userNotificationId === n.userNotificationId ? { ...item, isRead: true } : item));
            } catch (e) {}
          }}
        />
        {isOverview ? (
          <>
            {loading ? (
              <div className="loading-state">
                <p>Đang tải dữ liệu dashboard...</p>
              </div>
            ) : (
              <>
                <div className="welcome-section">
                  <h2>Chào mừng bạn trở lại bảng điều khiển huấn luyện viên, {user?.fullName || 'Coach'}!</h2>
                  <div className="rating">
                    <FaStar />
                    <span>{dashboardData.averageRating}</span>
                  </div>
                </div>
                <div className="cards-container">
                  <div className="card" style={{cursor:'pointer'}} onClick={() => { setShowMembers(true); fetchMyMembers(); }}>
                    <FaUsers />
                    <h3>{dashboardData.totalMembers}</h3>
                    <p>Thành viên</p>
                  </div>
                  <div className="card">
                    <FaCalendarAlt />
                    <h3>{dashboardData.totalQuitPlans}</h3>
                    <p>Kế hoạch cai thuốc</p>
                  </div>
                  <div className="card" style={{cursor:'pointer'}} onClick={() => { setShowReviews(true); fetchMyReviews(); }}>
                    <FaEnvelope />
                    <h3>{dashboardData.totalReviews}</h3>
                    <p>Đánh giá</p>
                  </div>
                  <ReviewsModal open={showReviews} onClose={() => setShowReviews(false)} reviews={myReviews} />
                  <MembersModal open={showMembers} onClose={() => setShowMembers(false)} members={myMembers} />
                </div>
                {/* Biểu đồ thành viên trong tháng với Ant Design Plots */}
                <div style={{marginTop: 36, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(44,108,223,0.06)', padding: 24}}>
                  <h3 style={{marginBottom: 16, color: '#2d6cdf', fontWeight: 600}}>Số thành viên mới theo tháng</h3>
                  <MembersMonthChart data={getMembersByMonth(myMembers)} />
                  <div style={{fontSize:13, color:'#888', marginTop:8}}>Biểu đồ này dựa trên danh sách thành viên bạn đã xem gần nhất.</div>
                </div>
              </>
            )}
          </>
        ) : <Outlet />}
      </div>
    </div>
  );
}

// Helper: Đếm số thành viên theo tháng (dựa vào trường createdAt hoặc joinDate)
function getMembersByMonth(members) {
  if (!Array.isArray(members)) return [];
  const counts = {};
  members.forEach(function(m) {
    let dateStr = m.createdAt || m.joinDate || m.created_at;
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (isNaN(d)) return;
    const key = (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getFullYear();
    counts[key] = (counts[key] || 0) + 1;
  });
  // Sắp xếp theo thời gian tăng dần
  return Object.entries(counts)
    .sort(function(a, b) {
      const am = parseInt(a[0].split('/')[0], 10);
      const ay = parseInt(a[0].split('/')[1], 10);
      const bm = parseInt(b[0].split('/')[0], 10);
      const by = parseInt(b[0].split('/')[1], 10);
      return ay !== by ? ay - by : am - bm;
    })
    .map(function(entry) {
      return { month: entry[0], count: entry[1] };
    });
}

export default CoachDashboard;
