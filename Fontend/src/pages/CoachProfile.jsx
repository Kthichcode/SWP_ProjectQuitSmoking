import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coaches } from './CoachPayment';
import '../assets/CSS/CoachProfile.css';
import Header from './Header';

function CoachProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const coach = coaches.find(c => c.id === Number(id));
  const [tab, setTab] = useState('overview');

  if (!coach) return <div>Không tìm thấy hồ sơ coach.</div>;

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
            <div className="coach-profile-avatar">{coach.initials}</div>
            <div style={{ flex: 1 }}>
              <div className="coach-profile-title">{coach.title} {coach.name}</div>
              <div className="coach-profile-rating-row">
                <span className="coach-profile-rating">⭐ {coach.rating} ({coach.reviews} đánh giá)</span>
                <span className="coach-profile-exp">{coach.experience} kinh nghiệm</span>
                <span className={`coach-profile-status ${coach.online ? 'online' : coach.busy ? 'busy' : 'offline'}`}>{coach.online ? 'Đang online' : coach.busy ? 'Đang bận' : 'Offline'}</span>
              </div>
              <div className="coach-profile-badges">
                {coach.badges?.map(badge => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
              <div className="coach-profile-desc">{coach.profile}</div>
              <div style={{marginTop: 10, color: '#fff', fontSize: 15}}>
                <b>Email:</b> {coach.email || 'coach@example.com'} &nbsp;|&nbsp; <b>Điện thoại:</b> {coach.phone || '0123 456 789'}
              </div>
            </div>
          </div>
          <div className="coach-profile-stats">
            <div className="coach-profile-stat">
              <div className="coach-profile-stat-value" style={{ color: '#16a34a' }}>{coach.successRate}%</div>
              <div className="coach-profile-stat-label" style={{ color: '#16a34a' }}>Tỷ lệ thành công</div>
            </div>
            <div className="coach-profile-stat blue">
              <div className="coach-profile-stat-value">{coach.clients}</div>
              <div className="coach-profile-stat-label">Khách hàng</div>
            </div>
            <div className="coach-profile-stat purple">
              <div className="coach-profile-stat-value">{coach.responseTime}</div>
              <div className="coach-profile-stat-label">Phản hồi</div>
            </div>
            <div className="coach-profile-stat orange">
              <div className="coach-profile-stat-value">{coach.location}</div>
              <div className="coach-profile-stat-label">Địa điểm</div>
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
                    {coach.specialties.map(s => (
                      <span className="coach-profile-specialty" key={s}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className="coach-profile-info-block">
                  <div className="coach-profile-info-block-title">Thời gian làm việc</div>
                  <div>T2-CN: 7:00-22:00</div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>Phản hồi trung bình: {coach.responseTime}</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ color: '#0ea5e9', fontWeight: 600 }}>Ngôn ngữ: Tiếng Việt, English, 日本語</span>
                  </div>
                </div>
              </div>
            )}
            {tab === 'method' && (
              <div style={{fontSize: 16, color: '#047857'}}>
                <b>Phương pháp coaching:</b> <br/>
                {coach.method || 'Áp dụng các phương pháp khoa học, cá nhân hóa cho từng khách hàng, kết hợp tâm lý trị liệu và coaching hiện đại.'}
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
                <div>Email: <a href={`mailto:${coach.email || 'coach@example.com'}`}>{coach.email || 'coach@example.com'}</a></div>
                <div>Điện thoại: <a href={`tel:${coach.phone || '0123456789'}`}>{coach.phone || '0123 456 789'}</a></div>
                <div>Địa chỉ: {coach.address || 'Hà Nội, Việt Nam'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CoachProfile;
