import React, { useEffect, useState } from 'react';
import '../assets/CSS/About.css'; 

const About = () => {
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted || performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
        window.location.reload();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    fetch('http://localhost:5175/api/coach/getAllCoachProfiles')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setCoaches(data.data);
        }
      })
      .catch((err) => {
        // Có thể xử lý lỗi ở đây nếu cần
      });
  }, []);

  return (
    <div className="about-container">
      <section className="intro">
        <h2>Về NoSmoke</h2>
        <p>
          Chúng tôi là nền tảng hỗ trợ cai nghiện thuốc lá hàng đầu Việt Nam, kết hợp công nghệ tiên tiến và phương pháp khoa học để giúp bạn từ bỏ thói quen hút thuốc lâu năm.
        </p>
      </section>

      <section className="mission-bg">
        <div className="mission-vision">
          <div className="card">
            <h3>🌱 Sứ mệnh</h3>
            <p>
              Sứ mệnh của chúng tôi là giúp 1 triệu người Việt Nam cai nghiện thuốc lá thành công vào năm 2030, giúp giảm thiểu số ca tử vong và hỗ trợ hệ thống y tế trong việc giảm chi phí điều trị liên quan đến thuốc lá.
            </p>
          </div>
          <div className="card">
            <h3>🎯 Tầm nhìn</h3>
            <p>
              Tầm nhìn là trở thành 1 tổ chức hàng đầu tại Đông Nam Á trong lĩnh vực hỗ trợ cai nghiện thuốc lá, áp dụng công nghệ hiện đại và dữ liệu số để giúp người nghiện thuốc vượt qua cám dỗ và tìm lại cuộc sống lành mạnh.
            </p>
          </div>
        </div>
      </section>

      <section className="story">
        <h3>Câu chuyện của chúng tôi</h3>
        <p>
          NoSmoke được thành lập vào năm 2022 bởi một nhóm chuyên gia y tế và công nghệ, những người có chung đam mê trong việc hỗ trợ cộng đồng bỏ thuốc lá và sống một cuộc sống khỏe mạnh hơn.
        </p>
        <p>
          Bắt đầu từ chỉ vài địa phương, chúng tôi đã giúp đỡ hàng chục nghìn người trên cả nước ngừng hút thuốc. Họ tin tưởng vào phương pháp hiện đại của NoSmoke vì sự an toàn, hiệu quả và tính cá nhân hóa.
        </p>
        <p>
          Hiện nay, NoSmoke đã giúp hơn 100.000 người cai nghiện thuốc thành công và chúng tôi không ngừng nỗ lực để mở rộng hệ sinh thái hỗ trợ những người hút thuốc trên toàn quốc và cả khu vực Đông Nam Á.
        </p>
      </section>

     

      <section className="team">
        <h3>Đội ngũ của chúng tôi</h3>
        <div className="team-grid" style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
          {coaches.length === 0 ? (
            <div>Đang tải dữ liệu huấn luyện viên...</div>
          ) : (
            coaches
              .slice(0, 3)
              .map((coach) => (
                <div
                  className="member coach-card"
                  key={coach.userId}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    padding: 24,
                    minWidth: 220,
                    maxWidth: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.13)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                  }}
                >
                  {coach.imageUrl ? (
                    <img
                      src={coach.imageUrl.startsWith('http') ? coach.imageUrl : `data:image/webp;base64,${coach.imageUrl}`}
                      alt={coach.fullName || 'Coach'}
                      className="coach-avatar"
                      style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', marginBottom: 12, border: '3px solid #4caf50' }}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'coach-avatar-placeholder';
                        fallback.style.cssText = 'width:90px;height:90px;border-radius:50%;background:#eee;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:40px;border:3px solid #bdbdbd;';
                        fallback.innerHTML = '<span role="img" aria-label="avatar">👤</span>';
                        e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
                      }}
                    />
                  ) : (
                    <div
                      className="coach-avatar-placeholder"
                      style={{ width: 90, height: 90, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 40, border: '3px solid #bdbdbd' }}
                    >
                      <span role="img" aria-label="avatar">👤</span>
                    </div>
                  )}
                  <h4 style={{ margin: '8px 0 4px', fontSize: 20, color: '#222', fontWeight: 600 }}>{coach.fullName}</h4>
                  <div style={{ color: '#888', fontSize: 15, marginBottom: 6 }}>{coach.specialization || 'Chuyên môn chưa cập nhật'}</div>
                  {/* Không hiển thị rating */}
                </div>
              ))
          )}
        </div>
      </section>

      <section className="contact">
        <h3>Liên hệ với chúng tôi</h3>
        <div className="contact-desc">Bạn có câu hỏi hoặc cần hỗ trợ? Đừng ngần ngại liên hệ với đội ngũ của chúng tôi.</div>
        <div className="contact-box">
          <div className="contact-info">
            <h4>Thông tin liên hệ</h4>
            <p>SĐT: 0123 456 789</p>
            <p>Email: contact@nosmoke.vn</p>
            <p>Địa chỉ: Tầng 12, Tòa nhà ABC, Quận 1, TP. HCM</p>
          </div>
          <div className="contact-time">
            <h4>Giờ làm việc</h4>
            <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
            <p>Thứ 7: 8:00 - 12:00</p>
            <p>Chủ nhật: Đóng cửa</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
