import React from 'react';
import '../assets/CSS/Ranking.css';

const Ranking = () => {
  const topUsers = [
    { rank: 1, name: 'Nguyễn Văn A', days: 120, emoji: '🥇' },
    { rank: 2, name: 'Trần Văn B', days: 85, emoji: '🥈' },
    { rank: 3, name: 'Lê Thị C', days: 70, emoji: '🥉' }
  ];

  const others = [
    { rank: 4, name: 'Bạn', days: 60, reward: '🎖 Huy hiệu Bạc', isYou: true },
    { rank: 5, name: 'Nguyễn D', days: 55, reward: '🎖 Huy hiệu Đồng' },
    { rank: 6, name: 'Phạm E', days: 50, reward: '-' }
  ];

  const badges = [
    { day: 7, icon: '🌱', title: 'Mầm Sống Mới', desc: 'Khởi đầu mạnh mẽ!' },
    { day: 14, icon: '🌿', title: 'Sức Mạnh Ý Chí', desc: 'Kiên định vượt khó.' },
    { day: 30, icon: '🍀', title: 'Chiến Binh Không Khói', desc: 'Bạn đang làm chủ!' },
    { day: 60, icon: '🌞', title: 'Ánh Sáng Hy Vọng', desc: 'Cơ thể hồi phục rõ rệt.' },
    { day: 100, icon: '🏅', title: 'Người Truyền Cảm Hứng', desc: 'Bạn là tấm gương!' }
  ];

  return (
    <div className="container">
      <h1>🏆 Bảng Xếp Hạng Thành Viên</h1>
      <p className="subtitle">Cùng nhau hướng đến một cuộc sống không khói thuốc!</p>

      <div className="top3">
        {topUsers.map(user => (
          <div key={user.rank} className="userCard">
            <div className="emoji">{user.emoji}</div>
            <h3>{user.name}</h3>
            <p>{user.days} ngày</p>
          </div>
        ))}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Hạng</th>
            <th>Thành viên</th>
            <th>Ngày không hút thuốc</th>
            <th>Phần thưởng</th>
          </tr>
        </thead>
        <tbody>
          {others.map(user => (
            <tr key={user.rank} className={user.isYou ? "highlight" : ""}>
              <td>{user.rank}</td>
              <td>{user.name}</td>
              <td>{user.days}</td>
              <td>{user.reward}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="badges">
        <h2>🎖 Huy Hiệu Thành Tích</h2>
        <div className="badgeList">
          {badges.map(badge => (
            <div key={badge.day} className="badgeCard">
              <div className="icon">{badge.icon}</div>
              <h4>{badge.title}</h4>
              <p>{badge.desc}</p>
              <span>{badge.day} ngày</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Ranking;
