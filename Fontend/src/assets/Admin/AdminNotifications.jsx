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
      <h2>Quản lý Thông Báo</h2>
      <button className="admin-btn" onClick={() => setShowAdd(true)}>+ Tạo Thông Báo</button>
      {showAdd && (
        <div className="admin-modal" style={{zIndex:2001, background:'rgba(0,0,0,0.18)'}}>
          <form className="admin-modal-content admin-notification-form" onSubmit={handleAdd} style={{width:420, minWidth:320, maxWidth:420, padding:28, borderRadius:16, background:'#fff', boxShadow:'0 8px 32px rgba(44,108,223,0.10)', position:'relative', boxSizing:'border-box'}}>
            <button className="admin-modal-close admin-notification-close" onClick={() => setShowAdd(false)} type="button" style={{position:'absolute',top:12,right:18,fontSize:28,background:'none',border:'none',cursor:'pointer',color:'#2d6cdf'}}>×</button>
            <h3 className="admin-notification-title" style={{marginBottom:18, fontWeight:700, fontSize:22, color:'#2d6cdf', textAlign:'center'}}>Tạo Thông Báo mới</h3>
            <div style={{display:'flex', gap:10, marginBottom:18, justifyContent:'center'}}>
              {[{label:'Tất cả', value:'all'},{label:'User', value:'user'},{label:'Coach', value:'coach'}].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={targetType===opt.value?"admin-btn admin-btn-menu":"admin-btn"}
                  onClick={()=>setTargetType(opt.value)}
                  style={{
                    minWidth:90,
                    height:40,
                    fontWeight:600,
                    fontSize:16,
                    borderRadius:8,
                    border:'1px solid #d1d5db',
                    background: targetType===opt.value ? '#e3eefd' : '#f8fafc',
                    color: targetType===opt.value ? '#2d6cdf' : '#222',
                    boxShadow: targetType===opt.value ? '0 2px 8px #2d6cdf22' : 'none',
                    transition:'all 0.15s',
                    outline:'none',
                    cursor:'pointer',
                    margin:0,
                    padding:'0 18px',
                    display:'flex',alignItems:'center',justifyContent:'center'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <label className="admin-notification-label" style={{fontWeight:600,marginBottom:4,display:'block'}}>Tiêu đề</label>
              <input
                className="admin-notification-input"
                required
                placeholder="Tiêu đề thông báo"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #d1d5db',fontSize:15}}
              />
            </div>
            <div style={{marginBottom:14}}>
              <label className="admin-notification-label" style={{fontWeight:600,marginBottom:4,display:'block'}}>Nội dung thông báo</label>
              <textarea 
                className="admin-notification-textarea"
                required 
                placeholder="Nội dung thông báo" 
                value={form.content} 
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))} 
                style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #d1d5db',fontSize:15,minHeight:70,resize:'vertical'}}
              />
            </div>
            {targetType === 'user' && (
              <div className="admin-notification-col" style={{marginBottom:14}}>
                <label className="admin-notification-label" style={{fontWeight:600,marginBottom:4,display:'block'}}>Chọn User</label>
                <select className="admin-notification-input" value={form.userId || ''} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} required style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #d1d5db',fontSize:15}}>
                  <option value="">-- Chọn user --</option>
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
                    <div style={{marginTop:8, fontSize:'0.97rem', color:'#444', background:'#f3f4f6', padding:'8px', borderRadius:'6px', lineHeight:1.6}}>
                      <div><b>Họ tên:</b> {user.fullName || user.name}</div>
                      <div><b>Email:</b> {user.email}</div>
                      <div><b>Username:</b> {user.username}</div>
                    </div>
                  );
                })()}
              </div>
            )}
            {targetType === 'coach' && (
              <div className="admin-notification-col" style={{marginBottom:14}}>
                <label className="admin-notification-label" style={{fontWeight:600,marginBottom:4,display:'block'}}>Chọn Coach</label>
                <select className="admin-notification-input" value={form.coachId || ''} onChange={e => setForm(f => ({ ...f, coachId: e.target.value }))} required style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #d1d5db',fontSize:15}}>
                  <option value="">-- Chọn coach --</option>
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
                    <div style={{marginTop:8, fontSize:'0.97rem', color:'#444', background:'#f3f4f6', padding:'8px', borderRadius:'6px', lineHeight:1.6}}>
                      <div><b>Họ tên:</b> {coach.fullName || coach.name}</div>
                      <div><b>Email:</b> {coach.email}</div>
                      <div><b>Username:</b> {coach.username}</div>
                    </div>
                  );
                })()}
              </div>
            )}
            <div style={{display:'flex',justifyContent:'center',marginTop:18}}>
              <button className="admin-btn admin-notification-submit" type="submit" style={{background:'#2d6cdf',color:'#fff',padding:'10px 32px',border:'none',borderRadius:8,fontWeight:700,fontSize:16,boxShadow:'0 2px 8px #2d6cdf22',letterSpacing:0.2}}>Tạo</button>
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
