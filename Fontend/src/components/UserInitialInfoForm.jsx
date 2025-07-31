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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    
    // Validate number fields to only allow positive integers with limits
    if (name === 'yearsSmoking' || name === 'cigarettesPerDay') {
      // Only allow digits (no decimal, no negative, no scientific notation)
      if (value === '' || /^\d+$/.test(value)) {
        const numValue = parseInt(value);
        
        // Set reasonable limits
        if (name === 'yearsSmoking') {
          // Limit years of smoking to 60 years (reasonable human lifespan)
          if (value === '' || (numValue >= 0 && numValue <= 60)) {
            setForm({ ...form, [name]: value });
          }
        } else if (name === 'cigarettesPerDay') {
          // Limit cigarettes per day to 100 (physically unrealistic beyond this)
          if (value === '' || (numValue >= 0 && numValue <= 100)) {
            setForm({ ...form, [name]: value });
          }
        }
      }
      return;
    }
    
    setForm({ ...form, [name]: value });
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
      setShowWelcomeModal(true);
    } catch (err) {
      setError('Gửi thông tin thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    onSuccess?.();
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
              Số năm hút thuốc (tối đa 60 năm)
            </label>
            <div className="field-input-container">
              <input 
                id="yearsSmoking"
                className="field-input field-input-number"
                name="yearsSmoking" 
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                max={60}
                value={form.yearsSmoking} 
                onChange={handleChange} 
                placeholder="Ví dụ: 5"
                required 
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="cigarettesPerDay">
              Số điếu hút mỗi ngày (tối đa 100 điếu)
            </label>
            <div className="field-input-container">
              <input 
                id="cigarettesPerDay"
                className="field-input field-input-number"
                name="cigarettesPerDay" 
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                max={100}
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

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #ffffff, #f0fdf4)',
            borderRadius: 24,
            boxShadow: '0 25px 80px rgba(34,197,94,0.15), 0 10px 40px rgba(0,0,0,0.1)',
            padding: '48px 56px',
            minWidth: 420,
            maxWidth: 600,
            textAlign: 'center',
            border: '1px solid rgba(34,197,94,0.1)',
            position: 'relative',
            transform: 'scale(1)',
            animation: 'welcomeModalIn 0.4s ease-out',
          }}>
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #ffffffff, #0fe656ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(34,197,94,0.3)',
            }}>
              <span style={{ fontSize: '28px' }}>🎉</span>
            </div>

            {/* Welcome content */}
            <div style={{ marginTop: '32px' }}>
              <h2 style={{
                color: '#1e293b',
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '16px',
                lineHeight: '1.2',
              }}>
                Chào mừng bạn đến với NoSmoke!
              </h2>
              
              <p style={{
                color: '#64748b',
                fontSize: '18px',
                fontWeight: '500',
                lineHeight: '1.5',
                marginBottom: '24px',
              }}>
                Cảm ơn bạn đã chia sẻ thông tin. Hành trình cai thuốc lá của bạn chính thức bắt đầu từ hôm nay!
              </p>

              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '32px',
                border: '1px solid #bbf7d0',
              }}>
                <p style={{
                  color: '#15803d',
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0',
                  lineHeight: '1.4',
                }}>
                  💪 Bạn đã thực hiện bước đầu tiên quan trọng nhất!
                  <br />
                  🎯 Chúng tôi sẽ đồng hành cùng bạn trên con đường này.
                </p>
              </div>

              <button
                onClick={handleWelcomeClose}
                style={{
                  background: 'linear-gradient(145deg, #22c55e, #16a34a)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
                  letterSpacing: '0.5px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(34,197,94,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(34,197,94,0.3)';
                }}
              >
                Bắt đầu hành trình 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes welcomeModalIn {
          from {
            opacity: 0;
            transform: scale(0.85) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default UserInitialInfoForm;