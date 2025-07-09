import React, { useState } from 'react';
import './CoachRatingModal.css';

const CoachRatingModal = ({ isOpen, onClose, coach, onSubmit, existingReview = null }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Vui lòng chọn số sao để đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        coachId: coach?.coachId || coach?.userId || coach?.id
      });
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(existingReview?.rating || 0);
      setComment(existingReview?.comment || '');
      setHoverRating(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rating-modal-overlay" onClick={handleClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal-header">
          <h3>{existingReview ? 'Cập nhật đánh giá' : 'Đánh giá Coach'}</h3>
          <button className="close-btn" onClick={handleClose} disabled={submitting}>
            ✕
          </button>
        </div>

        <div className="rating-modal-content">
          <div className="coach-info-review">
            <div className="coach-avatar-small">
              {coach?.fullName?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <h4>{coach?.fullName}</h4>
              <p>{coach?.yearsOfExperience || 'N/A'} năm kinh nghiệm</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rating-section">
              <label>Đánh giá của bạn:</label>
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    disabled={submitting}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <div className="rating-text">
                {rating === 0 && 'Chưa chọn'}
                {rating === 1 && 'Rất không hài lòng'}
                {rating === 2 && 'Không hài lòng'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Hài lòng'}
                {rating === 5 && 'Rất hài lòng'}
              </div>
            </div>

            <div className="comment-section">
              <label htmlFor="comment">Nhận xét (tùy chọn):</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn với coach..."
                rows={4}
                maxLength={500}
                disabled={submitting}
              />
              <div className="char-count">{comment.length}/500</div>
            </div>

            <div className="rating-modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={handleClose}
                disabled={submitting}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={submitting || rating === 0}
              >
                {submitting ? 'Đang gửi...' : (existingReview ? 'Cập nhật' : 'Gửi đánh giá')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CoachRatingModal;
