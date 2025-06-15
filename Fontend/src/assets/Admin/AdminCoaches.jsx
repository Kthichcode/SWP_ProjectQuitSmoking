import './AdminPage.css';
import { useState } from 'react';

const initialCoaches = [
  { id: 1, name: 'Trần Văn Minh', email: 'minhtran@gmail.com', phone: '0901111111', exp: '8 năm', status: 'active', plans: 12, rating: 4.8 },
  { id: 2, name: 'Lê Thị Hương', email: 'huongle@gmail.com', phone: '0902222222', exp: '6 năm', status: 'inactive', plans: 5, rating: 4.7 },
];

function AdminCoaches() {
  const [coaches, setCoaches] = useState(initialCoaches);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', exp: '', rating: '' });
  const [selected, setSelected] = useState(null);

  const handleAdd = e => {
    e.preventDefault();
    setCoaches([
      ...coaches,
      { ...form, id: Date.now(), status: 'active', plans: 0 }
    ]);
    setForm({ name: '', email: '', phone: '', exp: '', rating: '' });
    setShowAdd(false);
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
            <input required placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input required placeholder="Số điện thoại" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <input required placeholder="Kinh nghiệm" value={form.exp} onChange={e => setForm(f => ({ ...f, exp: e.target.value }))} />
            <input required placeholder="Đánh giá (VD: 4.8)" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} />
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
              <td>
                <button className="admin-btn" onClick={() => setSelected(c)}>Xem</button>
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
