import React, { useEffect, useState } from 'react';
import { FaLeaf, FaSeedling, FaTree, FaSun, FaHeart, FaSmile } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AdminBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', condition_description: '', score: '', icon: 'leaf', id: null });
  const [editing, setEditing] = useState(false);
  // Dùng emoji cho dropdown và bảng
  const iconOptions = {
    leaf: '🍃', // Lá xanh
    seedling: '🌱', // Mầm cây
    tree: '🌳', // Cây lớn
    sun: '🌞', // Mặt trời
    heart: '❤️', // Trái tim
    smile: '😊' // Nụ cười
  };
  const fetchBadges = async () => {
    setLoading(true);
    try {
      const token = user?.token || user?.accessToken || localStorage.getItem('token');
      const res = await axios.get('/api/badges/GetAll', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBadges(res.data || []);
    } catch {
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
    // eslint-disable-next-line
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Tên huy hiệu không được để trống!');
    try {
      const token = user?.token || user?.accessToken || localStorage.getItem('token');
      const badgeData = {
        name: form.name,
        description: form.description,
        condition_description: form.condition_description,
        score: Number(form.score) || 0,
        icon: form.icon
      };
      if (editing) {
        await axios.put(`/api/badges/UpdateById/${form.id}`, badgeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/badges/Create', badgeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setForm({ name: '', description: '', condition_description: '', score: '', icon: 'leaf', id: null });
      setEditing(false);
      fetchBadges();
    } catch {
      alert('Có lỗi xảy ra!');
    }
  };

  const handleEdit = badge => {
    setForm({ ...badge, icon: badge.icon || 'leaf' });
    setEditing(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn chắc chắn muốn xóa huy hiệu này?')) return;
    try {
      const token = user?.token || user?.accessToken || localStorage.getItem('token');
      await axios.delete(`/api/badges/DeleteById/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBadges();
    } catch {
      alert('Xóa thất bại!');
    }
  };

  const handleCancel = () => {
    setForm({ name: '', description: '', condition_description: '', score: '', icon: 'leaf', id: null });
    setEditing(false);
  };

  return (
    <div style={{padding:32}}>
      <h2>Quản lý Huy hiệu</h2>
      <form onSubmit={handleSubmit} style={{marginBottom:24, display:'flex', alignItems:'center', flexWrap:'wrap'}}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên huy hiệu" required style={{marginRight:8}} />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" style={{marginRight:8}} />
        <input name="condition_description" value={form.condition_description} onChange={handleChange} placeholder="Điều kiện đạt" style={{marginRight:8}} />
        <input name="score" value={form.score} onChange={handleChange} placeholder="Điểm" type="number" min="0" style={{marginRight:8}} />
        <select name="icon" value={form.icon} onChange={handleChange} style={{marginRight:8, background:'#fff', color:'#222', border:'1px solid #ccc', borderRadius:4, padding:'4px 8px'}}>
          <option value="leaf">🍃 Lá xanh</option>
          <option value="seedling">🌱 Mầm cây</option>
          <option value="tree">🌳 Cây lớn</option>
          <option value="sun">🌞 Mặt trời</option>
          <option value="heart">❤️ Trái tim</option>
          <option value="smile">😊 Nụ cười</option>
        </select>
        <span style={{marginRight:8, fontSize:22}}>{iconOptions[form.icon]}</span>
        <button type="submit">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" onClick={handleCancel} style={{marginLeft:8}}>Hủy</button>}
      </form>
      {loading ? <div>Đang tải...</div> : (
        <table border="1" cellPadding="8" style={{width:'100%',background:'#fff'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Biểu tượng</th>
              <th>Tên huy hiệu</th>
              <th>Mô tả</th>
              <th>Điều kiện đạt</th>
              <th>Điểm</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {badges.map(badge => (
              <tr key={badge.id}>
                <td>{badge.id}</td>
                <td style={{fontSize:22}}>{iconOptions[badge.icon] || iconOptions['leaf']}</td>
                <td>{badge.name}</td>
                <td>{badge.description}</td>
                <td>{badge.condition_description}</td>
                <td>{badge.score}</td>
                <td>
                  <button onClick={() => handleEdit(badge)}>Sửa</button>
                  <button onClick={() => handleDelete(badge.id)} style={{marginLeft:8}}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminBadges;
