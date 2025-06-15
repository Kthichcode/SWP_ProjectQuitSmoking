import './AdminPage.css';
import { useState } from 'react';

const users = [
  { id: 1, name: 'Nguyễn Văn A', email: 'vana@gmail.com', phone: '0901234567', role: 'Khách hàng', status: 'active', registered: '12/06/2025', plans: 2, lastLogin: '14/06/2025' },
  { id: 2, name: 'Lê Thị B', email: 'leb@gmail.com', phone: '0912345678', role: 'Coach', status: 'pending', registered: '10/06/2025', plans: 0, lastLogin: '12/06/2025' },
];

function AdminUsers() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="admin-page">
      <h2>Quản lý Người Dùng</h2>
      <div className="admin-stats-row">
        <div className="admin-stat-block"><div className="admin-stat-value">{users.length}</div><div className="admin-stat-label">Tổng người dùng</div></div>
        <div className="admin-stat-block"><div className="admin-stat-value">{users.filter(u => u.status === 'active').length}</div><div className="admin-stat-label">Đang hoạt động</div></div>
        <div className="admin-stat-block"><div className="admin-stat-value">{users.filter(u => u.role === 'Coach').length}</div><div className="admin-stat-label">Coach</div></div>
      </div>
      <div className="admin-search-row">
        <input className="admin-search" placeholder="Tìm kiếm theo tên, email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Họ tên</th><th>Email</th><th>Số điện thoại</th><th>Vai trò</th><th>Ngày đăng ký</th><th>Kế hoạch</th><th>Trạng thái</th><th>Lần đăng nhập cuối</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.role}</td><td>{u.registered}</td><td>{u.plans}</td>
              <td><span className={u.status === 'active' ? 'active' : u.status === 'pending' ? 'pending' : 'inactive'}>{u.status === 'active' ? 'Hoạt động' : u.status === 'pending' ? 'Chờ xác nhận' : 'Khóa'}</span></td>
              <td>{u.lastLogin}</td>
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
            <div><b>Họ tên:</b> {selected.name}</div>
            <div><b>Email:</b> {selected.email}</div>
            <div><b>Số điện thoại:</b> {selected.phone}</div>
            <div><b>Vai trò:</b> {selected.role}</div>
            <div><b>Ngày đăng ký:</b> {selected.registered}</div>
            <div><b>Kế hoạch đã tạo:</b> {selected.plans}</div>
            <div><b>Trạng thái:</b> {selected.status}</div>
            <div><b>Lần đăng nhập cuối:</b> {selected.lastLogin}</div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminUsers;
