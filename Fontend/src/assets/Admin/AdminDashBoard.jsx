import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
          <li>
            <NavLink to="/admin/dashboard" end className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>Thống kê</NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/users" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>Quản lý Người Dùng</NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/coaches" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>Quản lý Coach</NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/plans" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>Quản lý Kế Hoạch</NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/achievements" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>Quản lý Thành Tích</NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/system" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>Quản lý Hệ Thống</NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/feedback" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>Phản Hồi Người Dùng</NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/packages" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>Quản lý Gói Dịch Vụ</NavLink>
          </li>
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
