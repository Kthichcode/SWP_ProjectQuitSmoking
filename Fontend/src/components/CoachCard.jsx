import React from 'react';

function CoachCard({ coach, onViewDetail }) {
  // Map API data to component fields
  const getInitials = (fullName) => {
    if (!fullName) return 'C';
    return fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase().substring(0, 2);
  };

  const getStatus = () => {
    // Since API doesn't provide online status, we'll assume they're available
    return 'online';
  };

  const formatSuccessRate = (rate) => {
    return rate || 95; // Default success rate if not provided
  };

  const formatClients = (rating) => {
    // Estimate clients based on rating and experience  
    const baseClients = rating ? Math.round(rating * 20) : 50;
    return baseClients > 100 ? '100+' : baseClients;
  };

  return (
    <div className={`coach-card online`}>
      <div className="coach-card-header">
        <div className="coach-avatar">{getInitials(coach.fullName)}</div>
        <div>
          <div className="coach-title">{coach.qualification || 'Coach'} {coach.fullName}</div>
          <div className="coach-rating">
            <span className="star">⭐</span>
            <span>{coach.rating || 'N/A'}</span>
            <span className="coach-exp">{coach.yearsOfExperience || 'N/A'} năm kinh nghiệm</span>
            <span className="coach-status online">
              Có sẵn
            </span>
            <span className="coach-reviews">Đánh giá cao</span>
          </div>
          <div className="coach-badges">
            {coach.specialization && (
              <span className="coach-badge">{coach.specialization}</span>
            )}
          </div>
        </div>
      </div>
      <div className="coach-profile">{coach.bio || 'Chuyên gia tư vấn cai thuốc lá với nhiều năm kinh nghiệm'}</div>
      <div className="coach-specialties">
        {coach.specialization ? (
          <span className="coach-specialty">{coach.specialization}</span>
        ) : (
          <span className="coach-specialty">Tư vấn cai thuốc lá</span>
        )}
      </div>
      <div className="coach-stats-row">
        <div className="coach-stat">
          <div className="stat-value">{formatSuccessRate(coach.successRate)}%</div>
          <div className="stat-label">Thành công</div>
        </div>
        <div className="coach-stat">
          <div className="stat-value">{formatClients(coach.rating)}</div>
          <div className="stat-label">Khách hàng</div>
        </div>
        <div className="coach-stat">
          <div className="stat-value">&lt; 1h</div>
          <div className="stat-label">Phản hồi</div>
        </div>
        <div className="coach-stat">
          <div className="stat-value">Việt Nam</div>
          <div className="stat-label">Địa điểm</div>
        </div>
      </div>
      <div className="coach-tags">
        <span className="coach-tag">Chuyên nghiệp</span>
        <span className="coach-tag">Tận tâm</span>
        <span className="coach-tag">Hiệu quả</span>
      </div>
      <button className="coach-detail-btn" onClick={() => {
        const coachId = coach.id || coach.userId;
        onViewDetail(coachId);
      }}>
        Xem hồ sơ chi tiết
      </button>
    </div>
  );
}

export default CoachCard;