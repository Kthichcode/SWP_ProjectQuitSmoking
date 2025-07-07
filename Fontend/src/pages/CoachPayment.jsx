import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CoachCard from '../components/CoachCard';
import Header from './Header';
import axiosInstance from '../../../axiosInstance';
import '../assets/CSS/CoachPayment.css';

function CoachPayment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Development flag - set to false for production
  const ALLOW_TESTING_WITHOUT_BACKEND = false;
  
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [checkingMembership, setCheckingMembership] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    // Kiểm tra membership trước khi cho phép chọn coach
    checkUserMembership();
  }, [user, navigate]);

  const checkUserMembership = async () => {
    try {
      setCheckingMembership(true);
      const currentUserId = user.userId || user.id;
      console.log('Checking membership for user before selecting coach:', currentUserId);
      
      // Sử dụng API check membership cho user cụ thể (tối ưu hơn)
      const response = await axiosInstance.get(`/api/user-memberships/check-active/${currentUserId}`);
      
      console.log('User membership response:', response.data);
      
      // Check response structure từ UserMembershipController (Boolean response)
      if (response.data && response.data.status === 'success' && response.data.data === true) {
        // User có membership active, tạo object đơn giản để set state
        const membershipData = {
          status: 'ACTIVE',
          hasActiveMembership: true
        };
        
        setMembershipStatus(membershipData);
        // Nếu có membership active, cho phép chọn coach
        fetchCoaches();
      } else {
        console.log('No active membership found for user:', currentUserId);
        setMembershipStatus(null);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
      
      if (error.response?.status === 404) {
        console.log('No membership found for user:', user.userId || user.id);
        setMembershipStatus(null);
      } else {
        // Cho tất cả các lỗi khác, không cho phép chọn coach
        console.log('Error occurred, not allowing coach selection for safety...');
        setMembershipStatus(null);
      }
    } finally {
      setCheckingMembership(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.get(`/api/coach/getAllCoachProfiles`);

      if (response.data.status === 'success') {
        setCoaches(response.data.data);
      } else {
        setError('Không thể tải danh sách coach');
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
      if (error.response?.status === 401) {
        setError('Vui lòng đăng nhập để xem danh sách coach');
        navigate('/login');
      } else {
        setError('Lỗi khi tải danh sách coach. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from fetched coaches
  const calculateStats = () => {
    if (coaches.length === 0) {
      return {
        totalCoaches: 0,
        avgRating: 0,
        avgSuccessRate: 0,
        totalClients: 0
      };
    }

    const totalRating = coaches.reduce((sum, coach) => sum + (coach.rating || 0), 0);
    const totalSuccessRate = coaches.reduce((sum, coach) => sum + (coach.successRate || 0), 0);
    const totalClients = coaches.reduce((sum, coach) => sum + (coach.clients || 0), 0);

    return {
      totalCoaches: coaches.length,
      avgRating: (totalRating / coaches.length).toFixed(1),
      avgSuccessRate: Math.round(totalSuccessRate / coaches.length),
      totalClients: totalClients > 1000 ? `${(totalClients / 1000).toFixed(1)}K+` : totalClients
    };
  };

  const stats = calculateStats();

  if (checkingMembership) {
    return (
      <>
        <Header />
        <div className="coach-payment-bg">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang kiểm tra gói membership...</p>
          </div>
        </div>
      </>
    );
  }

  if (!membershipStatus) {
    return (
      <>
        <Header />
        <div className="coach-payment-bg">
          <div className="error-container">
            <div className="error-message" style={{ textAlign: 'center', padding: '50px' }}>
              <h3>🔒 Cần có gói membership để chọn coach</h3>
              <p>Bạn cần mua gói membership trước khi có thể chọn coach phù hợp</p>
              <div style={{ marginTop: '20px' }}>
                <button 
                  className="retry-btn" 
                  onClick={() => navigate('/payment')}
                  style={{ marginRight: '10px' }}
                >
                  Mua gói membership ngay
                </button>
                <button 
                  className="retry-btn" 
                  onClick={() => navigate('/home')}
                  style={{ background: '#6c757d' }}
                >
                  Về trang chủ
                </button>
              </div>
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                fontSize: '0.9em',
                color: '#6c757d'
              }}>
                <p><strong>Sau khi có membership, bạn sẽ được:</strong></p>
                <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                  <li>🎯 Chọn coach phù hợp từ danh sách chuyên gia</li>
                  <li>💬 Chat trực tiếp với coach được chọn</li>
                  <li>📋 Nhận kế hoạch cai thuốc cá nhân hóa</li>
                  <li>📊 Theo dõi tiến trình chi tiết</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="coach-payment-bg">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách coach...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="coach-payment-bg">
          <div className="error-container">
            <div className="error-message">
              <h3>😔 Có lỗi xảy ra</h3>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchCoaches}>
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="coach-payment-bg">
        <div className="coach-payment-header">
          <h2>Chọn <span style={{ color: '#1abc9c' }}>Coach</span> phù hợp</h2>
          <p>Tìm chuyên gia tư vấn phù hợp nhất cho hành trình cai thuốc lá của bạn.<br />Tất cả coach đều được kiểm định chuyên môn.</p>
          <div className="coach-payment-stats">
            <div><div>{stats.totalCoaches}</div><span>Chuyên gia</span></div>
            <div><div>{stats.avgRating}</div><span>Đánh giá TB</span></div>
            <div><div>{stats.avgSuccessRate}%</div><span>Tỷ lệ thành công</span></div>
            <div><div>{stats.totalClients}</div><span>Khách hàng</span></div>
          </div>
        </div>

        {coaches.length === 0 ? (
          <div className="no-coaches-container">
            <div className="no-coaches-message">
              <h3>🔍 Chưa có coach nào</h3>
              <p>Hiện tại chưa có coach nào trong hệ thống. Vui lòng quay lại sau.</p>
            </div>
          </div>
        ) : (
          <div className="coach-payment-list">
            {coaches.map((coach, index) => (
              <CoachCard
                key={coach.id || coach.userId || index}
                coach={coach}
                onViewDetail={(id) => navigate(`/coach/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default CoachPayment;