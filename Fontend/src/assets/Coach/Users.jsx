
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Users.css';


function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users/getAll');
        setUsers(res.data);
      } catch (err) {
        setError('Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Danh sách người dùng</h2>
      {loading && <div>Đang tải...</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      <div className="user-list">
        {users.map((user, idx) => (
          <div className="user-card" key={user.id || idx}>
            <div className="user-avatar">
              {(user.fullName || user.name || '').split(' ').map(w=>w[0]).join('')}
            </div>
            <div className="user-info">
              <div className="user-info-header">
                <span className="user-name">{user.fullName || user.name}</span>
              </div>
              <div className="user-contact">Email: <b>{user.email}</b> | SĐT: <b>{user.phone || user.phoneNumber || '-'}</b></div>
              {/* Các trường dưới đây có thể cần chỉnh lại tuỳ theo API trả về */}
              <div className="user-dates">Tham gia: {user.joinDate || '-'} | Phiên gần nhất: <b>{user.lastSession || '-'}</b></div>
              <div className="user-progress-container">
                <div className="user-progress-bar">
                  <div className="user-progress" style={{width:(user.progress || 0)+'%'}}></div>
                </div>
                <span className="user-progress-percentage">{user.progress || 0}%</span>
              </div>
              <div className="user-goal">Mục tiêu: <b>{user.goal || '-'}</b></div>
              <div className="user-note">Ghi chú: {user.note || '-'}</div>
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
