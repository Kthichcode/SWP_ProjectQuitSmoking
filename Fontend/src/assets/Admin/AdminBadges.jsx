import React, { useEffect, useState } from 'react';
import { FaLeaf, FaSeedling, FaTree, FaSun, FaHeart, FaSmile } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AdminBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', condition: '', type: '', score: '', icon: 'leaf', iconUrl: '', id: null });
  const [editing, setEditing] = useState(false);
 
  const iconOptions = {
    leaf: '🍃', 
    seedling: '🌱', 
    tree: '🌳', 
    sun: '🌞', 
    heart: '❤️', 
    smile: '😊' 
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
    
  }, []);

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    if (name === 'iconUrl' && type === 'file' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, iconUrl: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Validate required fields
    if (!form.name.trim()) return alert('Tên huy hiệu không được để trống!');
    if (!form.type.trim()) return alert('Loại huy hiệu không được để trống!');
    if (!form.description.trim()) return alert('Mô tả không được để trống!');
    if (form.condition === '' || isNaN(Number(form.condition))) return alert('Điều kiện đạt phải là số!');
    if (form.score === '' || isNaN(Number(form.score))) return alert('Điểm phải là số!');

    // iconUrl: nếu không có ảnh, gửi chuỗi rỗng
    const iconUrlToSend = form.iconUrl ? form.iconUrl : '';

    try {
      const token = user?.token || user?.accessToken || localStorage.getItem('token');
      const badgeData = {
        name: form.name,
        description: form.description,
        condition: Number(form.condition),
        type: form.type,
        iconUrl: iconUrlToSend,
        score: Number(form.score)
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
      setForm({ name: '', description: '', condition: '', type: '', score: '', icon: 'leaf', id: null });
      setForm({ name: '', description: '', condition: '', type: '', score: '', icon: 'leaf', iconUrl: '', id: null });
      setEditing(false);
      fetchBadges();
    } catch (err) {
      if (err.response && err.response.data) {
        alert('Lỗi: ' + (err.response.data.message || JSON.stringify(err.response.data)));
      } else {
        alert('Có lỗi xảy ra!');
      }
    }
  };

  const handleEdit = badge => {
    setForm({
      name: badge.name || '',
      description: badge.description || '',
      condition: badge.condition || '',
      type: badge.type || '',
      score: badge.score || '',
      icon: badge.icon || '',
      iconUrl: badge.iconUrl || '',
      id: badge.id
    });
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
    setForm({ name: '', description: '', condition: '', type: '', score: '', icon: 'leaf', iconUrl: '', id: null });
    setEditing(false);
  };

  return (
    <div style={{padding:32}}>
      <h2>Quản lý Huy hiệu</h2>
      <form onSubmit={handleSubmit} style={{marginBottom:24, display:'flex', alignItems:'center', flexWrap:'wrap'}}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên huy hiệu" required style={{marginRight:8}} />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" style={{marginRight:8}} />
        <input name="condition" value={form.condition} onChange={handleChange} placeholder="Điều kiện đạt (số)" type="number" min="0" style={{marginRight:8}} />
        <select name="type" value={form.type} onChange={handleChange} style={{marginRight:8}} required>
          <option value="">Chọn loại huy hiệu</option>
          <option value="non-smoking">Không hút thuốc</option>
          <option value="stage-completion">Hoàn thành giai đoạn</option>
        </select>
        <input name="score" value={form.score} onChange={handleChange} placeholder="Điểm" type="number" min="0" style={{marginRight:8}} />
        <input name="iconUrl" type="file" accept="image/*" onChange={handleChange} style={{marginRight:8}} />
        {form.iconUrl && (
          <img src={form.iconUrl} alt="icon preview" style={{width:32, height:32, objectFit:'contain', marginRight:8}} />
        )}
        <button type="submit">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" onClick={handleCancel} style={{marginLeft:8}}>Hủy</button>}
      </form>
      {loading ? <div>Đang tải...</div> : (
        <table border="1" cellPadding="8" style={{width:'100%',background:'#fff'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên huy hiệu</th>
              <th>Mô tả</th>
              <th>Điều kiện đạt</th>
              <th>Loại</th>
              <th>Điểm</th>
              <th>Icon</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {badges.map(badge => (
              <tr key={badge.id}>
                <td>{badge.id}</td>
                <td>{badge.name}</td>
                <td>{badge.description}</td>
                <td>{badge.condition}</td>
                <td>{badge.type}</td>
                <td>{badge.score}</td>
                <td style={{fontSize:24, textAlign:'center'}}>
                  {badge.iconUrl ? (
                    <img src={badge.iconUrl} alt="icon" style={{width:32, height:32, objectFit:'contain'}} />
                  ) : (
                    <span style={{color:'#ccc'}}>Không có ảnh</span>
                  )}
                </td>
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
