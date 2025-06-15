import './AdminPage.css';
import { useState } from 'react';

const initialPlans = [
  { id: 1, name: 'Kế hoạch A', creator: 'Nguyễn Văn A', date: '10/06/2025', status: 'active' },
  { id: 2, name: 'Kế hoạch B', creator: 'Lê Thị B', date: '09/06/2025', status: 'inactive' },
];

function AdminPlans() {
  const [plans, setPlans] = useState(initialPlans);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', creator: '', date: '', status: 'active' });

  const handleAdd = e => {
    e.preventDefault();
    setPlans([
      ...plans,
      { ...form, id: Date.now() }
    ]);
    setForm({ name: '', creator: '', date: '', status: 'active' });
    setShowAdd(false);
  };

  return (
    <div className="admin-page">
      <h2>Quản lý Kế Hoạch</h2>
      <button className="admin-btn" onClick={() => setShowAdd(true)}>+ Thêm Kế Hoạch</button>
      {showAdd && (
        <div className="admin-modal">
          <form className="admin-modal-content" onSubmit={handleAdd}>
            <button className="admin-modal-close" onClick={() => setShowAdd(false)} type="button">×</button>
            <h3>Thêm Kế Hoạch mới</h3>
            <input required placeholder="Tên kế hoạch" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input required placeholder="Người tạo" value={form.creator} onChange={e => setForm(f => ({ ...f, creator: e.target.value }))} />
            <input required placeholder="Ngày tạo (VD: 15/06/2025)" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="active">Đang thực hiện</option>
              <option value="inactive">Đã hoàn thành</option>
            </select>
            <button className="admin-btn" type="submit">Thêm</button>
          </form>
        </div>
      )}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Tên kế hoạch</th><th>Người tạo</th><th>Ngày tạo</th><th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {plans.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td><td>{p.creator}</td><td>{p.date}</td>
              <td><span className={p.status === 'active' ? 'active' : 'inactive'}>{p.status === 'active' ? 'Đang thực hiện' : 'Đã hoàn thành'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default AdminPlans;
