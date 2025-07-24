import React, { useEffect, useState } from 'react';
import { FaLeaf, FaSeedling, FaTree, FaSun, FaHeart, FaSmile } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AdminBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', condition: '', type: '', score: '', icon: 'leaf', iconUrl: '', id: null });
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
 
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

  // Regex: chỉ cho phép chữ, số, khoảng trắng
  const validText = value => /^[a-zA-Z0-9\sÀ-ỹ]+$/.test(value);

  const validateField = (name, value, typeValue) => {
    switch (name) {
      case 'name':
        if (!value || value.trim() === '') return 'Tên huy hiệu không được bỏ trống.';
        if (value.length < 5) return 'Tên huy hiệu phải có ít nhất 5 ký tự.';
        if (value.length > 50) return 'Tên huy hiệu tối đa 50 ký tự.';
        if (!validText(value)) return 'Tên huy hiệu không được chứa ký tự đặc biệt.';
        return '';
      case 'description':
        if (!value || value.trim() === '') return 'Mô tả không được bỏ trống.';
        if (value.length < 5) return 'Mô tả phải có ít nhất 5 ký tự.';
        if (!validText(value)) return 'Mô tả không được chứa ký tự đặc biệt.';
        return '';
      case 'type':
        if (!value || value === '') return 'Bạn chưa chọn loại huy hiệu.';
        return '';
      case 'score':
        if (!value || value.trim() === '') return 'Điểm không được bỏ trống.';
        if (!/^[1-9][0-9]*$/.test(value)) return 'Điểm phải là số nguyên dương.';
        if (Number(value) < 5) return 'Điểm phải ít nhất là 5.';
        if (Number(value) > 50) return 'Điểm tối đa là 50.';
        return '';
      case 'condition':
        if (!value || value.trim() === '') return 'Điều kiện không được bỏ trống.';
        if (!/^[1-9][0-9]*$/.test(value)) return 'Điều kiện phải là số nguyên dương.';
        if (typeValue === 'stage-completion') {
          if (Number(value) < 1 || Number(value) > 3) return 'Điều kiện cho loại "Hoàn thành giai đoạn" phải từ 1 đến 3.';
        } else {
          if (Number(value) < 1) return 'Điều kiện phải ít nhất là 1.';
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    let newValue = value;
    if (name === 'iconUrl' && type === 'file' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, iconUrl: reader.result }));
      };
      reader.readAsDataURL(files[0]);
      return;
    }
    // Validate field
    let errorMsg = validateField(name, newValue, name === 'condition' ? form.type : form.type);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    setForm({ ...form, [name]: newValue });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Validate all fields
    const newErrors = {};
    newErrors.name = validateField('name', form.name);
    newErrors.type = validateField('type', form.type);
    newErrors.description = validateField('description', form.description);
    newErrors.condition = validateField('condition', form.condition, form.type);
    newErrors.score = validateField('score', form.score);
    setErrors(newErrors);
    // Nếu có lỗi, không submit
    if (Object.values(newErrors).some(msg => msg)) return;

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
        setSuccessMsg('Cập nhật huy hiệu thành công!');
      } else {
        await axios.post('/api/badges/Create', badgeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMsg('Thêm mới huy hiệu thành công!');
      }
      setForm({ name: '', description: '', condition: '', type: '', score: '', icon: 'leaf', iconUrl: '', id: null });
      setEditing(false);
      setErrors({});
      fetchBadges();
      setTimeout(() => setSuccessMsg(''), 10000);
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: 'Có lỗi xảy ra!' }));
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
          flexDirection: 'column',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px #0001',
          padding: 24,
          gap: 16,
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Tên huy hiệu" style={{ borderRadius: 6, border: '1px solid #cbd5e1', padding: 10, fontSize: 16, width: '100%' }} />
          <span style={{ minHeight: 18, display: 'block' }}>{errors.name && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.name}</span>}</span>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <input name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" style={{ borderRadius: 6, border: '1px solid #cbd5e1', padding: 10, fontSize: 16, width: '100%' }} />
          <span style={{ minHeight: 18, display: 'block' }}>{errors.description && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.description}</span>}</span>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <input name="condition" value={form.condition} onChange={handleChange} placeholder="Điều kiện đạt (số)" type="number" min="0" style={{ borderRadius: 6, border: '1px solid #cbd5e1', padding: 10, fontSize: 16, width: '100%' }} />
          <span style={{ minHeight: 18, display: 'block' }}>{errors.condition && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.condition}</span>}</span>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <select name="type" value={form.type} onChange={handleChange} style={{ borderRadius: 6, border: '1px solid #cbd5e1', padding: 10, fontSize: 16, color: '#000', background: '#fff', width: '100%' }}>
            <option value="">Chọn loại huy hiệu</option>
            <option value="non-smoking">Không hút thuốc</option>
            <option value="stage-completion">Hoàn thành giai đoạn</option>
          </select>
          <span style={{ minHeight: 18, display: 'block' }}>{errors.type && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.type}</span>}</span>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <input name="score" value={form.score} onChange={handleChange} placeholder="Điểm" type="number" min="0" style={{ borderRadius: 6, border: '1px solid #cbd5e1', padding: 10, fontSize: 16, width: '100%' }} />
          <span style={{ minHeight: 18, display: 'block' }}>{errors.score && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.score}</span>}</span>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <input name="iconUrl" type="file" accept="image/*" onChange={handleChange} style={{ marginBottom: 8 }} />
          {form.iconUrl && (
            <img src={form.iconUrl} alt="icon preview" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px #0001', marginBottom: 4 }} />
          )}
        </div>
        <span style={{ minHeight: 18, display: 'block', width: '100%' }}>{errors.submit && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.submit}</span>}</span>
        {successMsg && <span style={{ color: '#22c55e', fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{successMsg}</span>}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            type="submit"
            style={{
              background: editing ? '#f59e42' : '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '10px 24px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
              boxShadow: '0 1px 4px #0001',
              fontSize: 16,
            }}
          >
            {editing ? 'Cập nhật' : 'Thêm mới'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={handleCancel}
              style={{
                background: '#e11d48',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 24px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
                boxShadow: '0 1px 4px #0001',
                fontSize: 16,
              }}
            >
              Hủy
            </button>
          )}
        </div>
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
                <th style={{ minWidth: 40, textAlign: 'center', verticalAlign: 'middle' }}>ID</th>
                <th style={{ minWidth: 120, textAlign: 'left', verticalAlign: 'middle' }}>Tên huy hiệu</th>
                <th style={{ minWidth: 180, textAlign: 'left', verticalAlign: 'middle' }}>Mô tả</th>
                <th style={{ minWidth: 80, textAlign: 'center', verticalAlign: 'middle' }}>Điều kiện đạt</th>
                <th style={{ minWidth: 120, textAlign: 'center', verticalAlign: 'middle' }}>Loại</th>
                <th style={{ minWidth: 60, textAlign: 'center', verticalAlign: 'middle' }}>Điểm</th>
                <th style={{ minWidth: 70, textAlign: 'center', verticalAlign: 'middle' }}>Icon</th>
                <th style={{ minWidth: 120, textAlign: 'center', verticalAlign: 'middle' }}>Hành động</th>
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
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{badge.id}</td>
                  <td style={{ fontWeight: 600, verticalAlign: 'middle' }}>{badge.name}</td>
                  <td style={{ verticalAlign: 'middle' }}>{badge.description}</td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{badge.condition}</td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <span
                      style={{
                        background: badge.type === 'non-smoking' ? '#22d3ee' : '#fbbf24',
                        color: '#fff',
                        borderRadius: 12,
                        padding: '4px 12px',
                        fontWeight: 600,
                        fontSize: 14,
                        boxShadow: '0 1px 4px #0001',
                        display: 'inline-block',
                        minWidth: 110,
                        textAlign: 'center',
                      }}
                    >
                      {badge.type === 'non-smoking' ? 'Không hút thuốc' : badge.type === 'stage-completion' ? 'Hoàn thành giai đoạn' : badge.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{badge.score}</td>
                  <td style={{ fontSize: 28, textAlign: 'center', verticalAlign: 'middle' }}>
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
                        margin: '0 auto',
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
                        margin: '0 auto',
                      }}>{iconOptions[badge.icon] || '🏅'}</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
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
                          marginRight: 0,
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
                    </div>
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
