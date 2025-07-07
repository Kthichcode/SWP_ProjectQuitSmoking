import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';
import '../assets/CSS/CoachProfile.css';
import Header from './Header';

function CoachProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  console.log('CoachProfile - ID from params:', id);

  useEffect(() => {
    if (id) {
      console.log('Fetching coach profile for ID:', id);
      fetchCoachProfile();
    }
  }, [id]);

  const fetchCoachProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Making API call to:', `/api/coach/${id}`);
      
      // Try different approach - get all coaches first and find the one we need
      try {
        const response = await axiosInstance.get(`/api/coach/${id}`);
        console.log('Direct API response:', response.data);

        if (response.data.status === 'success') {
          setCoach(response.data.data);
          console.log('Coach data set:', response.data.data);
        } else {
          setError('Không thể tải thông tin coach');
        }
      } catch (directError) {
        console.log('Direct call failed, trying getAllCoachProfiles');
        // Fallback: get all coaches and find the one we need
        const allCoachesResponse = await axiosInstance.get('/api/coach/getAllCoachProfiles');
        
        if (allCoachesResponse.data.status === 'success') {
          const coaches = allCoachesResponse.data.data;
          const targetCoach = coaches.find(coach => coach.userId.toString() === id.toString());
          
          if (targetCoach) {
            setCoach(targetCoach);
            console.log('Found coach in list:', targetCoach);
          } else {
            setError('Không tìm thấy coach này');
          }
        } else {
          throw new Error('Cannot fetch coaches list');
        }
      }
    } catch (error) {
      console.error('Error fetching coach profile:', error);
      console.log('Error response:', error.response);
      console.log('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error.response?.status === 404) {
        setError('Không tìm thấy coach này');
      } else {
        setError('Lỗi khi tải thông tin coach');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoach = () => {
    // Chuyển đến trang tiến trình cai thuốc
    navigate('/progress', { 
      state: { 
        selectedCoach: coach,
        coachId: coach.userId 
      } 
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="coach-profile-bg">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin coach...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !coach) {
    return (
      <>
        <Header />
        <div className="coach-profile-bg">
          <div className="error-container">
            <div className="error-message">
              <h3>😔 {error || 'Không tìm thấy hồ sơ coach'}</h3>
              <button className="coach-profile-btn-back" onClick={() => navigate(-1)}>
                <span style={{ fontSize: 20, marginRight: 8, verticalAlign: 'middle' }}>←</span>
                Quay lại danh sách
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
      <div className="coach-profile-bg">
        <button className="coach-profile-btn-back" onClick={() => navigate(-1)}>
          <span style={{ fontSize: 20, marginRight: 8, verticalAlign: 'middle' }}>←</span>
          Quay lại danh sách
        </button>
        <div className="coach-profile-container">
          <div className="coach-profile-header">
            <div className="coach-profile-avatar">
              {coach.fullName ? coach.fullName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div style={{ flex: 1 }}>
              <div className="coach-profile-title">{coach.qualification || 'Coach'} {coach.fullName}</div>
              <div className="coach-profile-rating-row">
                <span className="coach-profile-rating">⭐ {coach.rating || 'N/A'} ({coach.reviews || 0} đánh giá)</span>
                <span className="coach-profile-exp">{coach.yearsOfExperience || 'N/A'} năm kinh nghiệm</span>
                <span className="coach-profile-status online">Có sẵn</span>
              </div>
              <div className="coach-profile-badges">
                {coach.specialization && (
                  <span>{coach.specialization}</span>
                )}
              </div>
              <div className="coach-profile-desc">{coach.bio || 'Chuyên gia tư vấn cai thuốc lá với nhiều năm kinh nghiệm'}</div>
              <div style={{marginTop: 10, color: '#fff', fontSize: 15}}>
                <b>Email:</b> {coach.email || 'N/A'} &nbsp;|&nbsp; <b>Username:</b> {coach.username || 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="coach-profile-stats">
            <div className="coach-profile-stat">
              <div className="coach-profile-stat-value" style={{ color: '#16a34a' }}>{coach.rating || 4.5}</div>
              <div className="coach-profile-stat-label" style={{ color: '#16a34a' }}>Đánh giá</div>
            </div>
            <div className="coach-profile-stat blue">
              <div className="coach-profile-stat-value">{coach.yearsOfExperience || 'N/A'}</div>
              <div className="coach-profile-stat-label">Năm KN</div>
            </div>
            <div className="coach-profile-stat purple">
              <div className="coach-profile-stat-value">&lt; 1h</div>
              <div className="coach-profile-stat-label">Phản hồi</div>
            </div>
            <div className="coach-profile-stat orange">
              <div className="coach-profile-stat-value">Việt Nam</div>
              <div className="coach-profile-stat-label">Địa điểm</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="coach-profile-actions">
            <button className="btn-select-coach" onClick={handleSelectCoach}>
              ✓ Chọn Coach này
            </button>
          </div>

          <div className="coach-profile-tabs">
            <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Tổng quan</button>
            <button className={tab === 'method' ? 'active' : ''} onClick={() => setTab('method')}>Phương pháp</button>
            <button className={tab === 'review' ? 'active' : ''} onClick={() => setTab('review')}>Đánh giá</button>
            <button className={tab === 'contact' ? 'active' : ''} onClick={() => setTab('contact')}>Liên hệ</button>
          </div>
          <div className="coach-profile-info">
            {tab === 'overview' && (
              <div className="coach-profile-info-flex">
                <div className="coach-profile-info-block">
                  <div className="coach-profile-info-block-title">Lĩnh vực chuyên môn</div>
                  <div>
                    {coach.specialization ? (
                      <span className="coach-profile-specialty">{coach.specialization}</span>
                    ) : (
                      <span className="coach-profile-specialty">Tư vấn cai thuốc lá</span>
                    )}
                  </div>
                </div>
                <div className="coach-profile-info-block">
                  <div className="coach-profile-info-block-title">Thông tin coach</div>
                  <div><strong>Kinh nghiệm:</strong> {coach.yearsOfExperience || 'N/A'} năm</div>
                  <div style={{ marginTop: 8 }}>
                    <strong>Đánh giá:</strong> {coach.rating || 'N/A'}/5 ⭐
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ color: '#0ea5e9', fontWeight: 600 }}>Phản hồi nhanh chóng và chuyên nghiệp</span>
                  </div>
                </div>
              </div>
            )}
            {tab === 'method' && (
              <div style={{fontSize: 16, color: '#047857'}}>
                <b>Giới thiệu về coach:</b> <br/>
                {coach.bio || 'Coach chuyên nghiệp với nhiều năm kinh nghiệm trong lĩnh vực tư vấn cai thuốc lá. Áp dụng các phương pháp khoa học hiện đại để giúp khách hàng đạt được mục tiêu cai thuốc thành công.'}
              </div>
            )}
            {tab === 'review' && (
              <div style={{fontSize: 16}}>
                <b>Đánh giá từ khách hàng:</b>
                <ul style={{marginTop: 8}}>
                  <li>"Coach rất tận tâm, nhờ có coach mà tôi đã bỏ thuốc thành công!"</li>
                  <li>"Phản hồi nhanh, tư vấn rõ ràng, dễ hiểu."</li>
                  <li>"Phương pháp hiệu quả, phù hợp với từng người."</li>
                </ul>
              </div>
            )}
            {tab === 'contact' && (
              <div style={{fontSize: 16}}>
                <b>Liên hệ trực tiếp:</b>
                <div>Email: <a href={`mailto:${coach.email || ''}`}>{coach.email || 'N/A'}</a></div>
                <div>Username: {coach.username || 'N/A'}</div>
                <div style={{marginTop: 10, color: '#666'}}>
                  Sau khi chọn coach, bạn có thể nhắn tin trực tiếp trong trang tiến trình cai thuốc.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CoachProfile;
