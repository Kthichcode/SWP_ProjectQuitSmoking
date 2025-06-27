import './AdminPage.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    axios.get('/api/users/getAll', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => setUsers(res.data))
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

  return (
    <div className="admin-page">
      <h2>Quản lý Người Dùng</h2>
      <div className="admin-stats-row">
        <div className="admin-stat-block"><div className="admin-stat-value">{users.length}</div><div className="admin-stat-label">Tổng người dùng</div></div>
        <div className="admin-stat-block"><div className="admin-stat-value">{users.filter(u => (u.status === 'active' || u.status === 'ACTIVE')).length}</div><div className="admin-stat-label">Đang hoạt động</div></div>
        <div className="admin-stat-block"><div className="admin-stat-value">{users.filter(u => (u.role === 'Coach' || (u.roles && u.roles.includes('COACH')))).length}</div><div className="admin-stat-label">Coach</div></div>
      </div>
      <div className="admin-search-row">
        <input className="admin-search" placeholder="Tìm kiếm theo tên, email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {error && <div style={{color:'red',margin:'8px 0'}}>{error}</div>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Họ tên</th><th>Email</th><th>Số điện thoại</th><th>Vai trò</th><th>Ngày đăng ký</th><th>Kế hoạch</th><th>Trạng thái</th><th>Lần đăng nhập cuối</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="9" style={{textAlign:'center'}}>Đang tải...</td></tr>
          ) : filtered.length === 0 ? (
            <tr><td colSpan="9" style={{textAlign:'center'}}>Không có người dùng nào</td></tr>
          ) : filtered.map(u => (
            <tr key={u.id}>
              <td>{u.fullName || u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone || u.phoneNumber || ''}</td>
              <td>{u.role || (u.roles ? Array.isArray(u.roles) ? u.roles.join(', ') : u.roles : '')}</td>
              <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : (u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : (u.registered ? new Date(u.registered).toLocaleDateString('vi-VN') : ''))}</td>
              <td>{u.plans || ''}</td>
              <td><span className={u.status === 'active' || u.status === 'ACTIVE' ? 'active' : u.status === 'pending' ? 'pending' : 'inactive'}>{u.status === 'active' || u.status === 'ACTIVE' ? 'Hoạt động' : u.status === 'pending' ? 'Chờ xác nhận' : 'Khóa'}</span></td>
              <td>{u.lastLogin || ''}</td>
              <td>
                <button className="admin-btn" onClick={() => setSelected(u)}>Xem</button>
                <button className="admin-btn admin-btn-edit">Sửa</button>
                <button className="admin-btn admin-btn-danger">Khóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <button className="admin-modal-close" style={{top: 8, right: 12, fontSize: 28}} onClick={() => setSelected(null)} type="button">×</button>
            <h3>Thông tin chi tiết</h3>
            <div><b>Họ tên:</b> {selected.fullName || selected.name}</div>
            <div><b>Email:</b> {selected.email}</div>
            <div><b>Số điện thoại:</b> {selected.phone || selected.phoneNumber || ''}</div>
            <div><b>Vai trò:</b> {selected.role || (selected.roles ? Array.isArray(selected.roles) ? selected.roles.join(', ') : selected.roles : '')}</div>
            <div><b>Ngày đăng ký:</b> {selected.created_at ? new Date(selected.created_at).toLocaleDateString('vi-VN') : (selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('vi-VN') : (selected.registered ? new Date(selected.registered).toLocaleDateString('vi-VN') : 'Không rõ'))}</div>
            <div><b>Kế hoạch đã tạo:</b> {selected.plans || ''}</div>
            <div><b>Trạng thái:</b> {selected.status}</div>
            <div><b>Lần đăng nhập cuối:</b> {selected.lastLogin || ''}</div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminUsers;
