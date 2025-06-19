// CoachDashboard.jsx

import React from 'react';
import './CoachDashboard.css';
import { FaUsers, FaCalendarAlt, FaEnvelope, FaStar, FaTachometerAlt, FaSignOutAlt, FaPenNib } from 'react-icons/fa';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
const overviewData = {
  totalClients: 47,
  activeClients: 32,
  attentionClients: 8,
  completedClients: 7,
  appointmentsToday: 0,
  appointmentsThisWeek: 23,
  pendingAppointments: 3,
  completionRate: 96,
  unreadMessages: 8,
  onlineClients: 12,
  avgResponse: 2.5,
  rating: 4.9,
  performance: {
    success: 89,
    fiveStar: 90,
    onTime: 96,
    fastResponse: 100
  },
  recentActivities: [
    { time: '14:00 - 15:00', title: 'Nguyễn Thị B - Tư vấn cai thuốc' },
    { time: '15:30 - 16:30', title: 'Trần Văn C - Theo dõi tiến độ' },
    { time: '17:00 - 18:00', title: 'Lê Thị D - Tư vấn ban đầu' }
  ]
};

function CoachDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOverview = location.pathname === '/coach' || location.pathname === '/coach/';

  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // reset user context
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Coach Dashboard</h3>
        <ul>
          <li>
            <NavLink to="/coach" end className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaTachometerAlt style={{marginRight:8}}/> Tổng quan
            </NavLink>
          </li>
          <li>
            <NavLink to="/coach/users" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaUsers style={{marginRight:8}}/> Người dùng
            </NavLink>
          </li>
          <li>
            <NavLink to="/coach/appointments" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaCalendarAlt style={{marginRight:8}}/> Lịch hẹn
            </NavLink>
          </li>
          <li>
            <NavLink to="/coach/messages" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaEnvelope style={{marginRight:8}}/> Tin nhắn
            </NavLink>
          </li>
          <li>
            <NavLink to="/coach/blog" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaPenNib style={{marginRight:8}}/> Viết blog
            </NavLink>
          </li>
          <li>
            <button className="sidebar-logout" onClick={handleLogout}>
              <FaSignOutAlt style={{marginRight:8}}/> Đăng xuất
            </button>
          </li>
        </ul>
      </div>
      <div className="main-content">
        {isOverview ? (
          <>
            <div className="welcome-section">
              <h2>Chào mừng trở lại, Bác sĩ Nguyễn Văn A!</h2>
              <p>Bạn có {overviewData.appointmentsThisWeek} lịch hẹn trong tuần, {overviewData.unreadMessages} tin nhắn chưa đọc.</p>
              <div className="rating">
                <FaStar />
                <span>{overviewData.rating}</span>
                <button>Tư vấn viên xuất sắc</button>
              </div>
            </div>
            <div className="cards-container">
              <div className="card">
                <FaUsers />
                <h3>{overviewData.totalClients}</h3>
                <p>Tổng khách hàng</p>
              </div>
              <div className="card">
                <FaCalendarAlt />
                <h3>{overviewData.appointmentsThisWeek}</h3>
                <p>Lịch hẹn tuần này</p>
              </div>
              <div className="card">
                <FaEnvelope />
                <h3>{overviewData.unreadMessages}</h3>
                <p>Tin nhắn chưa đọc</p>
              </div>
            </div>
            <div className="performance-container">
              <h4>Hiệu suất tư vấn</h4>
              <div>
                <p>Khách hàng thành công</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: overviewData.performance.success + '%' }}></div>
                </div>
                <p>42/47 (89%)</p>
              </div>
              <div>
                <p>Đánh giá 5 sao</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: overviewData.performance.fiveStar + '%' }}></div>
                </div>
                <p>38/42 (90%)</p>
              </div>
              <div>
                <p>Hoàn thành đúng hạn</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: overviewData.performance.onTime + '%' }}></div>
                </div>
                <p>45/47 (96%)</p>
              </div>
              <div>
                <p>Phản hồi nhanh</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: overviewData.performance.fastResponse + '%' }}></div>
                </div>
                <p>47/47 (100%)</p>
              </div>
            </div>
            <div className="activity-section">
              <h4>Hoạt động gần đây</h4>
              {overviewData.recentActivities.map((act, idx) => (
                <div className="activity-item" key={idx}>
                  <span className="activity-time">{act.time}</span>
                  <div className="activity-title">{act.title}</div>
                </div>
              ))}
            </div>
          </>
        ) : <Outlet />}
      </div>
    </div>
  );
}

export default CoachDashboard;
