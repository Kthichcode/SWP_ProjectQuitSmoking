import React, { useEffect } from 'react';
import '../assets/CSS/Ranking.css';

const Ranking = () => {
  const [ranking, setRanking] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('http://localhost:5175/api/member-badge/ranking');
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          // Sắp xếp theo totalScore giảm dần
          const sorted = [...data.data].sort((a, b) => b.totalScore - a.totalScore);
          setRanking(sorted);
        } else {
          setRanking([]);
        }
      } catch (err) {
        setError('Không thể tải bảng xếp hạng');
        setRanking([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    });
    return () => {
      window.removeEventListener('pageshow', () => {});
    };
  }, []);

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

      {loading ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>Đang tải bảng xếp hạng...</div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', margin: '40px 0' }}>{error}</div>
      ) : (
        <>
          <div className="top3">
            {ranking.slice(0, 3).map((user, idx) => {
              // Xử lý tên hiển thị
              let displayName = user.fullName;
              if (!displayName && user.email) {
                displayName = user.email.replace(/@gmail\.com$/, '');
              }
              return (
                <div key={user.memberId} className="userCard">
                  <div className="emoji">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />
                  ) : (
                    <div className="avatar-placeholder" style={{ width: 48, height: 48, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 8 }}>
                      {(displayName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <h3>{displayName}</h3>
                  <p>Điểm: {user.totalScore}</p>
                </div>
              );
            })}
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Thành viên</th>
                <th>Điểm thành tích</th>
              </tr>
            </thead>
            <tbody>
              {ranking.slice(3).map((user, idx) => {
                let displayName = user.fullName;
                if (!displayName && user.email) {
                  displayName = user.email.replace(/@gmail\.com$/, '');
                }
                return (
                  <tr key={user.memberId}>
                    <td>{idx + 4}</td>
                    <td>{displayName}</td>
                    <td>{user.totalScore}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

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
