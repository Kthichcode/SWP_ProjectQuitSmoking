  // Thêm style cho trạng thái nếu chưa có trong CSS
  const statusColorStyle = `
    .admin-table .inactive {
      color: #d97706; /* vàng */
      font-weight: 600;
    }
    .admin-table .banned {
      color: #ef4444; /* đỏ */
      font-weight: 600;
    }
  `;
import './AdminPage.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaUser, FaEdit, FaPause, FaEllipsisV } from 'react-icons/fa';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editStatusUser, setEditStatusUser] = useState(null); // user object
  const [statusModal, setStatusModal] = useState(false);
  const [statusValue, setStatusValue] = useState('ACTIVE');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    axios.get('/api/users/getAll', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        const members = res.data.filter(u => !(u.roles && u.roles.includes('COACH')));
        setUsers(members);
      })
      .catch(err => {
        setError('Lỗi khi tải danh sách người dùng!');
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    (u.fullName || u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  // Hàm gọi API cập nhật status
  const handleUpdateStatus = async () => {
    if (!editStatusUser || !statusValue) return;
    setStatusMsg('');
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      await axios.put(`http://localhost:5175/api/users/admin/users/${editStatusUser.id}/status?status=${statusValue}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setStatusMsg('Cập nhật trạng thái thành công!');
      setStatusModal(false);
      setEditStatusUser(null);
      // reload user list
      setLoading(true);
      axios.get('/api/users/getAll', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(res => {
          const members = res.data.filter(u => !(u.roles && u.roles.includes('COACH')));
          setUsers(members);
        })
        .catch(() => setUsers([]))
        .finally(() => setLoading(false));
    } catch (err) {
      setStatusMsg('Cập nhật trạng thái thất bại!');
    }
  };

  return (
    <>
      <style>{statusColorStyle}</style>
      <div className="admin-page">
      <h2>Quản lý Người Dùng</h2>
      <div className="admin-stats-row">
        <div className="admin-stat-block"><div className="admin-stat-value">{users.length}</div><div className="admin-stat-label">Tổng người dùng</div></div>
        
      </div>
      <div className="admin-search-row">
        <input className="admin-search" placeholder="Tìm kiếm theo tên, email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {error && <div style={{color:'red',margin:'8px 0'}}>{error}</div>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Ngày đăng ký</th><th>Trạng thái</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="9" style={{textAlign:'center'}}>Đang tải...</td></tr>
          ) : filtered.length === 0 ? (
            <tr><td colSpan="9" style={{textAlign:'center'}}>Không có người dùng nào</td></tr>
          ) : filtered.map(u => (
            <tr key={u.id}>
              <td>{u.username || u.fullName || u.name}</td>
              <td>{u.email}</td>
              <td>{u.role || (u.roles ? Array.isArray(u.roles) ? u.roles.join(', ') : u.roles : '')}</td>
              <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : (u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : (u.registered ? new Date(u.registered).toLocaleDateString('vi-VN') : ''))}</td>
              <td>
                <span className={
                  u.status === 'ACTIVE' || u.status === 'active' ? 'active'
                  : u.status === 'INACTIVE' || u.status === 'inactive' ? 'inactive'
                  : u.status === 'BANNED' || u.status === 'banned' ? 'banned'
                  : ''
                }>
                  {u.status === 'ACTIVE' || u.status === 'active' ? 'Hoạt động'
                  : u.status === 'INACTIVE' || u.status === 'inactive' ? 'Dừng hoạt động'
                  : u.status === 'BANNED' || u.status === 'banned' ? 'Khóa'
                  : u.status}
                </span>
              </td>
              <td style={{position:'relative'}}>
                <button
                  className="admin-btn admin-btn-more"
                  onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                  style={{padding: '6px 10px', borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#222', lineHeight: 1}}
                  title="Thao tác"
                >
                  <FaEllipsisV size={18} color="#222" style={{verticalAlign:'middle'}} />
                </button>
                {openMenu === u.id && (
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
                      onClick={() => { setSelected(u); setOpenMenu(null); }}
                    >
                      <FaUser /> <span style={{color:'#222'}}>Xem hồ sơ</span>
                    </button>
                    <button
                      className="admin-btn admin-btn-menu"
                      style={{
                        display:'flex',alignItems:'center',gap:8,width:'100%',background:'none',border:'none',padding:'8px 16px',cursor:'pointer',
                        color:'#222',fontSize:'1rem',textAlign:'left',fontWeight:500
                      }}
                      onClick={() => {
                        setEditStatusUser(u);
                        setStatusValue(u.status === 'ACTIVE' || u.status === 'active' ? 'ACTIVE' : (u.status === 'pending' ? 'PENDING' : 'INACTIVE'));
                        setStatusModal(true);
                        setOpenMenu(null);
                      }}
                    >
                      <FaEdit /> <span style={{color:'#222'}}>Chỉnh sửa trạng thái</span>
                    </button>

                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal chỉnh sửa trạng thái */}
      {statusModal && editStatusUser && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <button className="admin-modal-close" style={{top: 8, right: 12, fontSize: 28}} onClick={() => setStatusModal(false)} type="button">×</button>
            <h3>Chỉnh sửa trạng thái người dùng</h3>
            <div><b>Họ tên:</b> {editStatusUser.fullName || editStatusUser.name}</div>
            <div><b>Email:</b> {editStatusUser.email}</div>
            <div style={{margin:'16px 0'}}>
              <label>Trạng thái mới:&nbsp;</label>
              <select value={statusValue} onChange={e => setStatusValue(e.target.value)} style={{padding:6,borderRadius:6}}>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Dừng hoạt động</option>
                <option value="BANNED">Khóa</option>
              </select>
            </div>
            <div style={{display:'flex',gap:12,marginTop:12}}>
              <button className="admin-btn" style={{background:'#2563eb',color:'#fff'}} onClick={handleUpdateStatus} type="button">Lưu</button>
              <button className="admin-btn admin-btn-cancel" onClick={()=>setStatusModal(false)} type="button">Hủy</button>
            </div>
            {statusMsg && <div style={{color: statusMsg.includes('thành công') ? 'green' : 'red',marginTop:10}}>{statusMsg}</div>}
          </div>
        </div>
      )}

      {selected && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <button className="admin-modal-close" style={{top: 8, right: 12, fontSize: 28}} onClick={() => setSelected(null)} type="button">×</button>
            <h3>Thông tin chi tiết</h3>
            <div><b>Họ tên:</b> {selected.fullName || selected.name}</div>
            <div><b>Email:</b> {selected.email}</div>
            {/* Số điện thoại đã bị xóa theo yêu cầu */}
            <div><b>Vai trò:</b> {selected.role || (selected.roles ? Array.isArray(selected.roles) ? selected.roles.join(', ') : selected.roles : '')}</div>
            <div><b>Ngày đăng ký:</b> {selected.created_at ? new Date(selected.created_at).toLocaleDateString('vi-VN') : (selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('vi-VN') : (selected.registered ? new Date(selected.registered).toLocaleDateString('vi-VN') : 'Không rõ'))}</div>
            <div><b>Trạng thái:</b> {selected.status}</div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
export default AdminUsers;
