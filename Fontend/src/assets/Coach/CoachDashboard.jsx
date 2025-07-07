

import React, { useState, useEffect } from 'react';
import './CoachDashboard.css';
import { FaUsers, FaCalendarAlt, FaEnvelope, FaStar, FaTachometerAlt, FaSignOutAlt, FaPenNib, FaUserCircle } from 'react-icons/fa';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../../../axiosInstance';

function CoachDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOverview = location.pathname === '/coach' || location.pathname === '/coach/';
  const { user, logout } = useAuth();

  // State cho dữ liệu dashboard
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    activeClients: 0,
    attentionClients: 0,
    completedClients: 0,
    appointmentsToday: 0,
    appointmentsThisWeek: 0,
    pendingAppointments: 0,
    completionRate: 0,
    unreadMessages: 0,
    onlineClients: 0,
    avgResponse: 0,
    rating: 0,
    performance: {
      success: 0,
      fiveStar: 0,
      onTime: 0,
      fastResponse: 0
    },
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isOverview) {
      fetchDashboardData();
    }
  }, [user, isOverview]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Gọi API để lấy dữ liệu dashboard
      const response = await axiosInstance.get('/api/coach/dashboard');
      
      if (response.data.status === 'success') {
        setDashboardData(response.data.data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback với dữ liệu mẫu nếu API chưa có
      setDashboardData({
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
      });
    } finally {
      setLoading(false);
    }
  };

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
            <NavLink to="/coach/plans" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaCalendarAlt style={{marginRight:8}}/> Kế hoạch cai thuốc
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
            <NavLink to="/coach/profile" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaUserCircle style={{marginRight:8}}/> Hồ sơ cá nhân
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
            {loading ? (
              <div className="loading-state">
                <p>Đang tải dữ liệu dashboard...</p>
              </div>
            ) : (
              <>
                <div className="welcome-section">
                  <h2>Chào mừng trở lại, {user?.fullName || 'Coach'}!</h2>
                  <p>Bạn có {dashboardData.appointmentsThisWeek} lịch hẹn trong tuần, {dashboardData.unreadMessages} tin nhắn chưa đọc.</p>
                  <div className="rating">
                    <FaStar />
                    <span>{dashboardData.rating}</span>
                    <button>Tư vấn viên xuất sắc</button>
                  </div>
                </div>
                <div className="cards-container">
                  <div className="card">
                    <FaUsers />
                    <h3>{dashboardData.totalClients}</h3>
                    <p>Tổng khách hàng</p>
                  </div>
                  <div className="card">
                    <FaCalendarAlt />
                    <h3>{dashboardData.appointmentsThisWeek}</h3>
                    <p>Lịch hẹn tuần này</p>
                  </div>
                  <div className="card">
                    <FaEnvelope />
                    <h3>{dashboardData.unreadMessages}</h3>
                    <p>Tin nhắn chưa đọc</p>
                  </div>
                </div>
                <div className="performance-container">
                  <h4>Hiệu suất tư vấn</h4>
                  <div>
                    <p>Khách hàng thành công</p>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: dashboardData.performance.success + '%' }}></div>
                    </div>
                    <p>{Math.round(dashboardData.totalClients * dashboardData.performance.success / 100)}/{dashboardData.totalClients} ({dashboardData.performance.success}%)</p>
                  </div>
                  <div>
                    <p>Đánh giá 5 sao</p>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: dashboardData.performance.fiveStar + '%' }}></div>
                    </div>
                    <p>{Math.round(dashboardData.completedClients * dashboardData.performance.fiveStar / 100)}/{dashboardData.completedClients} ({dashboardData.performance.fiveStar}%)</p>
                  </div>
                  <div>
                    <p>Hoàn thành đúng hạn</p>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: dashboardData.performance.onTime + '%' }}></div>
                    </div>
                    <p>{Math.round(dashboardData.totalClients * dashboardData.performance.onTime / 100)}/{dashboardData.totalClients} ({dashboardData.performance.onTime}%)</p>
                  </div>
                  <div>
                    <p>Phản hồi nhanh</p>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: dashboardData.performance.fastResponse + '%' }}></div>
                    </div>
                    <p>{Math.round(dashboardData.totalClients * dashboardData.performance.fastResponse / 100)}/{dashboardData.totalClients} ({dashboardData.performance.fastResponse}%)</p>
                  </div>
                </div>
                <div className="activity-section">
                  <h4>Hoạt động gần đây</h4>
                  {dashboardData.recentActivities.length === 0 ? (
                    <p>Chưa có hoạt động gần đây</p>
                  ) : (
                    dashboardData.recentActivities.map((act, idx) => (
                      <div className="activity-item" key={idx}>
                        <span className="activity-time">{act.time}</span>
                        <div className="activity-title">{act.title}</div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        ) : <Outlet />}
      </div>
    </div>
  );
}

export default CoachDashboard;
