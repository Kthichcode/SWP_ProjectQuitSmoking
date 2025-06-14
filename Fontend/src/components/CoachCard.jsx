import React from 'react';

function CoachCard({ coach, onViewDetail }) {
  return (
    <div className={`coach-card ${coach.online ? 'online' : coach.busy ? 'busy' : 'offline'}`}>
      <div className="coach-card-header">
        <div className="coach-avatar">{coach.initials}</div>
        <div>
          <div className="coach-title">{coach.title} {coach.name}</div>
          <div className="coach-rating">
            <span className="star">⭐</span>
            <span>{coach.rating}</span>
            <span className="coach-exp">{coach.experience} kinh nghiệm</span>
            <span className={`coach-status ${coach.online ? 'online' : coach.busy ? 'busy' : 'offline'}`}>
              {coach.online ? 'Đang online' : coach.busy ? 'Đang bận' : 'Offline'}
            </span>
            <span className="coach-reviews">{coach.reviews} đánh giá</span>
          </div>
          <div className="coach-badges">
            {coach.badges?.map(badge => (
              <span className="coach-badge" key={badge}>{badge}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="coach-profile">{coach.profile}</div>
      <div className="coach-specialties">
        {coach.specialties.map(s => <span className="coach-specialty" key={s}>{s}</span>)}
      </div>
      <div className="coach-stats-row">
        <div className="coach-stat">
          <div className="stat-value">{coach.successRate}%</div>
          <div className="stat-label">Thành công</div>
        </div>
        <div className="coach-stat">
          <div className="stat-value">{coach.clients}</div>
          <div className="stat-label">Khách hàng</div>
        </div>
        <div className="coach-stat">
          <div className="stat-value">{coach.responseTime}</div>
          <div className="stat-label">Phản hồi</div>
        </div>
        <div className="coach-stat">
          <div className="stat-value">{coach.location}</div>
          <div className="stat-label">Địa điểm</div>
        </div>
      </div>
      <div className="coach-tags">
        {coach.tags.map(t => <span className="coach-tag" key={t}>{t}</span>)}
      </div>
      <button className="coach-detail-btn" onClick={() => onViewDetail(coach)}>
        Xem hồ sơ chi tiết
      </button>
    </div>
  );
}

export default CoachCard;