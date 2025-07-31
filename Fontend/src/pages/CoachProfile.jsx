import React, { useState, useEffect } from 'react';
import ConfirmModal from '../components/ConfirmModal';
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
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  console.log('CoachProfile - ID from params:', id);

  useEffect(() => {
    if (id) {
      console.log('Fetching coach profile for ID:', id);
      fetchCoachProfile();
      fetchCoachReviews(id);
    }
  }, [id]);

  const fetchCoachReviews = async (coachId) => {
    try {
      const response = await axiosInstance.get(`http://localhost:5175/api/coach-reviews/public/coach/${coachId}`);
      if (response.data) {
        setReviews(response.data.reviews || []);
        setAverageRating(response.data.averageRating || 0);
        setTotalReviews(response.data.totalReviews || 0);
      }
    } catch (error) {
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    }
  };

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

  // Xử lý chọn coach với modal xác nhận
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCoach, setPendingCoach] = useState(null);

  const handleSelectCoach = (coach) => {
    setPendingCoach(coach);
    setConfirmOpen(true);
  };

  const handleConfirmSelectCoach = async () => {
    if (!pendingCoach) return;
    const coachId = pendingCoach.userId || pendingCoach.id;
    let selectionId = null;
    try {
      const response = await axiosInstance.get(`/api/users/members/selection-with-coach/${coachId}`);
      if (response.data?.status === 'success' && response.data.data?.selectionId) {
        selectionId = response.data.data.selectionId;
      }
    } catch (e) {}
    setConfirmOpen(false);
    setPendingCoach(null);
    navigate('/progress', {
      state: {
        selectionId: selectionId || undefined,
        coachId: coachId
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
                <span style={{ fontSize: 20, marginRight: 8, verticalAlign: 'middle', marginTop: 50 }}>←</span>
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
              {coach.imageUrl ? (
                <img
                  src={`data:image/jpeg;base64,${coach.imageUrl}`}
                  alt="avatar"
                  style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: '50%', border: '1px solid #fff', background: '#fff' }}
                />
              ) : (
                coach.fullName ? coach.fullName.charAt(0).toUpperCase() : 'C'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="coach-profile-title">{coach.qualification || 'Coach'} {coach.fullName}</div>
              <div className="coach-profile-rating-row">
                
                <span className="coach-profile-exp">{coach.yearsOfExperience || 'N/A'} năm kinh nghiệm</span>
                <span className="coach-profile-status online">Có sẵn</span>
              </div>
              <div className="coach-profile-badges">
                {coach.specialization && (
                  <span>{coach.specialization}</span>
                )}
              </div>
              <div className="coach-profile-desc">{coach.bio || 'Chuyên gia tư vấn cai thuốc lá với nhiều năm kinh nghiệm'}</div>
              <div style={{marginTop: 10, color: 'black', fontSize: 15}}>
                <b>Email:</b> {coach.email || 'N/A'}
              </div>
            </div>
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
                    <span style={{ color: '#0ea5e9', fontWeight: 600 }}>Phản hồi nhanh chóng và chuyên nghiệp</span>
                  </div>
                </div>
              </div>
            )}
            {tab === 'method' && (
              <div style={{fontSize: 16}}>
                
                {coach.bio || 'Coach chuyên nghiệp với nhiều năm kinh nghiệm trong lĩnh vực tư vấn cai thuốc lá. Áp dụng các phương pháp khoa học hiện đại để giúp khách hàng đạt được mục tiêu cai thuốc thành công.'}
              </div>
            )}
            {tab === 'review' && (
              <div style={{fontSize: 16}}>
                <b>Đánh giá từ khách hàng:</b>
                <div style={{marginTop: 8}}>
                  <span>Trung bình: <b>{averageRating.toFixed(1)}</b>/5 ⭐ ({totalReviews} đánh giá)</span>
                </div>
                <ul style={{marginTop: 8}}>
                  {reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                      <li key={idx}>
                        <span style={{color:'#f59e42'}}>⭐ {review.rating}</span> - {review.comment}
                        <br/>
                        <span style={{fontSize:13, color:'#888'}}>Bởi: {review.reviewerName || 'Ẩn danh'} {review.createdAt ? `(${new Date(review.createdAt).toLocaleDateString()})` : ''}</span>
                      </li>
                    ))
                  ) : (
                    <li>Chưa có đánh giá nào cho coach này.</li>
                  )}
                </ul>
              </div>
            )}
            {tab === 'contact' && (
              <div style={{fontSize: 16}}>
                <b>Liên hệ trực tiếp:</b>
                <div>Email: <a href={`mailto:${coach.email || ''}`}>{coach.email || 'N/A'}</a></div>
                
                <div style={{marginTop: 10, color: '#666'}}>
                  Sau khi chọn coach, bạn có thể nhắn tin trực tiếp trong trang tiến trình cai thuốc.
                </div>
              </div>
            )}
          </div>
          {/* Action buttons */}
          <div className="coach-profile-actions">
            <button className="btn-select-coach" onClick={() => handleSelectCoach(coach)}>
              ✓ Chọn Coach này
            </button>
          </div>
          <ConfirmModal
            open={confirmOpen}
            title="Xác nhận chọn coach"
            message={pendingCoach ? `Bạn có chắc chắn muốn chọn coach \"${pendingCoach.fullName}\" để đồng hành không?\nSau khi chọn, bạn sẽ bắt đầu hành trình cùng coach này.` : ''}
            onConfirm={handleConfirmSelectCoach}
            onCancel={() => { setConfirmOpen(false); setPendingCoach(null); }}
          />
        </div>
      </div>
    </>
  );
}

export default CoachProfile;
