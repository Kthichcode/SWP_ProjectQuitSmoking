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

  const [badges, setBadges] = React.useState([]);
  const [badgesLoading, setBadgesLoading] = React.useState(true);
  const [badgesError, setBadgesError] = React.useState('');

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setBadgesLoading(true);
        setBadgesError('');
        const res = await fetch('http://localhost:5175/api/badges/GetAll');
        const data = await res.json();
        if (Array.isArray(data)) {
          setBadges(data);
        } else {
          setBadges([]);
        }
      } catch (err) {
        setBadgesError('Không thể tải huy hiệu');
        setBadges([]);
      } finally {
        setBadgesLoading(false);
      }
    };
    fetchBadges();
  }, []);

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
                <div key={user.memberId} className={`userCard top${idx + 1}`}>
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
        {badgesLoading ? (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>Đang tải huy hiệu...</div>
        ) : badgesError ? (
          <div style={{ color: 'red', textAlign: 'center', margin: '20px 0' }}>{badgesError}</div>
        ) : (
          <div className="badgeList">
            {badges.map(badge => (
              <div key={badge.id} className="badgeCard">
                {badge.iconUrl ? (
                  <img src={badge.iconUrl} alt={badge.name} className="icon" style={{ width: 40, height: 40, marginBottom: 8 }} />
                ) : (
                  <div className="icon" style={{ fontSize: 32, marginBottom: 8 }}>🏅</div>
                )}
                <h4>{badge.name}</h4>
                {/* Optionally show description or score if needed */}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Ranking;
