import './AdminPage.css';
import { useState, useRef, useEffect } from 'react';
import { FaUser, FaEdit, FaPause, FaEllipsisV } from 'react-icons/fa';
import axios from 'axios';

function AdminCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', exp: '', rating: '' });
  const [selected, setSelected] = useState(null);
  const [openMenu, setOpenMenu] = useState(null); // coach id for dropdown
  const menuRef = useRef();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  
  useEffect(() => {
    async function fetchCoaches() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/user/getAll', {
          headers: token ? { Authorization: 'Bearer ' + token } : {}
        });
       
        if (Array.isArray(res.data.data)) {
          setCoaches(res.data.data.filter(u => u.roles && u.roles.includes('COACH')));
        }
      } catch (err) {
        
      }
    }
    fetchCoaches();
  }, []);

  const handleAdd = async e => {
    e.preventDefault();
    
    const payload = {
      username: form.email, 
      email: form.email,
      fullName: form.name
    };
    try {
      const res = await fetch('/api/coach/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && { 'Authorization': 'Bearer ' + localStorage.getItem('token') })
        },
        body: JSON.stringify(payload)
      });
      if (res.status === 409) {
        alert('Email hoặc username đã tồn tại!');
        return;
      }
      if (!res.ok) {
        alert('Có lỗi khi tạo coach!');
        return;
      }
      alert('Tạo coach thành công, mật khẩu đã gửi về email!');
      setCoaches([
        ...coaches,
        { ...form, id: Date.now(), status: 'active', plans: 0 }
      ]);
      setForm({ name: '', email: '', phone: '', exp: '', rating: '' });
      setShowAdd(false);
    } catch (err) {
      alert('Có lỗi khi tạo coach!');
    }
  };

  return (
    <div className="admin-page">
      <h2>Quản lý Coach</h2>
      <button className="admin-btn" onClick={() => setShowAdd(true)}>+ Thêm Coach</button>
      {showAdd && (
        <div className="admin-modal">
          <form className="admin-modal-content" onSubmit={handleAdd}>
            <button className="admin-modal-close" style={{top: 8, right: 12, fontSize: 28}} onClick={() => setShowAdd(false)} type="button">×</button>
            <h3>Thêm Coach mới</h3>
            <input required placeholder="Họ tên" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input required placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
           <button className="admin-btn" type="submit">Thêm</button>
          </form>
        </div>
      )}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Họ tên</th><th>Email</th><th>Số điện thoại</th><th>Kinh nghiệm</th><th>Kế hoạch hỗ trợ</th><th>Đánh giá</th><th>Trạng thái</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {coaches.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.exp}</td><td>{c.plans}</td><td>{c.rating}</td>
              <td><span className={c.status === 'active' ? 'active' : 'inactive'}>{c.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</span></td>
              <td style={{position:'relative'}}>
                <button
                  className="admin-btn admin-btn-more"
                  onClick={e => {
                    e.stopPropagation();
                    setOpenMenu(openMenu === c.id ? null : c.id);
                  }}
                  style={{padding: '6px 10px', borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#222', lineHeight: 1}}
                  title="Thao tác"
                >
                  <FaEllipsisV size={18} color="#222" style={{verticalAlign:'middle'}} />
                </button>
                {openMenu === c.id && (
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
                      onClick={() => { setSelected(c); setOpenMenu(null); }}
                    >
                      <FaUser /> <span style={{color:'#222'}}>Xem hồ sơ</span>
                    </button>
                    <button
                      className="admin-btn admin-btn-menu"
                      style={{
                        display:'flex',alignItems:'center',gap:8,width:'100%',background:'none',border:'none',padding:'8px 16px',cursor:'pointer',
                        color:'#222',fontSize:'1rem',textAlign:'left',fontWeight:500
                      }}
                      onClick={() => {  setOpenMenu(null); }}
                    >
                      <FaEdit /> <span style={{color:'#222'}}>Chỉnh sửa</span>
                    </button>
                    <button
                      className="admin-btn admin-btn-menu"
                      style={{
                        display:'flex',alignItems:'center',gap:8,width:'100%',background:'none',border:'none',padding:'8px 16px',cursor:'pointer',
                        color:'#ef4444',fontSize:'1rem',textAlign:'left',fontWeight:500
                      }}
                      onClick={() => {  setOpenMenu(null); }}
                    >
                      <FaPause /> <span style={{color:'#ef4444'}}>Tạm dừng</span>
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <button className="admin-modal-close" style={{top: 8, right: 12, fontSize: 28}} onClick={() => setSelected(null)} type="button">×</button>
            <h3>Thông tin Coach</h3>
            <div><b>Họ tên:</b> {selected.name}</div>
            <div><b>Email:</b> {selected.email}</div>
            <div><b>Số điện thoại:</b> {selected.phone}</div>
            <div><b>Kinh nghiệm:</b> {selected.exp}</div>
            <div><b>Kế hoạch hỗ trợ:</b> {selected.plans}</div>
            <div><b>Đánh giá:</b> {selected.rating}</div>
            <div><b>Trạng thái:</b> {selected.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminCoaches;
