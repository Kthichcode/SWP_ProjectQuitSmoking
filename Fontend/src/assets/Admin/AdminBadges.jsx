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
    <div style={{ padding: 32, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', minHeight: '100vh' }}>
      <h2 style={{ color: '#3b82f6', marginBottom: 24, fontWeight: 700, fontSize: 32, letterSpacing: 1 }}>Quản lý Huy hiệu</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px #0001',
          padding: 16,
          gap: 12
        }}
      >
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên huy hiệu" required style={{ marginRight: 8, borderRadius: 6, border: '1px solid #cbd5e1', padding: 8 }} />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" style={{ marginRight: 8, borderRadius: 6, border: '1px solid #cbd5e1', padding: 8 }} />
        <input name="condition" value={form.condition} onChange={handleChange} placeholder="Điều kiện đạt (số)" type="number" min="0" style={{ marginRight: 8, borderRadius: 6, border: '1px solid #cbd5e1', padding: 8, width: 120 }} />
        <select name="type" value={form.type} onChange={handleChange} style={{ marginRight: 8, borderRadius: 6, border: '1px solid #cbd5e1', padding: 8, width: 170 }} required>
          <option value="">Chọn loại huy hiệu</option>
          <option value="non-smoking">Không hút thuốc</option>
          <option value="stage-completion">Hoàn thành giai đoạn</option>
        </select>
        <input name="score" value={form.score} onChange={handleChange} placeholder="Điểm" type="number" min="0" style={{ marginRight: 8, borderRadius: 6, border: '1px solid #cbd5e1', padding: 8, width: 90 }} />
        <input name="iconUrl" type="file" accept="image/*" onChange={handleChange} style={{ marginRight: 8 }} />
        {form.iconUrl && (
          <img src={form.iconUrl} alt="icon preview" style={{ width: 32, height: 32, objectFit: 'contain', marginRight: 8, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px #0001' }} />
        )}
        <button
          type="submit"
          style={{
            background: editing ? '#f59e42' : '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 18px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
            boxShadow: '0 1px 4px #0001',
          }}
        >
          {editing ? 'Cập nhật' : 'Thêm mới'}
        </button>
        {editing && (
          <button
            type="button"
            onClick={handleCancel}
            style={{
              marginLeft: 8,
              background: '#e11d48',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
              boxShadow: '0 1px 4px #0001',
            }}
          >
            Hủy
          </button>
        )}
      </form>
      {loading ? (
        <div style={{ color: '#64748b', fontWeight: 500, fontSize: 18 }}>Đang tải...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            border="0"
            cellPadding="8"
            style={{
              width: '100%',
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 12px #0001',
              borderCollapse: 'separate',
              borderSpacing: 0,
              overflow: 'hidden',
              marginTop: 8
            }}
          >
            <thead style={{ background: '#f1f5f9' }}>
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
              {badges.map((badge, idx) => (
                <tr
                  key={badge.id}
                  style={{
                    background: idx % 2 === 0 ? '#f8fafc' : '#fff',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e0e7ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#f8fafc' : '#fff')}
                >
                  <td>{badge.id}</td>
                  <td style={{ fontWeight: 600 }}>{badge.name}</td>
                  <td>{badge.description}</td>
                  <td style={{ textAlign: 'center' }}>{badge.condition}</td>
                  <td>
                    <span
                      style={{
                        background: badge.type === 'non-smoking' ? '#22d3ee' : '#fbbf24',
                        color: '#fff',
                        borderRadius: 12,
                        padding: '4px 12px',
                        fontWeight: 600,
                        fontSize: 14,
                        boxShadow: '0 1px 4px #0001',
                      }}
                    >
                      {badge.type === 'non-smoking' ? 'Không hút thuốc' : badge.type === 'stage-completion' ? 'Hoàn thành giai đoạn' : badge.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{badge.score}</td>
                  <td style={{ fontSize: 28, textAlign: 'center' }}>
                    {badge.iconUrl ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #fff 60%, #e0e7ff 100%)',
                        border: '2px solid #e3e72bff',
                        boxShadow: '0 1px 4px #6366f11a',
                        overflow: 'hidden',
                      }}>
                        <img src={badge.iconUrl} alt="icon" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: '50%' }} />
                      </span>
                    ) : (
                      <span title="Không có ảnh" style={{
                        display: 'inline-block',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #fff 60%, #e0e7ff 100%)',
                        border: '2px solid #080806ff',
                        boxShadow: '0 1px 4px #6366f11a',
                        fontSize: 22,
                        color: '#a3a3a3',
                        lineHeight: '32px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        position: 'relative',
                      }}>{iconOptions[badge.icon] || '🏅'}</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(badge)}
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginRight: 6,
                        transition: 'background 0.2s',
                        boxShadow: '0 1px 4px #0001',
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(badge.id)}
                      style={{
                        background: '#e11d48',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        boxShadow: '0 1px 4px #0001',
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBadges;
