import React from 'react';
import { useNavigate } from 'react-router-dom';
import CoachCard from '../components/CoachCard';
import '../assets/CSS/CoachDashBoard.css';

export const coaches = [
  {
    id: 1,
    initials: 'ML',
    title: 'TS.BS',
    name: 'Nguyễn Thị Mai Lan',
    rating: 4.9,
    experience: '12 năm',
    online: true,
    busy: false,
    reviews: 127,
    badges: ['NLP Master', 'Certified Life Coach'],
    specialties: ['Chuyên gia cai nghiện', 'Tâm lý trị liệu', 'Y học gia đình'],
    successRate: 87,
    clients: 543,
    tags: ['Chuyên nghiệp', 'Kinh nghiệm'],
    profile: 'Tốt nghiệp ĐH Y Hà Nội, từng giúp hơn 500 người bỏ thuốc thành công.',
    location: 'Hà Nội',
    responseTime: '< 30 phút',
  },
  {
    id: 1,
    initials: 'ML',
    title: 'TS.BS',
    name: 'Nguyễn Thị Mai Lan',
    rating: 4.9,
    experience: '12 năm',
    online: true,
    busy: false,
    reviews: 127,
    badges: ['NLP Master', 'Certified Life Coach'],
    specialties: ['Chuyên gia cai nghiện', 'Tâm lý trị liệu', 'Y học gia đình'],
    successRate: 87,
    clients: 543,
    tags: ['Chuyên nghiệp', 'Kinh nghiệm'],
    profile: 'Tốt nghiệp ĐH Y Hà Nội, từng giúp hơn 500 người bỏ thuốc thành công.',
    location: 'Hà Nội',
    responseTime: '< 30 phút',
  },
  {
    id: 1,
    initials: 'ML',
    title: 'TS.BS',
    name: 'Nguyễn Thị Mai Lan',
    rating: 4.9,
    experience: '12 năm',
    online: true,
    busy: false,
    reviews: 127,
    badges: ['NLP Master', 'Certified Life Coach'],
    specialties: ['Chuyên gia cai nghiện', 'Tâm lý trị liệu', 'Y học gia đình'],
    successRate: 87,
    clients: 543,
    tags: ['Chuyên nghiệp', 'Kinh nghiệm'],
    profile: 'Tốt nghiệp ĐH Y Hà Nội, từng giúp hơn 500 người bỏ thuốc thành công.',
    location: 'Hà Nội',
    responseTime: '< 30 phút',
  },
  // ...thêm các coach khác tương tự, đủ trường
];

function CoachDashBoard() {
  const navigate = useNavigate();

  return (
    <div className="coach-dashboard-bg">
      <div className="coach-dashboard-header">
        <h2>Chọn <span style={{ color: '#1abc9c' }}>Coach</span> phù hợp</h2>
        <p>Tìm chuyên gia tư vấn phù hợp nhất cho hành trình cai thuốc lá của bạn.<br />Tất cả coach đều được kiểm định chuyên môn.</p>
        <div className="coach-dashboard-stats">
          <div><div>6</div><span>Chuyên gia</span></div>
          <div><div>4.8</div><span>Đánh giá TB</span></div>
          <div><div>84%</div><span>Tỷ lệ thành công</span></div>
          <div><div>1.9K+</div><span>Khách hàng</span></div>
        </div>
      </div>
      {/* Bộ lọc tìm kiếm có thể thêm ở đây */}
      <div className="coach-list">
        {coaches.map(coach => (
          <CoachCard
            key={coach.id}
            coach={coach}
            onViewDetail={() => navigate(`/coach/${coach.id}`)}
          />
        ))}
      </div>
  );
    </div>
  );
}

export default CoachDashBoard;