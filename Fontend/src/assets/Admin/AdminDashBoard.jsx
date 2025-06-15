import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => {
    localStorage.removeItem('token');
    logout(); // Xóa context user
    navigate('/login');
  };
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">Admin</div>
        <ul className="menu">
          <li><Link to="/admin/dashboard" className="menu-link">Thống kê</Link></li>
          <li><Link to="/admin/dashboard/users" className="menu-link">Quản lý Người Dùng</Link></li>
          <li><Link to="/admin/dashboard/coaches" className="menu-link">Quản lý Coach</Link></li>
          <li><Link to="/admin/dashboard/plans" className="menu-link">Quản lý Kế Hoạch</Link></li>
          <li><Link to="/admin/dashboard/achievements" className="menu-link">Quản lý Thành Tích</Link></li>
          <li><Link to="/admin/dashboard/system" className="menu-link">Quản lý Hệ Thống</Link></li>
          <li><Link to="/admin/dashboard/feedback" className="menu-link">Phản Hồi Người Dùng</Link></li>
          <li><Link to="/admin/dashboard/packages" className="menu-link">Quản lý Gói Dịch Vụ</Link></li>
          <li><Link to="/admin/dashboard/statistics" className="menu-link">Thống Kê Người Dùng</Link></li>
          <li className="logout" onClick={handleLogout}>Đăng Xuất</li>
        </ul>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminDashboard;
