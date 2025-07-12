import React, { useState } from 'react';
import axios from 'axios';

const UserInitialInfoForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    yearsSmoking: '',
    cigarettesPerDay: '',
    reasonToQuit: '',
    healthStatus: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5175/api/member-initial-info', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess?.();
    } catch (err) {
      setError('Gửi thông tin thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="user-initial-info-form" onSubmit={handleSubmit}>
      <h2>Khai báo thông tin ban đầu</h2>
      <label>Số năm hút thuốc</label>
      <input name="yearsSmoking" type="number" min={0} value={form.yearsSmoking} onChange={handleChange} required />
      <label>Số điếu hút mỗi ngày</label>
      <input name="cigarettesPerDay" type="number" min={0} value={form.cigarettesPerDay} onChange={handleChange} required />
      <label>Lý do muốn cai thuốc</label>
      <input name="reasonToQuit" type="text" value={form.reasonToQuit} onChange={handleChange} required />
      <label>Tình trạng sức khỏe hiện tại</label>
      <input name="healthStatus" type="text" value={form.healthStatus} onChange={handleChange} required />
      {error && <div style={{color:'red'}}>{error}</div>}
      <button type="submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Xác nhận'}</button>
    </form>
  );
};

export default UserInitialInfoForm;