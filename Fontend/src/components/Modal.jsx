import React, { useEffect } from 'react';
import './Modal.css';


function Modal({ title, children, onClose }) {
    useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <div className="modal-body">{children}</div>
                <button onClick={onClose} className="modal-close">Đóng</button>
            </div>
        </div>
    );
}

export default Modal;
