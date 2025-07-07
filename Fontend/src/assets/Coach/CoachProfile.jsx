import React, { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaLock, FaSave, FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import './CoachProfile.css';

const CoachProfile = () => {
  const [coachData, setCoachData] = useState({
    id: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    qualification: '',
    experience: '',
    specialization: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    resetCode: ''
  });

  const [resetStep, setResetStep] = useState(1); // 1: Request reset, 2: Enter code & new password

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const API_BASE_URL = 'http://localhost:8080/api/coach';
  const PASSWORD_API_URL = 'http://localhost:8080/api/password';

  useEffect(() => {
    fetchCoachProfile();
  }, []);

  const fetchCoachProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        setCoachData(response.data.data);
      } else {
        setError('Không thể tải thông tin hồ sơ');
      }
    } catch (error) {
      console.error('Error fetching coach profile:', error);
      setError('Lỗi khi tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!coachData.fullName.trim()) {
      setError('Họ tên không được để trống');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const updateData = {
        fullName: coachData.fullName.trim(),
        phoneNumber: coachData.phoneNumber.trim(),
        qualification: coachData.qualification.trim(),
        experience: coachData.experience.trim(),
        specialization: coachData.specialization.trim(),
        bio: coachData.bio.trim()
      };

      const response = await axios.put(`${API_BASE_URL}/update`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        setCoachData(response.data.data);
        setSuccess('Cập nhật hồ sơ thành công!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Lỗi khi cập nhật hồ sơ');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (resetStep === 1) {
      // Step 1: Request password reset
      try {
        setUpdating(true);
        setError('');
        
        const response = await axios.post(`${PASSWORD_API_URL}/forgot`, {
          email: coachData.email
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.status === 'success') {
          setSuccess('Mã reset đã được gửi đến email của bạn!');
          setResetStep(2);
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(response.data.message || 'Có lỗi xảy ra khi gửi mã reset');
        }
      } catch (error) {
        console.error('Error requesting password reset:', error);
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError('Lỗi khi gửi yêu cầu reset mật khẩu');
        }
      } finally {
        setUpdating(false);
      }
    } else {
      // Step 2: Reset password with code
      if (!passwordData.resetCode || !passwordData.newPassword || !passwordData.confirmPassword) {
        setError('Vui lòng điền đầy đủ thông tin');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
      }

      try {
        setUpdating(true);
        setError('');
        
        const response = await axios.post(`${PASSWORD_API_URL}/reset`, {
          code: passwordData.resetCode,
          newPassword: passwordData.newPassword
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.status === 'success') {
          setSuccess('Đổi mật khẩu thành công!');
          setShowPasswordModal(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', resetCode: '' });
          setResetStep(1);
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(response.data.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError('Lỗi khi đổi mật khẩu');
        }
      } finally {
        setUpdating(false);
      }
    }
  };

  const validateResetCode = async (code) => {
    if (!code) return false;
    
    try {
      const response = await axios.get(`${PASSWORD_API_URL}/validate-code`, {
        params: { code },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data.status === 'success' && response.data.data === true;
    } catch (error) {
      console.error('Error validating code:', error);
      return false;
    }
  };

  const handleResetCodeChange = async (value) => {
    setPasswordData(prev => ({...prev, resetCode: value}));
    
    // Validate code when user finishes typing (6 characters)
    if (value.length === 6) {
      const isValid = await validateResetCode(value);
      if (!isValid) {
        setError('Mã xác thực không hợp lệ hoặc đã hết hạn');
      } else {
        setError('');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setCoachData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    fetchCoachProfile(); // Reload original data
    setError('');
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', resetCode: '' });
    setResetStep(1);
    setError('');
  };

  if (loading) {
    return <div className="loading">Đang tải thông tin hồ sơ...</div>;
  }

  return (
    <div className="coach-profile-container">
      <div className="profile-header">
        <h2>Hồ Sơ Cá Nhân</h2>
        <div className="profile-actions">
          {!isEditing ? (
            <>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                <FaEdit /> Chỉnh sửa
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
                <FaLock /> Đổi mật khẩu
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-success" onClick={handleUpdateProfile} disabled={updating}>
                <FaSave /> {updating ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button className="btn btn-secondary" onClick={handleCancelEdit}>
                Hủy
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-content">
        <div className="profile-avatar">
          <div className="avatar-placeholder">
            <FaUser size={60} />
          </div>
          <h3>{coachData.fullName}</h3>
          <p className="coach-title">Coach Chuyên Nghiệp</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                type="text"
                value={coachData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={coachData.email}
                disabled
                className="disabled-input"
              />
              <small>Email không thể thay đổi</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                value={coachData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                disabled={!isEditing}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="form-group">
              <label>Kinh nghiệm (năm)</label>
              <input
                type="text"
                value={coachData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                disabled={!isEditing}
                placeholder="Ví dụ: 5 năm"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bằng cấp</label>
              <input
                type="text"
                value={coachData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                disabled={!isEditing}
                placeholder="Ví dụ: Bác sĩ, Chuyên gia tâm lý..."
              />
            </div>
            <div className="form-group">
              <label>Chuyên môn</label>
              <input
                type="text"
                value={coachData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                disabled={!isEditing}
                placeholder="Ví dụ: Cai thuốc lá, Tâm lý..."
              />
            </div>
          </div>

          <div className="form-group">
            <label>Giới thiệu bản thân</label>
            <textarea
              value={coachData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              rows="4"
              placeholder="Viết một đoạn giới thiệu về bản thân và kinh nghiệm..."
            />
          </div>
        </form>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{resetStep === 1 ? 'Yêu cầu đổi mật khẩu' : 'Nhập mã xác thực'}</h3>
              <button className="btn-close" onClick={handleClosePasswordModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="modal-body">
                <div className="step-indicator">
                  <div className={`step ${resetStep === 1 ? 'active' : 'completed'}`}>1</div>
                  <div className={`step ${resetStep === 2 ? 'active' : 'inactive'}`}>2</div>
                </div>

                {resetStep === 1 ? (
                  <div className="reset-step-1">
                    <p>Một mã xác thực sẽ được gửi đến email của bạn để đổi mật khẩu.</p>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={coachData.email}
                        disabled
                        className="disabled-input"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="reset-step-2">
                    <div className="form-group">
                      <label>Mã xác thực *</label>
                      <input
                        type="text"
                        value={passwordData.resetCode}
                        onChange={(e) => handleResetCodeChange(e.target.value)}
                        required
                        placeholder="Nhập mã 6 ký tự từ email"
                        maxLength="6"
                      />
                      <small>Kiểm tra email của bạn để lấy mã xác thực</small>
                    </div>

                    <div className="form-group">
                      <label>Mật khẩu mới *</label>
                      <div className="password-input">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                          required
                          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                          minLength="6"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Xác nhận mật khẩu mới *</label>
                      <div className="password-input">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                          required
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                {resetStep === 1 ? (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={handleClosePasswordModal}>
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={updating}>
                      {updating ? 'Đang gửi...' : 'Gửi mã xác thực'}
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={() => setResetStep(1)}>
                      Quay lại
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={updating}>
                      {updating ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachProfile;
