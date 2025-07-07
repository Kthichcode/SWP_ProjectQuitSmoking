import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MdDashboard, MdPeople, MdEmojiEvents, MdSettings, MdFeedback, MdLogout } from 'react-icons/md';
import { FaUserTie, FaClipboardList, FaBoxOpen, FaBlog } from 'react-icons/fa';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const handleLogout = () => {
    localStorage.removeItem('token');
    logout(); 
    navigate('/login');
  };
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">Admin</div>
        <ul className="menu">
          <li>
            <NavLink to="/admin/dashboard" end className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>
              <MdDashboard size={20} /> Thống kê
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/users" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>
              <MdPeople size={20} /> Quản lý Người Dùng
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/coaches" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>
              <FaUserTie size={20} /> Quản lý Coach
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/notifications" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>
              <FaClipboardList size={20} /> Quản lý Thông Báo
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/achievements" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>
              <MdEmojiEvents size={20} /> Quản lý Thành Tích
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/system" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>
              <MdSettings size={20} /> Quản lý Hệ Thống
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/feedback" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>
              <MdFeedback size={20} /> Phản Hồi Người Dùng
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/packages" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>
              <FaBoxOpen size={20} /> Quản lý Gói Dịch Vụ
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/blogs" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>
              <FaBlog size={20} /> Quản lý Blog
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/blog-categories" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>
              <FaClipboardList size={20} /> Quản lý Thể Loại
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard/badges" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}>
              <MdEmojiEvents size={20} /> Quản lý Huy Hiệu
            </NavLink>
          </li>
          <li className="logout" onClick={handleLogout}>
            <MdLogout size={20} style={{ marginRight: 8 }} /> Đăng Xuất
          </li>
        </ul>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminDashboard;
