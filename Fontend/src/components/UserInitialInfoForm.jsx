import React, { useState } from 'react';
import axios from 'axios';
import './UserInitialInfoForm.css';

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
    <div className="user-initial-info-container">
      <form className="user-initial-info-form" onSubmit={handleSubmit}>
        {/* Progress bar moved to top */}
        <div className="form-progress">
          <div className="progress-bar"></div>
        </div>

        <div className="form-header">
          <h2 className="form-title">Khai báo thông tin ban đầu</h2>
          <p className="form-subtitle">Bước đầu tiên trên hành trình cai thuốc của bạn</p>
        </div>

        <div className="form-fields">
          <div className="field-group">
            <label className="field-label" htmlFor="yearsSmoking">
              Số năm hút thuốc
            </label>
            <div className="field-input-container">
              <input 
                id="yearsSmoking"
                className="field-input field-input-number"
                name="yearsSmoking" 
                type="number" 
                min={0} 
                value={form.yearsSmoking} 
                onChange={handleChange} 
                placeholder="Ví dụ: 5"
                required 
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="cigarettesPerDay">
              Số điếu hút mỗi ngày
            </label>
            <div className="field-input-container">
              <input 
                id="cigarettesPerDay"
                className="field-input field-input-number"
                name="cigarettesPerDay" 
                type="number" 
                min={0} 
                value={form.cigarettesPerDay} 
                onChange={handleChange} 
                placeholder="Ví dụ: 10"
                required 
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="reasonToQuit">
              Lý do muốn cai thuốc
            </label>
            <div className="field-input-container">
              <textarea 
                id="reasonToQuit"
                className="field-input field-input-textarea"
                name="reasonToQuit" 
                value={form.reasonToQuit} 
                onChange={handleChange} 
                placeholder="Ví dụ: Vì sức khỏe, gia đình..."
                rows={3}
                required 
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="healthStatus">
              Tình trạng sức khỏe hiện tại
            </label>
            <div className="field-input-container">
              <textarea 
                id="healthStatus"
                className="field-input field-input-textarea field-input-health"
                name="healthStatus" 
                value={form.healthStatus} 
                onChange={handleChange} 
                placeholder="Ví dụ: Ho, khó thở, mệt mỏi..."
                rows={3}
                required 
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className={`submit-btn ${loading ? 'submit-btn-loading' : ''}`}
            disabled={loading}
          >
            <span className="submit-btn-text">
              {loading ? 'Đang gửi...' : 'Xác nhận'}
            </span>
            {loading && <span className="submit-btn-spinner"></span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserInitialInfoForm;