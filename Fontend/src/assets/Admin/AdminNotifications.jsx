import './AdminPage.css';
import './AdminNotificationForm.css';
import { useState, useRef, useEffect } from 'react';
import axiosInstance from '../../../axiosInstance';
import { FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';

// initialNotifications chỉ dùng khi chưa có API
const initialNotifications = [];


function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', time: '', target: 'Tất cả', userId: '', coachId: '' });
  const [targetType, setTargetType] = useState('all'); // 'all', 'user', 'coach'
  const [users, setUsers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef();
  // Fetch users and coaches for dropdowns
  useEffect(() => {
    if (showAdd) {
      axiosInstance.get('/api/users/getAll')
        .then(res => {
          if (Array.isArray(res.data)) {
            setUsers(res.data.filter(u => u.roles && u.roles.includes('MEMBER')));
            setCoaches(res.data.filter(u => u.roles && u.roles.includes('COACH')));
          } else {
            setUsers([]);
            setCoaches([]);
          }
        })
        .catch(() => {
          setUsers([]);
          setCoaches([]);
        });
    }
  }, [showAdd]);


  // Fetch notifications from API
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await axiosInstance.get('/api/notifications');
        // Map API data to table format
        if (Array.isArray(res.data)) {
        setNotifications(res.data.map(n => ({
          id: Number(n.notificationId),
          title: n.title || '',
          content: n.content,
          time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN') : '',
          sender: n.createdBy || '',
        })));
        }
      } catch (e) {
        setNotifications([]);
      }
    }
    fetchNotifications();

    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Gửi thông báo mới lên API
  const handleAdd = async e => {
    e.preventDefault();
    try {
      let notificationId = null;
      if (targetType === 'all') {
        // Tạo notification chung
        const res = await axiosInstance.post('/api/notifications', {
          title: form.title,
          content: form.content,
          isActive: true
        });
        // Lấy notificationId vừa tạo để dùng cho gửi cá nhân hóa nếu cần
        if (res && res.data && res.data.notificationId) {
          notificationId = res.data.notificationId;
        }
      } else {
        // Luôn tạo notification trước, lấy id
        const res = await axiosInstance.post('/api/notifications', {
          title: form.title,
          content: form.content,
          isActive: true
        });
        if (res && res.data && res.data.notificationId) {
          notificationId = res.data.notificationId;
        } else {
          throw new Error('Không lấy được notificationId');
        }
        // Gửi cho user hoặc coach
        await axiosInstance.post('/api/notifications/send', {
          userId: targetType === 'user' ? form.userId : form.coachId,
          notificationId: notificationId,
          personalizedReason: ''
        });
      }
      // Sau khi tạo thành công, reload lại danh sách
      setForm({ title: '', content: '', time: '', target: 'Tất cả', userId: '', coachId: '' });
      setShowAdd(false);
      // Gọi lại API để lấy danh sách mới
      const res2 = await axiosInstance.get('/api/notifications');
      if (Array.isArray(res2.data)) {
        setNotifications(res2.data.map(n => {
          let targetLabel = 'Tất cả';
          if (n.target === 'user' || n.target === 'User' || n.userId) targetLabel = 'User';
          else if (n.target === 'coach' || n.target === 'Coach' || n.coachId) targetLabel = 'Coach';
          else if (n.target === 'all' || n.target === 'Tất cả') targetLabel = 'Tất cả';
          return {
            id: Number(n.notificationId),
            title: n.title || '',
            content: n.content,
            time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN') : '',
            target: targetLabel,
          };
        }));
      }
    } catch (e) {
      alert('Tạo thông báo thất bại!');
    }
  };

  // Xóa thông báo qua API
  const handleDelete = async id => {
    if (!id || isNaN(Number(id))) {
      alert('ID thông báo không hợp lệ!');
      setOpenMenu(null);
      return;
    }
    try {
      await axiosInstance.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (e) {
      alert('Xóa thông báo thất bại!');
    }
    setOpenMenu(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-notification-page-header">
        <h2 className="admin-notification-page-title">
          Quản lý Thông Báo
        </h2>
        <button 
          className="admin-notification-create-btn" 
          onClick={() => setShowAdd(true)}
        >
          <span className="admin-notification-create-icon">+</span>
          Tạo Thông Báo Mới
        </button>
      </div>
      {showAdd && (
        <div className="admin-notification-modal">
          <form 
            className="admin-notification-form" 
            onSubmit={handleAdd}
          >
            {/* Header */}
            <div className="admin-notification-header">
              <button 
                className="admin-notification-close" 
                onClick={() => setShowAdd(false)} 
                type="button"
              >
                ×
              </button>
              <h3 className="admin-notification-title">
                Tạo Thông Báo Mới
              </h3>
              <p className="admin-notification-subtitle">
                Gửi thông báo hỗ trợ cai nghiện đến người dùng hoặc huấn luyện viên
              </p>
            </div>

            {/* Content */}
            <div className="admin-notification-content">
              {/* Target Type Selection */}
              <div className="admin-notification-target-section">
                <label className="admin-notification-label">
                  Đối tượng nhận thông báo
                </label>
                <div className="admin-notification-target-grid">
                  {[
                    {label:'Tất cả', value:'all', icon: '🎉'},
                    {label:'Người dùng', value:'user', icon: '👤'},
                    {label:'Huấn luyện viên', value:'coach', icon: '🎯'}
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTargetType(opt.value)}
                      className={`admin-notification-target-btn ${targetType === opt.value ? 'active' : ''}`}
                    >
                      <span className="admin-notification-target-icon">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Title Field */}
              <div className="admin-notification-field">
                <label className="admin-notification-label">
                  Tiêu đề thông báo
                </label>
                <input
                  className="admin-notification-input"
                  required
                  placeholder="Nhập tiêu đề thông báo hỗ trợ cai nghiện..."
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Content Field */}
              <div className="admin-notification-field">
                <label className="admin-notification-label">
                  Nội dung thông báo
                </label>
                <textarea 
                  className="admin-notification-textarea"
                  required 
                  placeholder="Nhập nội dung thông báo động viên, hỗ trợ quá trình cai nghiện..."
                  value={form.content} 
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))} 
                />
              </div>
              {/* User Selection */}
              {targetType === 'user' && (
                <div className="admin-notification-field">
                  <label className="admin-notification-label">
                    Chọn người dùng
                  </label>
                  <select 
                    className="admin-notification-select"
                    value={form.userId || ''} 
                    onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} 
                    required
                  >
                    <option value="">-- Chọn người dùng --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.name || u.email || u.username} {u.email ? `(${u.email})` : ''}
                      </option>
                    ))}
                  </select>
                  {form.userId && (() => {
                    const user = users.find(u => String(u.id) === String(form.userId));
                    if (!user) return null;
                    return (
                      <div className="admin-notification-info-card">
                        <div className="admin-notification-info-header">
                          Thông tin người dùng được chọn
                        </div>
                        <div className="admin-notification-info-grid">
                          <div className="admin-notification-info-item">
                            <span className="admin-notification-info-label">Họ tên:</span> {user.fullName || user.name}
                          </div>
                          <div className="admin-notification-info-item">
                            <span className="admin-notification-info-label">Email:</span> {user.email}
                          </div>
                          <div className="admin-notification-info-item">
                            <span className="admin-notification-info-label">Username:</span> {user.username}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              {/* Coach Selection */}
              {targetType === 'coach' && (
                <div className="admin-notification-field">
                  <label className="admin-notification-label">
                    Chọn huấn luyện viên
                  </label>
                  <select 
                    className="admin-notification-select"
                    value={form.coachId || ''} 
                    onChange={e => setForm(f => ({ ...f, coachId: e.target.value }))} 
                    required
                  >
                    <option value="">-- Chọn huấn luyện viên --</option>
                    {coaches.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.fullName || u.email || u.username} {u.email ? `(${u.email})` : ''}
                      </option>
                    ))}
                  </select>
                  {form.coachId && (() => {
                    const coach = coaches.find(u => String(u.id) === String(form.coachId));
                    if (!coach) return null;
                    return (
                      <div className="admin-notification-info-card">
                        <div className="admin-notification-info-header">
                          Thông tin huấn luyện viên được chọn
                        </div>
                        <div className="admin-notification-info-grid">
                          <div className="admin-notification-info-item">
                            <span className="admin-notification-info-label">Họ tên:</span> {coach.fullName || coach.name}
                          </div>
                          <div className="admin-notification-info-item">
                            <span className="admin-notification-info-label">Email:</span> {coach.email}
                          </div>
                          <div className="admin-notification-info-item">
                            <span className="admin-notification-info-label">Username:</span> {coach.username}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Submit Button */}
              <div className="admin-notification-actions">
                <button 
                  type="button"
                  className="admin-notification-btn-cancel"
                  onClick={() => setShowAdd(false)}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="admin-notification-btn-submit"
                >
                  Tạo thông báo
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Tiêu đề</th><th>Nội dung</th><th>Thời điểm tạo</th><th>Người gửi</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map(n => (
            <tr key={n.id}>
              <td>{n.title}</td>
              <td>{n.content}</td>
              <td>{n.time}</td>
              <td>{n.sender}</td>
              <td style={{position:'relative'}}>
                <button
                  className="admin-btn admin-btn-more"
                  onClick={e => {
                    e.stopPropagation();
                    setOpenMenu(openMenu === n.id ? null : n.id);
                  }}
                  style={{padding: '6px 10px', borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#222', lineHeight: 1}}
                  title="Thao tác"
                >
                  <FaEllipsisV size={18} color="#222" style={{verticalAlign:'middle'}} />
                </button>
                {openMenu === n.id && (
                  <div
                    ref={menuRef}
                    style={{
                      position: 'fixed',
                      top: (window.event && window.event.clientY ? window.event.clientY + 8 : 100),
                      left: (window.event && window.event.clientX ? window.event.clientX - 160 : 100),
                      background: '#fff',
                      boxShadow: '0 2px 8px #0002',
                      borderRadius: 8,
                      zIndex: 1000,
                      minWidth: 150,
                      padding: '6px 0'
                    }}
                  >
                    <button
                      className="admin-btn admin-btn-menu"
                      style={{
                        display:'flex',alignItems:'center',gap:8,width:'100%',background:'none',border:'none',padding:'8px 16px',cursor:'pointer',
                        color:'#ef4444',fontSize:'1rem',textAlign:'left',fontWeight:500
                      }}
                      onClick={() => handleDelete(n.id)}
                    >
                      <FaTrash /> <span style={{color:'#ef4444'}}>Xóa</span>
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default AdminNotifications;
