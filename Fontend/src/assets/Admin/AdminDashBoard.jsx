import React from 'react';
import './AdminDashboard.css';

function AdminDashboard() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">Quản lý Y Tế</div>
        <ul className="menu">
          <li>Trang Chủ</li>
          <li>Quản lý Người Dùng</li>
          <li>Quản lý Cai Thuốc</li>
          <li>Quản lý Kế Hoạch</li>
          <li>Quản lý Thành Tích</li>
          <li>Quản lý Hệ Thống</li>
          <li>Phản Hồi Người Dùng</li>
          <li>Quản lý Gói Dịch Vụ</li>
          <li>Thống Kê Người Dùng</li>
          <li>Đăng Xuất</li>
        </ul>
      </aside>

      <main className="main">
        <header className="header">
          <h1>Hệ Thống Quản Lý Cai Thuốc Lá</h1>
          <button className="admin-button">Admin</button>
        </header>

        <section className="overview">
          <div className="card">Tổng người dùng: <strong>3,567</strong></div>
          <div className="card">Số người đang hoạt động: <strong>1,204</strong></div>
          <div className="card">Kế hoạch đã tạo: <strong>8,942</strong></div>
          <div className="card">Gói dịch vụ: <strong>176</strong></div>
        </section>

        <section className="progress-section">
          <h2>Tiến Trình Cai Thuốc Tổng Hợp</h2>
          <div className="progress-group">
            {[
              { label: 'Ngày 1', percent: 75 },
              { label: 'Ngày 2 - 7', percent: 62 },
              { label: 'Ngày 8 - 15', percent: 48 },
              { label: 'Ngày 16 - 29', percent: 32 },
              { label: 'Hoàn tất 30 ngày', percent: 22 },
            ].map(({ label, percent }) => (
              <div className="progress-bar" key={label}>
                <span>{label}</span>
                <div className="bar">
                  <div className="fill" style={{ width: `${percent}%` }}></div>
                </div>
                <span>{percent}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="user-feedback">
          <div className="users">
            <h2>Người Dùng Mới Gần Đây</h2>
            <table>
              <thead>
                <tr><th>Họ Tên</th><th>Email</th><th>Trạng Thái</th><th>Ngày Đăng Ký</th></tr>
              </thead>
              <tbody>
                <tr><td>Nguyễn Văn A</td><td>vana@gmail.com</td><td><span className="active">Hoạt động</span></td><td>12/06/2025</td></tr>
                <tr><td>Lê Thị B</td><td>leb@gmail.com</td><td><span className="pending">Chờ Xác Nhận</span></td><td>11/06/2025</td></tr>
                <tr><td>Huỳnh Văn C</td><td>huynhc@gmail.com</td><td><span className="inactive">Không hoạt động</span></td><td>10/06/2025</td></tr>
              </tbody>
            </table>
          </div>

          <div className="feedback">
            <h2>Phản Hồi Gần Đây</h2>
            <ul>
              <li>Người dùng A: "Ứng dụng rất hữu ích!"</li>
              <li>Người dùng B: "Tôi muốn thêm tính năng nhắc nhở."</li>
              <li>Người dùng C: "Thiết kế đơn giản và dễ dùng."</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
