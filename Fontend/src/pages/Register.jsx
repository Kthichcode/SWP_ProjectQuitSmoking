import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/CSS/Register.css';

function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        cigarettePerDay: '',
        smokingFrequency: 'Hàng ngày',
        agree: false,
    });
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.agree) return alert("Bạn cần đồng ý với điều khoản.");
        if (formData.password !== formData.confirmPassword) return alert("Mật khẩu không khớp.");

        const payload = {
            fullName: formData.name,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            cigarettePerDay: formData.cigarettePerDay,
            smokingFrequency: formData.smokingFrequency
        };

        try {
            const res = await fetch('http://localhost:5175/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                alert("🎉 Đăng ký thành công!");
                navigate('/login');
            } else {
                alert(data.message || "Đăng ký thất bại!");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối backend.");
        }
    };

    return (
        <div className="register-section">
            <div className="register-container">
                <div className="register-wrapper">
                    <div className="register-header">
                        <img src="/src/assets/img1/android-chrome-192x192.png" alt="NoSmoke" className="register-logo" />
                        <h2>Đăng ký tài khoản</h2>
                        <p>Bắt đầu hành trình không khói thuốc của bạn ngay hôm nay</p>
                    </div>

                    <div className="register-box">
                        <h3>Tạo tài khoản mới</h3>
                        <p>Điền thông tin của bạn để tạo tài khoản</p>

                        <form className="register-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input type="text" name="name" placeholder="Nhập họ và tên"
                                    value={formData.name} onChange={handleChange} required />

                            </div>

                            <div className="form-group">
                                <label>Tên Đăng Nhập</label>
                                <input type="text" name="username" placeholder="Nhập Tên Đăng Nhập" value={formData.username} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Gmail</label>
                                <input type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className="register-input-group">
                                <div className="form-group half-width">
                                    <label>Mật khẩu</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                                </div>
                                <div className="form-group half-width">
                                    <label>Xác nhận mật khẩu</label>
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                                </div>
                            </div>

                            <p className="register-form-subheading">Thông tin thói quen hút thuốc</p>

                            <div className="form-group">
                                <label>Số điếu thuốc/ngày</label>
                                <input type="number" name="cigarettePerDay" value={formData.cigarettePerDay} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Tần suất hút thuốc</label>
                                <select
                                    name="smokingFrequency"
                                    value={formData.smokingFrequency}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Hàng ngày">Hàng ngày</option>
                                    <option value="Vài lần mỗi tuần">Vài lần mỗi tuần</option>
                                    <option value="Không thường xuyên">Không thường xuyên</option>
                                </select>
                            </div>

                            <div className="register-checkbox">
                                <label htmlFor="agree">
                                    <input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} />
                                    <span className="custom-box"></span>
                                    Tôi đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a>
                                </label>
                            </div>

                            <button type="submit" className="register-button">Đăng ký</button>

                            <p className="register-login">Đã có tài khoản? <a href="/login">Đăng nhập ngay</a></p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
