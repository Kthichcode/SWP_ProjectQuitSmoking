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
              <textarea value={content} onChange={e => setContent(e.target.value)} style={{width:'100%',padding:6,borderRadius:4,minHeight:60}}/>
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
import React, { useState, useEffect, useRef } from 'react';
import MembersBarChart from '../../components/MembersBarChart';
import MembersMonthChart from '../../components/MembersMonthChart';
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
        <h3 style={{marginBottom:20,fontWeight:600,fontSize:22,textAlign:'center',color:'#2d6cdf'}}>Danh sách thành viên đang kết nối</h3>
        <button style={{position:'absolute',top:16,right:24,background:'#f5f5f5',border:'none',borderRadius:4,padding:'4px 12px',fontWeight:500,cursor:'pointer',color:'#2d6cdf'}} onClick={onClose}>Đóng</button>
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
                  <li key={m.id || m.memberId || idx} style={{display:'flex',alignItems:'center',gap:12,background:'#f6f8fa',borderRadius:8,padding:'12px 16px',marginBottom:10,boxShadow:'0 1px 4px rgba(44,108,223,0.04)'}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'#e3eefd',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,color:'#2d6cdf',fontSize:18}}>
                      {firstLetter}
                    </div>
                    <div style={{fontSize:17,fontWeight:500,color:'#2d6cdf'}}>{name}</div>
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
import './CoachDashboard.css';
import { FaUsers, FaCalendarAlt, FaEnvelope, FaStar, FaTachometerAlt, FaSignOutAlt, FaPenNib, FaUserCircle, FaBell } from 'react-icons/fa';
// Notification Modal for Coach (similar to user)
function NotificationModal({ open, onClose, notifications, onMarkRead }) {
  if (!open) return null;
  return (
    <div className="admin-modal" style={{zIndex: 2000, background: 'rgba(0,0,0,0.18)', position: 'fixed', top:0, left:0, right:0, bottom:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div className="admin-modal-content" style={{maxWidth: 420, minWidth: 320, padding: 28, position: 'relative', borderRadius: 16, background:'#fff', boxShadow:'0 8px 32px rgba(44,108,223,0.10)'}}>
        <button
          className="admin-modal-close"
          style={{position: 'absolute', top: 12, right: 18, fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color:'#2d6cdf'}} 
          onClick={onClose}
          type="button"
        >×</button>
        <h3 style={{marginBottom: 18, fontWeight: 700, fontSize: 22, color:'#2d6cdf', textAlign:'center'}}>Thông báo</h3>
        {notifications.length === 0 ? (
          <div style={{color: '#888', textAlign:'center', padding:'32px 0'}}>Không có thông báo nào.</div>
        ) : (
          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
            {notifications.map(n => {
              // Determine sender: if createdBy/sender is 'admin' (case-insensitive) or empty, show 'Admin'
              let sender = n.createdBy || n.sender || '';
              if (!sender || /admin/i.test(sender)) sender = 'Admin';
              // fallback: if still empty, show '-';
              if (!sender) sender = '-';
              return (
                <li
                  key={n.userNotificationId}
                  style={{marginBottom: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 12, background: n.isRead ? '#f6f8fa' : '#fffbe7', cursor: n.isRead ? 'default' : 'pointer', borderRadius:10, boxShadow: n.isRead ? 'none' : '0 2px 8px #f59e4222'}}
                  onClick={async () => {
                    if (!n.isRead && onMarkRead) {
                      await onMarkRead(n);
                    }
                  }}
                >
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6}}>
                    <div style={{fontWeight: 700, fontSize: 16, color:'#2d6cdf'}}>{n.title}</div>
                    {!n.isRead && <span style={{color:'#f59e42', fontSize:12, fontWeight:600, marginLeft:8}}>Chưa đọc</span>}
                  </div>
                  <div style={{color: '#444', fontSize: 15, marginBottom: 6, whiteSpace:'pre-line'}}>{n.content}</div>
                  <div style={{display:'flex', alignItems:'center', gap:12, fontSize:13, color:'#666', marginBottom:2}}>
                    <span><b>Từ:</b> {sender}</span>
                    <span style={{fontSize:12, color:'#888'}}>
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
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../../axiosInstance';
import WebSocketService from '../../services/websocketService';


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
  const [hasUnread, setHasUnread] = useState(false);

  // Unread messages state for sidebar
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const globalSubscriptionRef = useRef(null);

  // Fetch unread notifications for dot (on mount and when user changes)
  useEffect(() => {
    const fetchUnread = async () => {
      if (user && user.token) {
        try {
          const res = await axiosInstance.get('/api/notifications/me');
          if (Array.isArray(res.data)) {
            setHasUnread(res.data.some(n => !(n.hasBeenRead || n.isRead || n.read)));
          } else {
            setHasUnread(false);
          }
        } catch (e) {
          setHasUnread(false);
        }
      } else {
        setHasUnread(false);
      }
    };
    fetchUnread();
  }, [user]);

  // Fetch conversations for unread messages count
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        if (!user) return;
        const currentCoachId = user.userId || user.id;
        if (!currentCoachId) return;
        const res = await axiosInstance.get(`/api/users/coaches/${currentCoachId}/selections`);
        if (res.data.status === 'success' && res.data.data) {
          const formatted = await Promise.all(res.data.data.map(async (sel) => {
            let unread = sel.unreadCount || 0;
            return {
              id: sel.selectionId,
              selectionId: sel.selectionId,
              unreadCount: unread,
              userId: sel.member?.userId || sel.member?.id,
            };
          }));
          setConversations(formatted);
          // Tổng số tin nhắn chưa đọc
          const totalUnread = formatted.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setUnreadMsgCount(totalUnread);
        } else {
          setConversations([]);
          setUnreadMsgCount(0);
        }
      } catch (e) {
        setConversations([]);
        setUnreadMsgCount(0);
      }
    };
    fetchConvs();
  }, [user]);

  // WebSocket global: tăng badge khi có tin nhắn mới từ user
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const connectGlobalWS = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      await WebSocketService.connect(token);
      const globalSub = WebSocketService.subscribe(
        `/user/queue/messages/global`,
        (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);
            // Chỉ tăng nếu là tin nhắn từ MEMBER (user)
            if (receivedMessage.senderType === 'MEMBER') {
              // Nếu coach đang ở trang chat với user này thì không tăng
              const currentPath = window.location.pathname;
              const isInChat = currentPath.startsWith('/coach/messages');
              if (!isInChat) {
                // Tăng tổng số unread
                if (isMounted) setUnreadMsgCount((prev) => prev + 1);
              }
            }
          } catch (err) {
            // ignore parse error
          }
        }
      );
      globalSubscriptionRef.current = globalSub;
    };
    connectGlobalWS();
    return () => {
      if (globalSubscriptionRef.current) {
        globalSubscriptionRef.current.unsubscribe();
      }
      isMounted = false;
    };
  }, [user]);

  // Khi vào trang messages, reset unread count về 0
  useEffect(() => {
    if (location.pathname.startsWith('/coach/messages')) {
      setUnreadMsgCount(0);
    }
  }, [location.pathname]);

  // Fetch notifications from API when modal opens
  useEffect(() => {
    const fetchNotifications = async () => {
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
            setHasUnread(res.data.some(n => !(n.hasBeenRead || n.isRead || n.read)));
          } else {
            setNotifications([]);
            setHasUnread(false);
          }
        } catch (e) {
          setNotifications([]);
          setHasUnread(false);
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
          <li style={{position:'relative'}}>
            <NavLink to="/coach/messages" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaEnvelope style={{marginRight:8}}/> Tin nhắn
              {unreadMsgCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 10,
                  right: 18,
                  background: '#e74c3c',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '2px 7px',
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                }}>{unreadMsgCount}</span>
              )}
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
              {hasUnread && (
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
                <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
                  <button onClick={() => { setShowMembers(true); fetchMyMembers(); }} style={{marginRight:8,background:'#e3eefd',color:'#2d6cdf',padding:'8px 16px',border:'none',borderRadius:6,fontWeight:600,cursor:'pointer'}}>Xem thành viên</button>
                  <button
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
                    style={{background:'#2d6cdf',color:'#fff',padding:'8px 16px',border:'none',borderRadius:6,fontWeight:600,cursor:'pointer'}}
                  >
                    Gửi thông báo cho member
                  </button>
                </div>
                <div className="cards-container">
                  <div className="card">
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
