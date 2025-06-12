import React from 'react';

function CoachCard({ coach, onViewDetail }) {
  return (
    <div className="coach-card">
      <div className="coach-card-header" style={{ background: coach.online ? '#1abc9c' : '#bdbdbd' }}>
        <div className="coach-avatar">{coach.initials}</div>
        <div>
          <div className="coach-name">{coach.title} {coach.name}</div>
          <div className="coach-rating">
            <span>⭐ {coach.rating}</span>
            <span className="coach-exp">{coach.experience} kinh nghiệm</span>
          </div>
        </div>
      </div>
      <div className="coach-specialties">
        {coach.specialties.map(s => <span className="coach-specialty" key={s}>{s}</span>)}
      </div>
      <div className="coach-stats">
        <div>
          <div className="stat-value">{coach.successRate}%</div>
          <div className="stat-label">Thành công</div>
        </div>
        <div>
          <div className="stat-value">{coach.clients}</div>
          <div className="stat-label">Khách hàng</div>
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