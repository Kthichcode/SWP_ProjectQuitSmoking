import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../../axiosInstance';
import { FaUsers, FaCalendarAlt, FaEnvelope, FaStar, FaTachometerAlt, FaSignOutAlt, FaPenNib, FaUserCircle, FaBell } from 'react-icons/fa';
import MembersBarChart from '../../components/MembersBarChart';
import MembersMonthChart from '../../components/MembersMonthChart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts';
import './CoachDashboard.css';
import './CoachModals.css';

// Modal gửi thông báo cho member
// Modal gửi thông báo cho member (tạo notification mới trước khi gửi)
function SendNotificationModal({ open, onClose, members, onSend, loading, loadingMembers }) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [personalizedReason, setPersonalizedReason] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: tạo notification, 2: gửi cho member
  const [createdNotificationId, setCreatedNotificationId] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedUserId("");
      setPersonalizedReason("");
      setTitle("");
      setContent("");
      setError("");
      setStep(1);
      setCreatedNotificationId(null);
      setCreating(false);
    }
  }, [open]);

  // Bước 1: Tạo notification mới
  const handleCreateNotification = async () => {
    if (!title || !content) {
      setError("Vui lòng nhập tiêu đề và nội dung thông báo.");
      return;
    }
    setError("");
    setCreating(true);
    try {
      const res = await axiosInstance.post('/api/notifications', {
        title,
        content
      });
      if (res.data && res.data.notificationId) {
        setCreatedNotificationId(res.data.notificationId);
        setStep(2);
      } else if (res.data && res.data.id) {
        setCreatedNotificationId(res.data.id);
        setStep(2);
      } else {
        setError("Không lấy được notificationId từ phản hồi API.");
      }
    } catch (e) {
      setError("Tạo thông báo thất bại: " + (e?.response?.data?.message || e?.message || ''));
      console.error('[SendNotificationModal] Lỗi tạo notification:', e?.response?.data || e);
    } finally {
      setCreating(false);
    }
  };

  // Bước 2: Gửi notification cho member
  const handleSend = () => {
    if (!selectedUserId || !personalizedReason) {
      setError("Vui lòng chọn member và nhập lý do cá nhân hóa.");
      return;
    }
    if (!createdNotificationId || isNaN(Number(createdNotificationId))) {
      setError("Không có notificationId hợp lệ (null hoặc không phải số).");
      return;
    }
    if (!selectedUserId || isNaN(Number(selectedUserId))) {
      setError("Không có userId hợp lệ (null hoặc không phải số).");
      return;
    }
    // Log giá trị gửi đi để debug lỗi id null
    console.log('Gửi notification:', {
      userId: selectedUserId,
      notificationId: createdNotificationId,
      personalizedReason
    });
    setError("");
    onSend({
      userId: Number(selectedUserId),
      notificationId: Number(createdNotificationId),
      personalizedReason
    });
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:2001,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:16,minWidth:350,maxWidth:420,position:'relative',boxShadow:'0 8px 32px rgba(0,0,0,0.18)'}}>
        <h3 style={{marginBottom:16,fontWeight:600,fontSize:20}}>Gửi thông báo cho member</h3>
        <button style={{position:'absolute',top:16,right:24,background:'#f5f5f5',border:'none',borderRadius:4,padding:'4px 12px',fontWeight:500,cursor:'pointer',color:'#2d6cdf'}} onClick={onClose}>Đóng</button>
        {step === 1 ? (
          <>
            <div style={{marginBottom:12}}>
              <label>Tiêu đề thông báo:</label><br/>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={{width:'100%',padding:6,borderRadius:4}}/>
            </div>
            <div style={{marginBottom:12}}>
              <label>Nội dung thông báo:</label><br/>
              <textarea value={content} onChange={e => setContent(e.target.value)} style={{width:'100%',padding:6,borderRadius:4,minHeight:60, color:'#333', background:'white'}}/>
            </div>
            {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
            <button onClick={handleCreateNotification} disabled={creating} style={{background:'#2d6cdf',color:'#fff',padding:'8px 20px',border:'none',borderRadius:6,fontWeight:600,cursor:'pointer'}}>
              {creating ? 'Đang tạo...' : 'Tạo thông báo'}
            </button>
          </>
        ) : (
          <>
            <div style={{marginBottom:12}}>
              <label>Chọn member để gửi:</label><br/>
              {loadingMembers ? (
                <div style={{color:'#888',margin:'8px 0'}}>Đang tải danh sách thành viên...</div>
              ) : (!members || members.length === 0) ? (
                <div style={{color: '#888', margin: '8px 0'}}>Chưa có thành viên nào để gửi thông báo.</div>
              ) : (
                <select 
                  value={selectedUserId} 
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedUserId(val ? String(val) : "");
                  }} 
                  style={{width:'100%',padding:6,borderRadius:4}}
                >
                  <option value="">-- Chọn member --</option>
                  {members
                    .filter(m => m.memberId !== undefined && m.memberId !== null && !isNaN(Number(m.memberId)))
                    .map(m => {
                      // Lấy tên từ fullName, fallback sang username nếu không có
                      let name = m.fullName || m.username || 'Ẩn danh';
                      let idStr = String(m.memberId);
                      return (
                        <option key={idStr} value={idStr}>
                          {name} (ID: {idStr})
                        </option>
                      );
                    })}
                </select>
              )}
            </div>
            <div style={{marginBottom:12}}>
              <label>Lý do cá nhân hóa:</label><br/>
              <input type="text" value={personalizedReason} onChange={e => setPersonalizedReason(e.target.value)} style={{width:'100%',padding:6,borderRadius:4}}/>
            </div>
            {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
            <button 
              onClick={handleSend} 
              disabled={loading || !selectedUserId || isNaN(Number(selectedUserId))}
              style={{
                background: loading || !selectedUserId || isNaN(Number(selectedUserId)) ? '#b0c4de' : '#2d6cdf',
                color:'#fff',
                padding:'8px 20px',
                border:'none',
                borderRadius:6,
                fontWeight:600,
                cursor: loading || !selectedUserId || isNaN(Number(selectedUserId)) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Modal hiển thị đánh giá
function ReviewsModal({ open, onClose, reviews }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="modal-content" style={{background:'#fff',padding:24,borderRadius:12,minWidth:350,maxWidth:600,position:'relative',boxShadow:'0 8px 32px rgba(44,108,223,0.10)'}}>
        <h3 style={{marginBottom: '8px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px'}}>Đánh giá của bạn</h3>
        <button style={{position:'absolute',top:10,right:20,background:'#f5f5f5',border:'none',borderRadius:4,padding:'4px 12px',fontWeight:500,cursor:'pointer',color:'#2d6cdf'}} onClick={onClose}>Đóng</button>
        {(!reviews || reviews.length === 0) ? (
          <div style={{textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '8px', color: '#6b7280'}}>
            <div style={{fontSize: '3rem', marginBottom: '12px'}}>📝</div>
            <p>Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div style={{maxHeight: '400px', overflowY: 'auto'}}>
            {reviews.map((review, index) => (
              <div key={review.reviewId || index} style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px'}}>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
                      <div style={{display: 'flex', gap: '2px'}}>
                        {Array.from({length: 5}, (_, i) => (
                          <span key={i} style={{color: i < review.rating ? '#f59e0b' : '#e5e7eb', fontSize: 16}}>★</span>
                        ))}
                      </div>
                      <span style={{fontWeight: '600', color: '#374151'}}>
                        {review.rating}/5 sao
                      </span>
                    </div>
                    <div style={{fontSize: '0.85rem', color: '#6b7280'}}>
                      Bởi: Ẩn danh • {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: '#f9fafb',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.95rem',
                  color: '#374151',
                  lineHeight: '1.5'
                }}>
                  {review.comment && review.comment.trim() !== ''
                    ? `"${review.comment}"`
                    : <span style={{color:'#9ca3af'}}>Không có nhận xét nào.</span>
                  }
                </div>
              </div>
            ))}
          </div>
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
        <h3 style={{marginBottom:20,fontWeight:600,fontSize:22,textAlign:'center',color:'#22c55e'}}>Danh sách thành viên đang kết nối</h3>
        <button style={{position:'absolute',top:16,right:24,background:'#f5f5f5',border:'none',borderRadius:4,padding:'4px 12px',fontWeight:500,cursor:'pointer',color:'#22c55e'}} onClick={onClose}>Đóng</button>
        {(!members || members.length === 0) ? (
          <p style={{textAlign:'center',color:'#888'}}>Chưa có thành viên nào.</p>
        ) : (
          <>
            <ul style={{listStyle:'none',padding:0,margin:0}}>
              {members.map((m, idx) => {
                // Ưu tiên fullName, username, email, cuối cùng mới Ẩn danh
                const name = m.fullName || m.full_name || m.username || m.email || 'Ẩn danh';
                const firstLetter = name.charAt(0).toUpperCase();
                return (
                  <li key={m.id || m.memberId || idx} style={{display:'flex',alignItems:'center',gap:12,background:'#f6f8fa',borderRadius:8,padding:'12px 16px',marginBottom:10,boxShadow:'0 1px 4px #22c55e11'}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'#e5f9ee',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,color:'#22c55e',fontSize:18,flexShrink:0}}>
                      {firstLetter}
                    </div>
                    <span style={{fontSize:17,fontWeight:500,color:'#22c55e',marginLeft:0,whiteSpace:'nowrap',display:'inline-block'}}>{name}</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// Notification Modal for Coach (similar to user)
function NotificationModal({ open, onClose, notifications, onMarkRead }) {
  if (!open) return null;
  return (
    <div className="coach-notification-modal">
      <div className="coach-notification-content">
        <button
          className="coach-notification-close"
          onClick={onClose}
          type="button"
        >×</button>
        <div className="coach-notification-header">
          <h3 className="coach-notification-title">
            <FaBell />
            Thông báo
          </h3>
        </div>
        {notifications.length === 0 ? (
          <div className="coach-notification-empty">
            <div className="coach-notification-empty-icon">🔔</div>
            <p>Không có thông báo nào.</p>
          </div>
        ) : (
          <ul className="coach-notification-list">
            {notifications.map(n => {
              // Determine sender: if createdBy/sender is 'admin' (case-insensitive) or empty, show 'Admin'
              let sender = n.createdBy || n.sender || '';
              if (!sender || /admin/i.test(sender) || sender === 'system') {
                sender = 'Admin';
              }
              // fallback: if still empty, show 'Hệ thống';
              if (!sender || sender.trim() === '') sender = 'Hệ thống';
              
              return (
                <li
                  key={n.userNotificationId}
                  className={`coach-notification-item ${n.isRead ? 'read' : 'unread'}`}
                  onClick={async () => {
                    if (!n.isRead && onMarkRead) {
                      await onMarkRead(n);
                    }
                  }}
                >
                  <div className="coach-notification-item-header">
                    <h4 className="coach-notification-item-title">{n.title}</h4>
                    {!n.isRead && <span className="coach-notification-unread-badge">Mới</span>}
                  </div>
                  <div className="coach-notification-item-content">{n.content}</div>
                  <div className="coach-notification-item-meta">
                    <span className="coach-notification-sender">Từ: {sender}</span>
                    <span className="coach-notification-time">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN', {hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'}) : ''}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function CoachDashboard() {
  // State cho modal gửi thông báo
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState(false);
  // State cho danh sách member dùng cho gửi thông báo (luôn fetch mới khi mở modal)
  const [sendMembers, setSendMembers] = useState([]);
  const [loadingSendMembers, setLoadingSendMembers] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isOverview = location.pathname === '/coach' || location.pathname === '/coach/';
  const { user, logout } = useAuth();

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count (on mount and when user changes)
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user && user.token) {
        try {
          const res = await axiosInstance.get('/api/notifications/me');
          if (Array.isArray(res.data)) {
            const unreadNotifications = res.data.filter(n => !(n.hasBeenRead || n.isRead || n.read));
            setUnreadCount(unreadNotifications.length);
          } else {
            setUnreadCount(0);
          }
        } catch (e) {
          setUnreadCount(0);
        }
      } else {
        setUnreadCount(0);
      }
    };
    
    fetchUnreadCount();
  }, [user]);

  // Fetch notifications from API when modal opens
  useEffect(() => {
    const fetchNotifications = async () => {
      if (showNotification && user && user.token) {
        try {
          const res = await axiosInstance.get('/api/notifications/me');
          if (Array.isArray(res.data)) {
            const mappedNotifications = res.data.map(n => ({
              userNotificationId: n.userNotificationId,
              title: n.notificationTitle || n.title,
              content: n.content,
              isRead: n.hasBeenRead || n.isRead || n.read,
              createdAt: n.sentAt || n.createdAt,
              createdBy: n.createdBy || n.sender
            }));
            setNotifications(mappedNotifications);
            // Cập nhật unreadCount sau khi load thông báo
            setUnreadCount(mappedNotifications.filter(n => !n.isRead).length);
          } else {
            setNotifications([]);
            setUnreadCount(0);
          }
        } catch (e) {
          console.error('Lỗi tải thông báo:', e);
          setNotifications([]);
          setUnreadCount(0);
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
  // State cho doanh thu tháng hiện tại của coach
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState({ totalRevenue: 0, totalTransactions: 0, period: null });
  const [loadingMonthRevenue, setLoadingMonthRevenue] = useState(false);
  // State cho doanh thu năm hiện tại của coach
  const [currentYearRevenue, setCurrentYearRevenue] = useState({ totalRevenue: 0, totalTransactions: 0, year: null });
  const [loadingYearRevenue, setLoadingYearRevenue] = useState(false);
  // State cho dữ liệu biểu đồ doanh thu 12 tháng
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [loadingRevenueChart, setLoadingRevenueChart] = useState(false);
  // Hàm lấy doanh thu tháng hiện tại
  const fetchCurrentMonthRevenue = async () => {
    if (!user || !user.userId) return;
    setLoadingMonthRevenue(true);
    try {
      const res = await axiosInstance.get(`/api/revenue/coach/current-month?coachId=${user.userId}`);
      if (res.data?.data) {
        setCurrentMonthRevenue(res.data.data);
      } else {
        setCurrentMonthRevenue({ totalRevenue: 0, totalTransactions: 0, period: null });
      }
    } catch {
      setCurrentMonthRevenue({ totalRevenue: 0, totalTransactions: 0, period: null });
    } finally {
      setLoadingMonthRevenue(false);
    }
  };
  // Hàm lấy doanh thu năm hiện tại
  const fetchCurrentYearRevenue = async () => {
    if (!user || !user.userId) return;
    setLoadingYearRevenue(true);
    try {
      const res = await axiosInstance.get(`/api/revenue/coach/current-year?coachId=${user.userId}`);
      if (res.data?.data) {
        setCurrentYearRevenue(res.data.data);
      } else {
        setCurrentYearRevenue({ totalRevenue: 0, totalTransactions: 0, year: null });
      }
    } catch {
      setCurrentYearRevenue({ totalRevenue: 0, totalTransactions: 0, year: null });
    } finally {
      setLoadingYearRevenue(false);
    }
  };
  // Hàm lấy dữ liệu biểu đồ doanh thu 12 tháng cho coach
  const fetchRevenueChart = async () => {
    if (!user || !user.userId) return;
    setLoadingRevenueChart(true);
    try {
      const res = await axiosInstance.get(`/api/revenue/coach/chart?months=12&coachId=${user.userId}`);
      if (res.data?.data?.monthlyData && Array.isArray(res.data.data.monthlyData)) {
        setRevenueChartData(res.data.data.monthlyData);
      } else {
        setRevenueChartData([]);
      }
    } catch {
      setRevenueChartData([]);
    } finally {
      setLoadingRevenueChart(false);
    }
  };

  // Hàm format số cho hiển thị VND
  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString('vi-VN');
  };

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

  // Hàm gửi thông báo cho member
  const handleSendNotification = async (body) => {
    setSending(true);
    try {
      await axiosInstance.post('/api/notifications/send-to-member', body);
      alert('Gửi thông báo thành công!');
      setShowSendModal(false);
    } catch (e) {
      alert('Gửi thông báo thất bại!');
      // Log lỗi chi tiết ra console để debug
      if (e && e.response) {
        console.error('Lỗi gửi thông báo:', e.response.data);
      } else {
        console.error('Lỗi gửi thông báo:', e);
      }
    } finally {
      setSending(false);
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
      fetchCurrentMonthRevenue();
      fetchCurrentYearRevenue();
      fetchRevenueChart();
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
        <h3>Huấn luyện viên</h3>
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
          {/* Notification Icon */}
          <li>
            <button
              className={`sidebar-link${showNotification ? ' active' : ''}`}
              style={{width: '100%', background: showNotification ? '#22c55e' : 'none', color: '#222', border: 'none', display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative', fontWeight: 500, fontSize: '1rem', padding: '12px 20px', borderRadius: '10px', marginBottom: '8px', transition: 'background 0.2s, color 0.2s'}}
              onClick={e => { e.preventDefault?.(); setShowNotification(true); }}
              onMouseEnter={e => e.currentTarget.classList.add('active')}
              onMouseLeave={e => { if (!showNotification) e.currentTarget.classList.remove('active'); }}
              title="Thông báo"
              tabIndex={0}
              type="button"
            >
              <FaBell style={{marginRight:12, fontSize:'1.2em'}} />
              Thông báo
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  minWidth: 18,
                  height: 18,
                  background: '#ff5252',
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: '2px solid #fff',
                  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                  padding: '0 4px'
                }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
          </li>
          <li>
            <button className="sidebar-logout" onClick={handleLogout}>
              <FaSignOutAlt style={{marginRight:8}}/> Đăng xuất
            </button>
          </li>
          
        </ul>
      </div>
      <div className="main-content">
        {/* Modal gửi thông báo cho member */}
        <SendNotificationModal
          open={showSendModal}
          onClose={() => setShowSendModal(false)}
          members={sendMembers}
          onSend={handleSendNotification}
          loading={sending}
          loadingMembers={loadingSendMembers}
        />
        {/* Notification Modal */}
        <NotificationModal
          open={showNotification}
          onClose={() => setShowNotification(false)}
          notifications={notifications}
          onMarkRead={async (n) => {
            try {
              await axiosInstance.put(`api/notifications/mark-as-read/${n.userNotificationId}`);
              // Cập nhật notifications state
              setNotifications(prev => prev.map(item => item.userNotificationId === n.userNotificationId ? { ...item, isRead: true } : item));
              // Cập nhật unreadCount state - giảm đi 1 khi đánh dấu đã đọc
              setNotifications(prev => {
                const updatedNotifications = prev.map(item => item.userNotificationId === n.userNotificationId ? { ...item, isRead: true } : item);
                setUnreadCount(updatedNotifications.filter(item => !item.isRead).length);
                return updatedNotifications;
              });
            } catch (e) {
              console.error('Lỗi đánh dấu thông báo đã đọc:', e);
            }
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
                  <div className="welcome-title-group">
                    <h2>Chào mừng bạn trở lại bảng điều khiển huấn luyện viên!</h2>
                    <div className="rating">
                      <FaStar />
                      <span>{dashboardData.averageRating}</span>
                    </div>
                  </div>
                  <button
                    className="send-notification-btn"
                    onClick={async () => {
                      setShowSendModal(true);
                      setLoadingSendMembers(true);
                      try {
                        // Gọi API lấy member của coach này (luôn fetch mới)
                        const res = await axiosInstance.get('/api/coach-members/my-members');
                        if (res.data && Array.isArray(res.data)) {
                          setSendMembers(res.data);
                        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                          setSendMembers(res.data.data);
                        } else {
                          setSendMembers([]);
                        }
                      } catch (e) {
                        setSendMembers([]);
                      } finally {
                        setLoadingSendMembers(false);
                      }
                    }}
                  >
                    <svg style={{marginRight:4}} width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="10" fill="#fff" fillOpacity=".12"/><path d="M5.5 10.5l9-4-4 9-1.5-3-3-2z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="15.5" cy="4.5" r="1.5" fill="#fff"/></svg>
                    Gửi thông báo cho member
                  </button>
                </div>
                {/* Cards: Thành viên, Kế hoạch cai thuốc, Đánh giá */}
                <div className="cards-container" style={{marginBottom: '32px'}}>
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

                {/* Doanh thu tháng và năm hiện tại nằm ngang nhau */}
                <div style={{
                  display: 'flex',
                  gap: '24px',
                  justifyContent: 'center',
                  margin: '24px 0',
                  flexWrap: 'wrap'
                }}>
                  {/* Bảng doanh thu tháng hiện tại của coach */}
                  <div style={{
                    background: '#e3f2fd',
                    borderRadius: '10px',
                    border: '1px solid #90caf9',
                    boxShadow: '0 2px 8px rgba(33,150,243,0.05)',
                    padding: '20px',
                    minWidth: '320px',
                    maxWidth: '400px',
                    textAlign: 'center',
                    flex: '1 1 320px'
                  }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 600, margin: 0, color: '#1976d2' }}>
                      Doanh thu tháng hiện tại {currentMonthRevenue.period ? `(${currentMonthRevenue.period})` : ''}
                    </h3>
                    <div style={{ marginTop: 10, fontSize: '1.3em', color: '#1976d2', fontWeight: 700 }}>
                      {loadingMonthRevenue ? 'Đang tải...' : formatNumber(currentMonthRevenue.totalRevenue)} VND
                    </div>
                    <div style={{ marginTop: 4, color: '#555' }}>
                      Số giao dịch: <b>{currentMonthRevenue.totalTransactions}</b>
                    </div>
                  </div>
                  {/* Bảng doanh thu năm hiện tại của coach */}
                  <div style={{
                    background: '#fffde7',
                    borderRadius: '10px',
                    border: '1px solid #ffe082',
                    boxShadow: '0 2px 8px rgba(255,193,7,0.05)',
                    padding: '20px',
                    minWidth: '320px',
                    maxWidth: '400px',
                    textAlign: 'center',
                    flex: '1 1 320px'
                  }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 600, margin: 0, color: '#f9a825' }}>
                      Doanh thu năm hiện tại {currentYearRevenue.year ? `(${currentYearRevenue.year})` : ''}
                    </h3>
                    <div style={{ marginTop: 10, fontSize: '1.3em', color: '#f9a825', fontWeight: 700 }}>
                      {loadingYearRevenue ? 'Đang tải...' : formatNumber(currentYearRevenue.totalRevenue)} VND
                    </div>
                    <div style={{ marginTop: 4, color: '#555' }}>
                      Số giao dịch: <b>{currentYearRevenue.totalTransactions}</b>
                    </div>
                  </div>
                </div>
                {/* Biểu đồ đường doanh thu 12 tháng gần nhất cho coach */}
                <div style={{ margin: '30px 0', background: '#fff', borderRadius: '10px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', padding: '24px' }}>
                  <h3 style={{ fontSize: '1.3em', fontWeight: 600, margin: 0, marginBottom: 16 }}>Biểu đồ doanh thu 12 tháng gần nhất</h3>
                  {loadingRevenueChart ? (
                    <div style={{ color: '#888', margin: '16px 0' }}>Đang tải dữ liệu doanh thu...</div>
                  ) : revenueChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={revenueChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 13 }} />
                        <YAxis tickFormatter={v => formatNumber(v)} />
                        <Tooltip formatter={v => `${v.toLocaleString('vi-VN')} VND`} />
                        <Line type="monotone" dataKey="revenue" stroke="#007bff" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} name="Doanh thu" fillOpacity={0.2} />
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#007bff" stopOpacity={0.2}/>
                            <stop offset="100%" stopColor="#007bff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="revenue" stroke={false} fill="url(#colorRevenue)" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ color: '#888', margin: '16px 0' }}>Chưa có dữ liệu doanh thu 12 tháng.</div>
                  )}
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
