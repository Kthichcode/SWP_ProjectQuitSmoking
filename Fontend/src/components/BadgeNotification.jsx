import React, { useState, useEffect } from 'react';
import './BadgeNotification.css';

const BadgeNotification = ({ badges, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Khớp với thời gian animation
  };

  return (
    <div className={`badge-notification-container ${isClosing ? 'closing' : ''}`}>
      <div className="badge-notification-header">
        <h3>🎉 Chúc mừng! 🎉</h3>
        <button onClick={handleClose} className="close-button">×</button>
      </div>
      <p>Bạn vừa nhận được {badges.length} badge mới:</p>
      <div className="badge-list">
        {badges.map((badge, index) => (
          <div key={index} className="badge-item">
            <div className="badge-icon">🏆</div>
            <div className="badge-info">
              <h4>{badge.name}</h4>
              <p>{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleClose} className="btn-main">Tuyệt vời!</button>
    </div>
  );
};

export default BadgeNotification;