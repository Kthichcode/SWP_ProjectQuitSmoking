import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './AdminPage.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function AdminStatistics() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useTestData, setUseTestData] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  // Thêm state cho thống kê membership theo tháng
  const [membershipStats, setMembershipStats] = useState([]);
  // Thêm state cho tổng tiền và doanh thu từng tháng
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  // Gọi API lấy tổng tiền đã kiếm được
  const fetchTotalRevenue = async () => {
    try {
      const res = await axios.get('/api/user-memberships/revenue', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Dữ liệu dạng { data: 123456789 } hoặc { total: 123456789 }
      if (typeof res.data?.data === 'number') {
        setTotalRevenue(res.data.data);
      } else if (typeof res.data?.total === 'number') {
        setTotalRevenue(res.data.total);
      } else if (typeof res.data === 'number') {
        setTotalRevenue(res.data);
      } else {
        setTotalRevenue(0);
      }
    } catch {
      setTotalRevenue(0);
    }
  };

  // Gọi API lấy doanh thu từng tháng
  const fetchMonthlyRevenue = async () => {
    try {
      const res = await axios.get('/api/statistics/membership-revenue-by-month', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Dữ liệu dạng [{ month: '2025-07', revenue: 123456 }, ...]
      if (Array.isArray(res.data)) {
        setMonthlyRevenue(res.data);
      } else if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        setMonthlyRevenue(res.data.data);
      } else {
        setMonthlyRevenue([]);
      }
    } catch {
      setMonthlyRevenue([]);
    }
  };

  // Test data for development
  const testStats = {
    totalUsers: 1250,
    totalMembers: 980,
    totalCoaches: 45,
    totalQuitPlans: 856,
    totalNotifications: 3420,
    newUsersThisMonth: 127,
    growthRatePercent: 15.4,
    topMembersWithSmokeCount: [
      { name: "Nguyễn Văn A", totalSmoke: 0 },
      { name: "Trần Thị B", totalSmoke: 2 },
      { name: "Lê Minh C", totalSmoke: 4 }
    ]
  };

  // Gọi API lấy thống kê số lượng người mua gói thành viên theo tháng
  const fetchMembershipStats = async () => {
    try {
      const res = await axios.get('/api/statistics/membership-purchases-by-month', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Dữ liệu dạng [{ month: '2025-07', count: 12 }, ...]
      if (Array.isArray(res.data)) {
        setMembershipStats(res.data);
      } else if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        setMembershipStats(res.data.data);
      } else {
        setMembershipStats([]);
      }
    } catch {
      setMembershipStats([]);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchMembershipStats();
    fetchTotalRevenue();
    fetchMonthlyRevenue();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Log để debug
      console.log('Fetching dashboard stats with token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.get('/api/dashboard', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Dashboard response:', response.data);
      setStats(response.data);
      setDebugInfo({
        status: 'success',
        timestamp: new Date().toLocaleString(),
        data: response.data
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.');
      } else if (err.response?.status === 404) {
        setError('API endpoint không tồn tại. Vui lòng kiểm tra backend có implement /api/dashboard không.');
      } else if (err.response?.status === 403) {
        setError('Không có quyền truy cập. Vui lòng đăng nhập với tài khoản Admin.');
      } else if (err.response?.status === 500) {
        const errorDetails = err.response?.data?.message || err.response?.data?.error || 'Internal Server Error';
        setError(`Lỗi server (500): ${errorDetails}. Vui lòng kiểm tra backend logs và database connection.`);
        
        // Auto fallback to test data after showing error for 3 seconds
        setTimeout(() => {
          console.log('Auto-switching to test data due to server error');
          handleUseTestData();
        }, 3000);
      } else {
        setError(`Lỗi: ${err.message || 'Không thể tải dữ liệu thống kê'}`);
      }
      
      setDebugInfo({
        status: 'error',
        timestamp: new Date().toLocaleString(),
        error: err.message,
        statusCode: err.response?.status,
        responseData: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseTestData = () => {
    setStats(testStats);
    setError('');
    setUseTestData(true);
  };

  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
      {/* Card tổng tiền và biểu đồ doanh thu từng tháng */}
      <div style={{ margin: '40px 0 30px 0', background: '#fff', borderRadius: '10px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.3em', fontWeight: 600, margin: 0 }}>Tổng tiền giao dịch</h3>
          <span style={{ color: '#007bff', fontWeight: 700, fontSize: '1.2em' }}>
            Tổng: {formatNumber(totalRevenue)} VND
          </span>
        </div>
        {monthlyRevenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyRevenue} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 13 }} />
              <YAxis tickFormatter={v => formatNumber(v)} />
              <Tooltip formatter={v => `${v.toLocaleString('vi-VN')} VND`} />
              <Line type="monotone" dataKey="revenue" stroke="#007bff" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} name="Doanh thu" fillOpacity={0.2} />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#007bff" stopOpacity={0.2}/>
                  <stop offset="100%" stopColor="#007bff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="revenue" stroke={false} fill="url(#colorRevenue)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: '#888', margin: '16px 0' }}>Chưa có dữ liệu doanh thu từng tháng.</div>
        )}
      </div>
  }

  if (error) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <p>{error}</p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={fetchDashboardStats} style={{ marginTop: '10px' }}>
              Thử lại
            </button>
            <button 
              onClick={handleUseTestData} 
              style={{ 
                marginTop: '10px', 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Sử dụng dữ liệu mẫu
            </button>
          </div>
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p><strong>Hướng dẫn khắc phục:</strong></p>
            <ol style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
              <li>Đảm bảo backend Spring Boot đang chạy trên port 5175</li>
              <li>Kiểm tra DashboardController đã được implement chưa</li>
              <li>Verify endpoint GET /api/dashboard có phù hợp không</li>
              <li>Kiểm tra CORS configuration cho phép request từ frontend</li>
              <li><strong>Nếu lỗi 500:</strong> Kiểm tra backend console logs để xem lỗi cụ thể</li>
              <li><strong>Kiểm tra database connection</strong> và các repository methods</li>
              <li><strong>Verify DashboardService</strong> có handle được tất cả dependencies không</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2>Thống Kê Tổng Quan Hệ Thống</h2>

      {/* Card tổng tiền giao dịch */}
      <div style={{
        margin: '30px 0',
        background: '#fff',
        borderRadius: '10px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        padding: '24px',
        maxWidth: '500px',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '1.3em', fontWeight: 600, margin: 0 }}>Tổng tiền giao dịch</h3>
        <span style={{ color: '#007bff', fontWeight: 700, fontSize: '1.8em' }}>
          {formatNumber(totalRevenue)} VND
        </span>
      </div>

      {useTestData && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '20px',
          color: '#856404'
        }}>
          ⚠️ Đang sử dụng dữ liệu mẫu. Kết nối backend để có dữ liệu thực.
        </div>
      )}

      {!useTestData && stats && (
        <div style={{
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '20px',
          color: '#155724'
        }}>
          ✅ Đang hiển thị dữ liệu thực từ backend. Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
        </div>
      )}

      {/* Overview Cards */}
      <div className="stats-overview" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* ...existing code... */}
        <div className="stat-card" style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ color: '#007bff', fontSize: '2em', margin: '0' }}>
            {formatNumber(stats?.totalUsers)}
          </h3>
          <p style={{ margin: '5px 0', color: '#6c757d' }}>Tổng số người dùng</p>
        </div>
        {/* ...existing code... */}
      </div>

      {/* Growth Rate */}
      <div className="growth-rate" style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #e9ecef'
      }}>
        <h3>Tỉ lệ tăng trưởng người dùng</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            fontSize: '2em', 
            color: (stats?.growthRatePercent || 0) > 0 ? '#28a745' : 
                   (stats?.growthRatePercent || 0) < 0 ? '#dc3545' : '#6c757d',
            fontWeight: 'bold'
          }}>
            {(stats?.growthRatePercent || 0) > 0 ? '+' : ''}{stats?.growthRatePercent || 0}%
          </span>
          <span style={{ color: '#6c757d' }}>
            so với tháng trước
          </span>
          <span style={{ 
            color: (stats?.growthRatePercent || 0) > 0 ? '#28a745' : 
                   (stats?.growthRatePercent || 0) < 0 ? '#dc3545' : '#6c757d',
            fontSize: '1.2em'
          }}>
            {(stats?.growthRatePercent || 0) > 0 ? '📈' : 
             (stats?.growthRatePercent || 0) < 0 ? '📉' : '📊'}
          </span>
        </div>
        {(stats?.growthRatePercent || 0) === 0 && (
          <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '10px' }}>
            Chưa có dữ liệu so sánh với tháng trước hoặc số lượng không thay đổi
          </div>
        )}
      </div>

      {/* Thống kê tài chính: Số lượng người mua gói thành viên theo tháng */}
      <div className="membership-stats" style={{ marginTop: '40px', marginBottom: '30px' }}>
        <h3>📅 Thống kê số lượng người mua gói thành viên theo tháng</h3>
        <table className="admin-table" style={{ marginTop: '20px', minWidth: 320 }}>
          <thead>
            <tr>
              <th>Tháng</th>
              <th>Số lượng thành viên mới</th>
            </tr>
          </thead>
          <tbody>
            {membershipStats.length > 0 ? (
              membershipStats.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.month}</td>
                  <td style={{ textAlign: 'center', color: '#007bff', fontWeight: 500 }}>{item.count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', color: '#6c757d', padding: '30px' }}>
                  <div>
                    <div style={{ fontSize: '2em', marginBottom: '10px' }}>📊</div>
                    <div style={{ fontSize: '15px', marginBottom: '5px' }}>Chưa có dữ liệu thống kê thành viên theo tháng</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Top Members Table */}
      <div className="top-members">
        <h3>🏆 Top 3 Thành Viên Hút Thuốc Ít Nhất Tháng Này</h3>
        <table className="admin-table" style={{ marginTop: '20px' }}>
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Tên thành viên</th>
              <th>Số điếu đã hút</th>
              <th>Thành tích</th>
            </tr>
          </thead>
          <tbody>
            {stats?.topMembersWithSmokeCount?.length > 0 ? (
              stats.topMembersWithSmokeCount.slice(0, 3).map((member, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center' }}>
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    #{index + 1}
                  </td>
                  <td>{member.name || 'Không có tên'}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {member.totalSmoke || 0} điếu
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {member.totalSmoke === 0 && '🎉 Hoàn hảo!'}
                    {member.totalSmoke > 0 && member.totalSmoke <= 5 && '⭐ Xuất sắc'}
                    {member.totalSmoke > 5 && member.totalSmoke <= 10 && '👍 Tốt'}
                    {member.totalSmoke > 10 && '💪 Cố gắng'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
                  <div>
                    <div style={{ fontSize: '3em', marginBottom: '10px' }}>📊</div>
                    <div style={{ fontSize: '16px', marginBottom: '5px' }}>Chưa có dữ liệu thành viên</div>
                    <div style={{ fontSize: '14px', color: '#999' }}>
                      Dữ liệu sẽ xuất hiện khi có members ghi nhận smoking logs trong tháng này
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={fetchDashboardStats}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Làm mới dữ liệu
        </button>
      </div>
    </div>
  );
}

export default AdminStatistics;
