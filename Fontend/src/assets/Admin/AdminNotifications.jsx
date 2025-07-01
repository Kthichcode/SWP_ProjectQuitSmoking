import './AdminPage.css';
import './AdminNotificationForm.css';
import { useState, useRef, useEffect } from 'react';
import { FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';

const initialNotifications = [
  { id: 1, content: 'Chúc mừng bạn đã đạt thành tích mới!', type: 'thanh-tich', time: '10/06/2025', target: 'Tất cả', sendType: 'Khi đạt thành tích' },
  { id: 2, content: 'Đừng bỏ cuộc, hãy tiếp tục cố gắng nhé!', type: 'login', time: '09/06/2025', target: 'Tất cả', sendType: 'Khi đăng nhập' },
];


function AdminNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ content: '', sendType: 'Khi đăng nhập', time: '', target: 'Tất cả' });
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAdd = e => {
    e.preventDefault();
    setNotifications([
      ...notifications,
      { ...form, id: Date.now(), time: new Date().toLocaleDateString('vi-VN') }
    ]);
    setForm({ content: '', sendType: 'Khi đăng nhập', time: '', target: 'Tất cả' });
    setShowAdd(false);
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
                <label className="admin-notification-label">Loại gửi</label>
                <select 
                  className="admin-notification-select"
                  value={form.sendType} 
                  onChange={e => setForm(f => ({ ...f, sendType: e.target.value }))}
                >
                  <option value="Khi đăng nhập">Gửi khi đăng nhập</option>
                  <option value="Khi đạt thành tích">Gửi khi đạt thành tích</option>
                  <option value="Khi đạt huy hiệu">Gửi khi đạt huy hiệu</option>
                  <option value="Gửi ngay">Gửi ngay</option>
                </select>
              </div>
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
            <th>Nội dung</th><th>Thời điểm tạo</th><th>Loại gửi</th><th>Đối tượng</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map(n => (
            <tr key={n.id}>
              <td>{n.content}</td>
              <td>{n.time}</td>
              <td>{n.sendType}</td>
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
                        color:'#222',fontSize:'1rem',textAlign:'left',fontWeight:500
                      }}
                      onClick={() => { setOpenMenu(null); }}
                    >
                      <FaEdit /> <span style={{color:'#222'}}>Chỉnh sửa</span>
                    </button>
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
