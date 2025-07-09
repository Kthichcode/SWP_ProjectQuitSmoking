import axiosInstance from '../../axiosInstance';

export const coachReviewService = {
  // Tạo review mới
  createReview: async (reviewData) => {
    try {
      const response = await axiosInstance.post('/api/coach-reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Cập nhật review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await axiosInstance.put(`/api/coach-reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Lấy danh sách review của member hiện tại
  getMyReviews: async () => {
    try {
      const response = await axiosInstance.get('/api/coach-reviews/my-reviews-member');
      return response.data;
    } catch (error) {
      console.error('Error fetching member reviews:', error);
      throw error;
    }
  },

  // Lấy review cho một coach cụ thể
  getReviewForCoach: async (coachId) => {
    try {
      const response = await coachReviewService.getMyReviews();
      if (response?.data) {
        const reviews = response.data;
        return reviews.find(review => review.coachId === coachId) || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching review for coach:', error);
      return null;
    }
  },

  // Kiểm tra xem user đã review coach chưa
  hasReviewedCoach: async (coachId) => {
    try {
      const review = await coachReviewService.getReviewForCoach(coachId);
      return review !== null;
    } catch (error) {
      console.error('Error checking if coach is reviewed:', error);
      return false;
    }
  }
};

export default coachReviewService;
