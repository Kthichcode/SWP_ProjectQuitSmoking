import React from 'react';
import './ConfirmModal.css';

function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h3>{title || 'Xác nhận'}</h3>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-btn" onClick={onConfirm}>Đồng ý</button>
          <button className="cancel-btn" onClick={onCancel}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
