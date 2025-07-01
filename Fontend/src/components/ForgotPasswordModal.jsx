import React, { useState } from 'react';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const maskEmail = (email) => {
  const [user, domain] = email.split('@');
  if (user.length < 5) return email;
  const first2 = user.slice(0, 2);
  const last3 = user.slice(-3);
  return `${first2}*****${last3}@${domain}`;
};

const ForgotPasswordModal = ({ show, onClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  
  const canSendOtp = () => {
    const key = `otp_limit_${email}`;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    const now = Date.now();
    if (!data.firstTime || now - data.firstTime > 24 * 60 * 60 * 1000) {
      
      localStorage.setItem(key, JSON.stringify({ count: 0, firstTime: now }));
      return true;
    }
    if (data.count >= 5) return false;
    return true;
  };

  const increaseOtpCount = () => {
    const key = `otp_limit_${email}`;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    const now = Date.now();
    if (!data.firstTime || now - data.firstTime > 24 * 60 * 60 * 1000) {
      localStorage.setItem(key, JSON.stringify({ count: 1, firstTime: now }));
    } else {
      localStorage.setItem(key, JSON.stringify({ count: (data.count || 0) + 1, firstTime: data.firstTime }));
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Vui lòng nhập email.');
    if (!canSendOtp()) {
      setError('Bạn đã gửi quá 5 lần. Vui lòng thử lại sau 24 giờ.');
      return;
    }
    try {
      const res = await axios.post('/api/password/forgot', { email });
      if (res.data && res.data.status === 'success') {
        setMaskedEmail(maskEmail(email));
        setOtpSent(true);
        setError('');
        increaseOtpCount();
      } else {
        setError(res.data?.message || 'Không gửi được mã OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không gửi được mã OTP.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!enteredOtp) return setError('Vui lòng nhập mã OTP.');
    try {
      const res = await axios.get('/api/password/validate-code', { params: { code: enteredOtp } });
      if (res.data && res.data.status === 'success' && res.data.data === true) {
        setOtpVerified(true);
        setError('');
      } else {
        setError('Mã OTP không đúng hoặc đã hết hạn.');
      }
    } catch (err) {
      setError('Mã OTP không đúng hoặc đã hết hạn.');
    }
  };

  
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không trùng khớp.');
      return;
    }
    try {
      const res = await axios.post('/api/password/reset', {
        code: enteredOtp,
        newPassword,
      });
      if (res.data && res.data.status === 'success') {
        alert('Mật khẩu đã được cập nhật!');
        onClose();
      } else {
        setError(res.data?.message || 'Không thể cập nhật mật khẩu.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật mật khẩu.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setMaskedEmail('');
    setOtpSent(false);
    setOtp('');
    setEnteredOtp('');
    setOtpVerified(false);
    setError('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleBack = () => {
    handleClose();
    setTimeout(() => {
      navigate('/login');
    }, 200);
  };

 
  const handleBackStep = () => {
    if (otpSent && !otpVerified) {
      
      handleClose();
      setTimeout(() => {
        navigate(-1);
      }, 200);
    } else if (otpVerified) {
      
      handleClose();
      setTimeout(() => {
        navigate('/login');
      }, 200);
    }
  };

  if (!show) return null;

  return (
    <Modal title="Quên mật khẩu" onClose={handleClose}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 260 }}>
        {!otpSent ? (
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <label style={{ marginBottom: 6, fontWeight: 500 }}>Nhập email đăng ký:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '220px', margin: '8px 0', padding: '8px', borderRadius: 5, border: '1px solid #b5b5b5', fontSize: 15 }}
            />
            {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button type="submit" style={{ padding: '8px 18px', borderRadius: 5, background: '#4CAF50', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Gửi mã OTP</button>
              <button type="button" onClick={handleBack} style={{ padding: '8px 18px', borderRadius: 5, background: '#ccc', color: '#222', border: 'none', fontWeight: 500, cursor: 'pointer' }}>Quay lại</button>
            </div>
          </form>
        ) : !otpVerified ? (
          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <p style={{ marginBottom: 8, fontSize: 15 }}>OTP đã gửi tới email: <strong>{maskedEmail}</strong></p>
            <label style={{ marginBottom: 6, fontWeight: 500 }}>Nhập mã OTP:</label>
            <input
              type="text"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              required
              style={{ width: '120px', margin: '8px 0', padding: '8px', borderRadius: 5, border: '1px solid #b5b5b5', fontSize: 15, textAlign: 'center', letterSpacing: 2 }}
            />
            {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
            <div style={{ marginTop: 10, marginBottom: 4, textAlign: 'center' }}>
              <span style={{ fontSize: 14 }}>Bạn không nhận được mã?</span>
              <button type="button" onClick={async () => {
                if (!canSendOtp()) {
                  setError('Bạn đã gửi quá 5 lần. Vui lòng thử lại sau 24 giờ.');
                  return;
                }
                try {
                  const res = await axios.post('/api/password/forgot', { email });
                  if (res.data && res.data.status === 'success') {
                    setError('Đã gửi lại mã OTP!');
                    increaseOtpCount();
                  } else {
                    setError(res.data?.message || 'Không gửi lại được mã OTP.');
                  }
                } catch (err) {
                  setError(err.response?.data?.message || 'Không gửi lại được mã OTP.');
                }
                setEnteredOtp('');
              }} style={{ marginLeft: 8, padding: '4px 12px', borderRadius: 5, background: '#4CAF50', color: '#fff', border: 'none', fontWeight: 500, cursor: 'pointer', fontSize: 14 }}>Gửi lại OTP</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button type="submit" style={{ padding: '8px 18px', borderRadius: 5, background: '#4CAF50', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Xác nhận OTP</button>
              <button type="button" onClick={handleBackStep} style={{ padding: '8px 18px', borderRadius: 5, background: '#ccc', color: '#222', border: 'none', fontWeight: 500, cursor: 'pointer' }}>Quay lại</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <label style={{ marginBottom: 6, fontWeight: 500 }}>Nhập mật khẩu mới:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ width: '180px', margin: '8px 0', padding: '8px', borderRadius: 5, border: '1px solid #b5b5b5', fontSize: 15 }}
            />
            <label style={{ marginBottom: 6, fontWeight: 500 }}>Xác nhận mật khẩu:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '180px', margin: '8px 0', padding: '8px', borderRadius: 5, border: '1px solid #b5b5b5', fontSize: 15 }}
            />
            {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button type="submit" style={{ padding: '8px 18px', borderRadius: 5, background: '#4CAF50', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cập nhật mật khẩu</button>
              <button type="button" onClick={handleBackStep} style={{ padding: '8px 18px', borderRadius: 5, background: '#ccc', color: '#222', border: 'none', fontWeight: 500, cursor: 'pointer' }}>Quay lại</button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
