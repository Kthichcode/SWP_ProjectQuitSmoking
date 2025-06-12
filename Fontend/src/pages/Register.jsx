import React from 'react';
import '../assets/CSS/Register.css';

function Register() {
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

                        <form className="register-form">
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input type="text" placeholder="Nhập họ và tên" />
                            </div>

                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" placeholder="Nhập tên đăng nhập" />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="your@email.com" />
                            </div>

                            <div className="register-input-group">
                                <div className="form-group half-width">
                                    <label>Mật khẩu</label>
                                    <input type="password" placeholder="Nhập mật khẩu" />
                                </div>
                                <div className="form-group half-width">
                                    <label>Xác nhận mật khẩu</label>
                                    <input type="password" placeholder="Xác nhận mật khẩu" />
                                </div>
                            </div>

                            <p className="register-form-subheading">Thông tin thói quen hút thuốc</p>

                            <div className="form-group">
                                <label>Số điếu thuốc/ngày</label>
                                <input type="number" placeholder="Ví dụ: 10" />
                            </div>

                            <div className="form-group">
                                <label>Tần suất hút thuốc</label>
                                <select>
                                    <option>Hàng ngày</option>
                                    <option>Vài lần mỗi tuần</option>
                                    <option>Không thường xuyên</option>
                                </select>
                            </div>

                            <div className="register-checkbox">
                                <label htmlFor="agree">
                                    <input type="checkbox" id="agree" />
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
