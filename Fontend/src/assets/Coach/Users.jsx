import React from 'react';
import './Users.css';

const users = [
  {
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@email.com',
    phone: '0987654321',
    joinDate: '15/01/2024',
    lastSession: '2 ngày trước',
    progress: 75,
    status: 'Đang tích cực',
    goal: 'Cai thuốc lá hoàn toàn',
    note: 'Tiến bộ tốt, động lực cao',
    statusColor: 'green'
  },
  {
    name: 'Trần Thị Bình',
    email: 'tranthibinh@email.com',
    phone: '0912345678',
    joinDate: '20/01/2024',
    lastSession: '5 ngày trước',
    progress: 45,
    status: 'Cần chú ý',
    goal: 'Giảm từ 1 bao/ngày xuống 5 điếu/ngày',
    note: 'Cần theo dõi thêm, có dấu hiệu chững xuống',
    statusColor: 'orange'
  },
  {
    name: 'Lê Hoàng Cường',
    email: 'lecuong@email.com',
    phone: '0901234567',
    joinDate: '10/01/2024',
    lastSession: '7 ngày trước',
    progress: 0,
    status: 'Không hoạt động',
    goal: 'Cai thuốc lá',
    note: 'Chưa có tiến triển',
    statusColor: 'red'
  }
];

function Users() {
  return (
    <div>
      <h2>Danh sách khách hàng</h2>
      <div className="user-list">
        {users.map((user, idx) => (
          <div className="user-card" key={idx}>
            <div className="user-avatar">
              {user.name.split(' ').map(w=>w[0]).join('')}
            </div>
            <div className="user-info">
              <div className="user-info-header">
                <span className="user-name">{user.name}</span>
                
              </div>
              <div className="user-contact">Email: <b>{user.email}</b> | SĐT: <b>{user.phone}</b></div>
              <div className="user-dates">Tham gia: {user.joinDate} | Phiên gần nhất: <b>{user.lastSession}</b></div>
              <div className="user-progress-container">
                <div className="user-progress-bar">
                  <div className="user-progress" style={{width:user.progress+'%'}}></div>
                </div>
                <span className="user-progress-percentage">{user.progress}%</span>
              </div>
              <div className="user-goal">Mục tiêu: <b>{user.goal}</b></div>
              <div className="user-note">Ghi chú: {user.note}</div>
              <div className="user-actions">
                <button className="action-button">Gọi</button>
                <button className="action-button">Email</button>
                <button className="action-button">Hẹn</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Users;
