import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/CSS/Register.css';
import Modal from '../components/Modal';
import '../components/Modal.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordLengthError, setPasswordLengthError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Validate on change
    if (name === 'name') {
      let error = '';
      // Chỉ kiểm tra không được bỏ trống khi nhập
      setValidationErrors(prev => ({ ...prev, name: error }));
    }

    if (name === 'username') {
      let error = '';
      if (value.length < 5) error = 'Tên đăng nhập phải có ít nhất 5 ký tự.';
      else if (/\s/.test(value)) error = 'Tên đăng nhập không được chứa dấu cách.';
      else if (!/^[a-zA-Z0-9]+$/.test(value)) error = 'Tên đăng nhập không được chứa ký tự đặc biệt.';
      setValidationErrors(prev => ({ ...prev, username: error }));
    }

    if (name === 'email') {
      let error = '';
      if (value && !value.includes('@')) error = 'Email phải có dấu @.';
      setValidationErrors(prev => ({ ...prev, email: error }));
    }

    if (name === 'password') {
      let error = '';
      if (value.length < 6) error = 'Mật khẩu phải có ít nhất 6 ký tự.';
      setValidationErrors(prev => ({ ...prev, password: error }));
    }

    if (name === 'confirmPassword') {
      let error = '';
      if (value !== formData.password) error = 'Mật khẩu không khớp.';
      setValidationErrors(prev => ({ ...prev, confirmPassword: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setPasswordLengthError('');

    // Validate all fields
    const errors = {};
    
    // Validate name
    if (!formData.name) {
      errors.name = 'Họ và tên không được bỏ trống.';
    }
    
    // Validate username
    if (!formData.username) {
      errors.username = 'Tên đăng nhập không được bỏ trống.';
    } else if (formData.username.length < 5) {
      errors.username = 'Tên đăng nhập phải có ít nhất 5 ký tự.';
    } else if (/\s/.test(formData.username)) {
      errors.username = 'Tên đăng nhập không được chứa dấu cách.';
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      errors.username = 'Tên đăng nhập không được chứa ký tự đặc biệt.';
    }

    // Validate email
    if (!formData.email) {
      errors.email = 'Email không được bỏ trống.';
    } else if (!formData.email.includes('@')) {
      errors.email = 'Email phải có dấu @.';
    }

    // Validate password
    if (!formData.password) {
      errors.password = 'Mật khẩu không được bỏ trống.';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu không được bỏ trống.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu không khớp.';
    }

    // Check agreement
    if (!formData.agree) {
      errors.agree = 'Bạn chưa đồng ý với điều khoản.';
    }

    setValidationErrors(errors);

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      fullName: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password
    };

    try {
      const res = await fetch('http://localhost:5175/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("🎉 Đăng ký thành công! Đang chuyển hướng...");
        setTimeout(() => navigate('/login'), 1800);
      } else {
        setErrorMessage(data.message || "Đăng ký thất bại!");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Lỗi kết nối backend.");
    }
  };

  return (
    <div className="register-section" style={{position:'relative', overflow:'hidden'}}>
      
      <div className="register-cloud"></div>
      <div className="register-cloud register-cloud-2"></div>
      <div className="register-container">
        <div className="register-wrapper">
          <div className="register-header">
            <img src="/src/assets/img1/android-chrome-192x192.png" alt="Logo" className="logo" />
            <h2>NoSmoke</h2>
            <p>Bắt đầu hành trình không khói thuốc của bạn ngay hôm nay</p>
          </div>

          <div className="register-box">
            

            <form className="register-form" onSubmit={handleSubmit}>
              {successMessage && <div style={{color:'green',marginBottom:8,fontWeight:600}}>{successMessage}</div>}
              {errorMessage && <div style={{color:'red',marginBottom:8,fontWeight:600}}>{errorMessage}</div>}

              <div className="form-group">
                <label htmlFor="name">Họ và tên</label>
                <input type="text" name="name" id="name" placeholder="Nhập họ và tên"
                  value={formData.name} onChange={handleChange}  />
                <div style={{ minHeight: '20px', marginTop: '4px' }}>
                  {validationErrors.name && <span style={{ color: 'red', fontSize: '14px' }}>{validationErrors.name}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Tên Đăng Nhập</label>
                <input type="text" name="username" id="username" placeholder="Nhập Tên Đăng Nhập"
                  value={formData.username} onChange={handleChange}  />
                <div style={{ minHeight: '20px', marginTop: '4px' }}>
                  {validationErrors.username && <span style={{ color: 'red', fontSize: '14px' }}>{validationErrors.username}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" placeholder="example@gmail.com"
                  value={formData.email} onChange={handleChange}  />
                <div style={{ minHeight: '20px', marginTop: '4px', marginBottom: '20px', display: 'block', width: '100%' }}>
                  {validationErrors.email && <span style={{ color: 'red', fontSize: '14px' }}>{validationErrors.email}</span>}
                </div>
              </div>

              <div className="register-input-group" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="form-group half-width" style={{ position: 'relative', marginBottom: '30px', minWidth: '180px', flex: 1 }}>
                  <label htmlFor="password">Mật khẩu</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingRight: '36px' }}
                  />
                  <span
                    onClick={() => setShowPassword(prev => !prev)}
                    className="password-toggle-icon"
                    tabIndex={0}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                  </span>
                  <div style={{ minHeight: '20px', marginTop: '4px', marginBottom: '0', display: 'block', width: '100%' }}>
                    {validationErrors.password && <span style={{ color: 'red', fontSize: '14px' }}>{validationErrors.password}</span>}
                  </div>
                </div>

                <div className="form-group half-width" style={{ position: 'relative', marginBottom: '30px', minWidth: '180px', flex: 1 }}>
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ paddingRight: '36px' }}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="password-toggle-icon"
                    tabIndex={0}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                  </span>
                  <div style={{ minHeight: '20px', marginTop: '4px', marginBottom: '0', display: 'block', width: '100%' }}>
                    {validationErrors.confirmPassword && <span style={{ color: 'red', fontSize: '14px' }}>{validationErrors.confirmPassword}</span>}
                  </div>
                </div>
              </div>

              <div className="register-checkbox" style={{ marginTop: '10px' }}>
                <label htmlFor="agree">
                  <input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} />
                  <span className="custom-box"></span>
                  Tôi đồng ý với <a href="#" onClick={e => { e.preventDefault(); setShowTermsModal(true); }}>Điều khoản sử dụng</a> và <a href="#" onClick={e => { e.preventDefault(); setShowPrivacyModal(true); }}>Chính sách bảo mật</a>
                </label>
                {validationErrors.agree && (
                  <div style={{ color: 'red', marginTop: 4, fontSize: '14px' }}>{validationErrors.agree}</div>
                )}
              </div>

              <button type="submit" className="register-button">Đăng ký</button>

              <p className="register-login">Đã có tài khoản? <a href="/login" onClick={e => { e.preventDefault(); navigate('/login'); }}>Đăng nhập ngay</a></p>
            </form>
          </div>
        </div>
      </div>

      
      {showTermsModal && (
  <Modal title="Điều khoản sử dụng" onClose={() => setShowTermsModal(false)}>
    <h4>1. Mục đích sử dụng</h4>
    <p>
      Nền tảng được phát triển nhằm hỗ trợ người dùng trong hành trình cai thuốc lá, bao gồm việc lập kế hoạch bỏ thuốc, theo dõi tiến trình, nhận thông báo động viên và kết nối cộng đồng.
    </p>

    <h4>2. Trách nhiệm của người dùng</h4>
    <ul>
      <li>Không cung cấp thông tin sai lệch khi đăng ký tài khoản.</li>
      <li>Không đăng tải nội dung gây hại, xúc phạm, hoặc trái pháp luật.</li>
      <li>Không sử dụng nền tảng cho mục đích gian lận hoặc thương mại trái phép.</li>
    </ul>

    <h4>3. Quyền của nền tảng</h4>
    <ul>
      <li>Có quyền khóa tài khoản nếu người dùng vi phạm điều khoản.</li>
      <li>Có thể thay đổi nội dung và chức năng mà không cần báo trước.</li>
    </ul>

    <h4>4. Miễn trừ trách nhiệm</h4>
    <p>
      Nền tảng không thay thế tư vấn y tế chuyên môn. Người dùng nên tham khảo bác sĩ nếu cần hỗ trợ y tế cụ thể.
    </p>
  </Modal>
)}


      
      {showPrivacyModal && (
  <Modal title="Chính sách bảo mật" onClose={() => setShowPrivacyModal(false)}>
    <h4>1. Thông tin thu thập</h4>
    <p>Chúng tôi có thể thu thập các thông tin sau:</p>
    <ul>
      <li>Họ tên, email, tên đăng nhập, mật khẩu</li>
      <li>Thông tin tiến trình cai thuốc</li>
      <li>Thông tin hành vi sử dụng (ẩn danh)</li>
    </ul>

    <h4>2. Mục đích sử dụng thông tin</h4>
    <ul>
      <li>Cung cấp và cải thiện dịch vụ</li>
      <li>Gửi thông báo, lời nhắc và lời khuyên</li>
      <li>Hỗ trợ kỹ thuật và phản hồi người dùng</li>
    </ul>

    <h4>3. Bảo mật và chia sẻ thông tin</h4>
    <ul>
      <li>Thông tin của bạn được bảo mật bằng các biện pháp kỹ thuật phù hợp.</li>
      <li>Chúng tôi không chia sẻ dữ liệu cá nhân cho bên thứ ba, trừ khi có sự đồng ý của bạn hoặc theo yêu cầu pháp luật.</li>
    </ul>

    <h4>4. Quyền của người dùng</h4>
    <ul>
      <li>Có thể xem, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân.</li>
      <li>Có thể yêu cầu xóa tài khoản bất cứ lúc nào.</li>
    </ul>
  </Modal>
)}

    </div>
  );
}

export default Register;
