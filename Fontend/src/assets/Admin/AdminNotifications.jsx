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
  const [form, setForm] = useState({ title: '', content: '', time: '', target: 'Tất cả' });
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef();


  // Fetch notifications from API
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await axiosInstance.get('/api/notifications');
        // Map API data to table format
        if (Array.isArray(res.data)) {
          setNotifications(res.data.map(n => ({
            id: n.id,
            title: n.title || '',
            content: n.content,
            time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN') : '',
            target: n.target || 'Tất cả',
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
      const res = await axiosInstance.post('/api/notifications', {
        title: form.title,
        content: form.content,
        target: form.target
      });
      // Sau khi tạo thành công, reload lại danh sách
      setForm({ title: '', content: '', time: '', target: 'Tất cả' });
      setShowAdd(false);
      // Gọi lại API để lấy danh sách mới
      const res2 = await axiosInstance.get('/api/notifications');
      if (Array.isArray(res2.data)) {
        setNotifications(res2.data.map(n => ({
          id: n.id,
          title: n.title || '',
          content: n.content,
          time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN') : '',
          target: n.target || 'Tất cả',
        })));
      }
    } catch (e) {
      alert('Tạo thông báo thất bại!');
    }
  };

  const handleDelete = id => {
    setNotifications(notifications.filter(n => n.id !== id));
    setOpenMenu(null);
  };

  return (
    <div className="admin-page">
      <h2>Quản lý Thông Báo</h2>
      <button className="admin-btn" onClick={() => setShowAdd(true)}>+ Tạo Thông Báo</button>
      {showAdd && (
        <div className="admin-modal">
          <form className="admin-modal-content admin-notification-form" onSubmit={handleAdd}>
            <button className="admin-modal-close admin-notification-close" onClick={() => setShowAdd(false)} type="button">×</button>
            <h3 className="admin-notification-title">Tạo Thông Báo mới</h3>
            <label className="admin-notification-label">Tiêu đề</label>
            <input
              className="admin-notification-input"
              required
              placeholder="Tiêu đề thông báo"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <label className="admin-notification-label">Nội dung thông báo</label>
            <textarea 
              className="admin-notification-textarea"
              required 
              placeholder="Nội dung thông báo" 
              value={form.content} 
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))} 
            />
            <div className="admin-notification-row">

              <div className="admin-notification-col">
                <label className="admin-notification-label">Đối tượng</label>
                <input 
                  className="admin-notification-input"
                  placeholder="Tất cả hoặc tên user" 
                  value={form.target} 
                  onChange={e => setForm(f => ({ ...f, target: e.target.value }))} 
                />
              </div>
            </div>
            <button className="admin-btn admin-notification-submit" type="submit">Tạo</button>
          </form>
        </div>
      )}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Tiêu đề</th><th>Nội dung</th><th>Thời điểm tạo</th><th>Đối tượng</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map(n => (
            <tr key={n.id}>
              <td>{n.title}</td>
              <td>{n.content}</td>
              <td>{n.time}</td>
              <td>{n.target}</td>
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
