import './AdminPage.css';
import { useState, useRef, useEffect } from 'react';
import { FaUser, FaEdit, FaPause, FaEllipsisV, FaStar, FaComments } from 'react-icons/fa';
import axios from 'axios';

function AdminCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', exp: '', rating: '' });
  const [selected, setSelected] = useState(null);
  const [openMenu, setOpenMenu] = useState(null); // coach id for dropdown
  const [showReviews, setShowReviews] = useState(false);
  const [selectedCoachReviews, setSelectedCoachReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(false);
  const menuRef = useRef();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  
  useEffect(() => {
    async function fetchCoaches() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/users/getAll', {
          headers: token ? { Authorization: 'Bearer ' + token } : {}
        });
       
        if (Array.isArray(res.data)) {
          const coaches = res.data.filter(u => u.roles && u.roles.includes('COACH'));
          setCoaches(coaches);
        }
      } catch (err) {
        console.error('Error fetching coaches:', err);
      }
    }
    fetchCoaches();
  }, []);

  // Fetch reviews for a specific coach (Admin cần API khác để lấy tất cả reviews)
  const fetchCoachReviews = async (coachId) => {
    try {
      setLoadingReviews(true);
      const token = localStorage.getItem('token');
      
      // TODO: Uncomment khi đã implement API admin
      /*
      const res = await axios.get(`/api/coach-reviews/coach/${coachId}`, {
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      });
      
      if (res.data?.status === 'success' || res.data?.message === 'Coach reviews retrieved successfully') {
        setSelectedCoachReviews(res.data.data || []);
        setLoadingReviews(false);
        return;
      }
      */
      
      // MOCK DATA - Xóa khi đã có API thực
      const mockReviews = [
        {
          reviewId: 1,
          coachId: coachId,
          rating: 5,
          comment: "Coach rất tận tâm và hỗ trợ tốt trong quá trình cai thuốc. Rất hài lòng!",
          memberName: "Nguyễn Văn A",
          createdAt: "2024-07-01T10:00:00Z"
        },
        {
          reviewId: 2,
          coachId: coachId,
          rating: 4,
          comment: "Kế hoạch cai thuốc rất chi tiết và hiệu quả. Coach luôn động viên khi gặp khó khăn.",
          memberName: "Trần Thị B",
          createdAt: "2024-07-05T14:30:00Z"
        },
        {
          reviewId: 3,
          coachId: coachId,
          rating: 5,
          comment: "Đã cai thuốc thành công nhờ sự hướng dẫn của coach. Rất chuyên nghiệp!",
          memberName: "Lê Văn C",
          createdAt: "2024-07-08T09:15:00Z"
        }
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setSelectedCoachReviews(mockReviews);
        setLoadingReviews(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching coach reviews:', err);
      setSelectedCoachReviews([]);
      setLoadingReviews(false);
    }
  };

  // Fetch review statistics for a coach
  const fetchReviewStats = async (coachId) => {
    try {
      const token = localStorage.getItem('token');
      
      // TODO: Uncomment khi đã implement API admin
      /*
      const res = await axios.get(`/api/coach-reviews/coach/${coachId}/statistics`, {
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      });
      
      if (res.data?.status === 'success' || res.data?.message === 'Coach review statistics retrieved successfully') {
        setReviewStats(res.data.data || {});
        return;
      }
      */
      
      // MOCK DATA - Xóa khi đã có API thực
      const mockStats = {
        totalReviews: 3,
        averageRating: 4.7,
        ratingDistribution: {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 1,
          "5": 2
        },
        positiveReviews: 3,
        recentReviews: 3
      };
      
      setReviewStats(mockStats);
    } catch (err) {
      console.error('Error fetching review stats:', err);
      setReviewStats({});
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // TODO: Uncomment khi đã implement API admin
      /*
      await axios.delete(`/api/coach-reviews/${reviewId}`, {
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      });
      */
      
      // MOCK: Remove from current state
      setSelectedCoachReviews(prev => prev.filter(r => r.reviewId !== reviewId));
      alert('Đã xóa đánh giá thành công');
      
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Có lỗi khi xóa đánh giá');
    }
  };

  const handleAdd = async e => {
    e.preventDefault();
    
    const payload = {
      username: form.username,
      email: form.email,
      fullName: form.name
    };
    try {
      const res = await fetch('/api/coach/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && { 'Authorization': 'Bearer ' + localStorage.getItem('token') })
        },
        body: JSON.stringify(payload)
      });
      if (res.status === 409) {
        alert('Email hoặc username đã tồn tại!');
        return;
      }
      if (!res.ok) {
        alert('Có lỗi khi tạo coach!');
        return;
      }
      alert('Tạo coach thành công, mật khẩu đã gửi về email!');
      setCoaches([
        ...coaches,
        { ...form, id: Date.now(), status: 'active', plans: 0 }
      ]);
      setForm({ name: '', username: '', email: '', phone: '', exp: '', rating: '' });
      setShowAdd(false);
    } catch (err) {
      alert('Có lỗi khi tạo coach!');
    }
  };

  const handleViewReviews = async (coach) => {
    setSelected(coach);
    setShowReviews(true);
    await fetchCoachReviews(coach.id || coach.userId);
    await fetchReviewStats(coach.id || coach.userId);
  };

  return (
    <div className="admin-page">
      <h2>Quản lý Coach</h2>
      <div style={{display:'flex',alignItems:'center',gap:24,marginBottom:16}}>
        <div style={{background:'#e0f2f1',color:'#047857',borderRadius:16,padding:'24px 32px',minWidth:120,display:'flex',flexDirection:'column',alignItems:'center',boxShadow:'0 2px 8px #0001',fontWeight:600,fontSize:22}}>
          {coaches.length}
          <div style={{fontSize:15,fontWeight:500,marginTop:6,color:'#047857'}}>Tổng coach</div>
        </div>
        <button className="admin-btn" onClick={() => setShowAdd(true)}>+ Thêm Coach</button>
      </div>
      {showAdd && (
        <div className="admin-modal">
          <form className="admin-modal-content" onSubmit={handleAdd}>
            <button className="admin-modal-close" style={{top: 8, right: 12, fontSize: 28}} onClick={() => setShowAdd(false)} type="button">×</button>
            <h3>Thêm Coach mới</h3>
            <input required placeholder="Họ tên" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input required placeholder="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            <input required placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
           <button className="admin-btn" type="submit">Thêm</button>
          </form>
        </div>
      )}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Họ tên</th><th>Email</th><th>Số điện thoại</th><th>Kinh nghiệm</th><th>Kế hoạch hỗ trợ</th><th>Đánh giá</th><th>Trạng thái</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {coaches.map(c => (
            <tr key={c.id}>
              <td>{c.fullName || c.name}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.exp}</td><td>{c.plans}</td><td>{c.rating}</td>
              <td><span className={c.status === 'active' ? 'active' : 'inactive'}>{c.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</span></td>
              <td style={{position:'relative'}}>
                <button
                  className="admin-btn admin-btn-more"
                  onClick={e => {
                    e.stopPropagation();
                    setOpenMenu(openMenu === c.id ? null : c.id);
                  }}
                  style={{padding: '6px 10px', borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#222', lineHeight: 1}}
                  title="Thao tác"
                >
                  <FaEllipsisV size={18} color="#222" style={{verticalAlign:'middle'}} />
                </button>
                {openMenu === c.id && (
                  <div
                    ref={menuRef}
                    style={{
                      position: 'fixed',
                      top: (window.event && window.event.clientY ? window.event.clientY + 8 : 100),
                      left: (window.event && window.event.clientX ? window.event.clientX - 160 : 100),
                      background: '#fff',
                      boxShadow: '0 2px 8px #0002',
                      borderRadius: 8,
                      zIndex: 1000,
                      minWidth: 150,
                      padding: '6px 0'
                    }}
                  >
                    <button
                      className="admin-btn admin-btn-menu"
                      style={{
                        display:'flex',alignItems:'center',gap:8,width:'100%',background:'none',border:'none',padding:'8px 16px',cursor:'pointer',
                        color:'#222',fontSize:'1rem',textAlign:'left',fontWeight:500
                      }}
                      onClick={() => { setSelected(c); setOpenMenu(null); }}
                    >
                      <FaUser /> <span style={{color:'#222'}}>Xem hồ sơ</span>
                    </button>
                    <button
                      className="admin-btn admin-btn-menu"
                      style={{
                        display:'flex',alignItems:'center',gap:8,width:'100%',background:'none',border:'none',padding:'8px 16px',cursor:'pointer',
                        color:'#1e40af',fontSize:'1rem',textAlign:'left',fontWeight:500
                      }}
                      onClick={() => { handleViewReviews(c); setOpenMenu(null); }}
                    >
                      <FaStar /> <span style={{color:'#1e40af'}}>Xem đánh giá</span>
                    </button>
                    <button
                      className="admin-btn admin-btn-menu"
                      style={{
                        display:'flex',alignItems:'center',gap:8,width:'100%',background:'none',border:'none',padding:'8px 16px',cursor:'pointer',
                        color:'#222',fontSize:'1rem',textAlign:'left',fontWeight:500
                      }}
                      onClick={() => {  setOpenMenu(null); }}
                    >
                      <FaEdit /> <span style={{color:'#222'}}>Chỉnh sửa</span>
                    </button>
                    <button
                      className="admin-btn admin-btn-menu"
                      style={{
                        display:'flex',alignItems:'center',gap:8,width:'100%',background:'none',border:'none',padding:'8px 16px',cursor:'pointer',
                        color:'#ef4444',fontSize:'1rem',textAlign:'left',fontWeight:500
                      }}
                      onClick={() => {  setOpenMenu(null); }}
                    >
                      <FaPause /> <span style={{color:'#ef4444'}}>Tạm dừng</span>
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && !showReviews && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <button className="admin-modal-close" style={{top: 8, right: 12, fontSize: 28}} onClick={() => setSelected(null)} type="button">×</button>
            <h3>Thông tin Coach</h3>
            <div><b>Họ tên:</b> {selected.name}</div>
            <div><b>Username:</b> {selected.username}</div>
            <div><b>Email:</b> {selected.email}</div>
            <div><b>Kinh nghiệm:</b> {selected.exp}</div>
            <div><b>Kế hoạch hỗ trợ:</b> {selected.plans}</div>
            <div><b>Đánh giá:</b> {selected.rating}</div>
            <div><b>Trạng thái:</b> {selected.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</div>
          </div>
        </div>
      )}

      {/* Modal đánh giá coach */}
      {showReviews && selected && (
        <div className="admin-modal" style={{background: 'rgba(0,0,0,0.6)'}}>
          <div className="admin-modal-content" style={{maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'auto'}}>
            <button 
              className="admin-modal-close" 
              style={{top: 8, right: 12, fontSize: 28}} 
              onClick={() => {setShowReviews(false); setSelected(null);}} 
              type="button"
            >
              ×
            </button>
            
            <div style={{marginBottom: '24px'}}>
              <h3 style={{marginBottom: '8px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <FaStar color="#f59e0b" />
                Đánh giá cho Coach {selected.name || selected.fullName}
              </h3>
              <p style={{margin: 0, color: '#666', fontSize: '0.9rem'}}>{selected.email}</p>
            </div>

            {/* Thống kê tổng quan */}
            <div style={{
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px', 
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #0ea5e9',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '4px'}}>
                  {selectedCoachReviews.length}
                </div>
                <div style={{fontSize: '0.9rem', color: '#0369a1'}}>Tổng đánh giá</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #f59e0b',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
                  {selectedCoachReviews.length > 0 
                    ? (selectedCoachReviews.reduce((sum, r) => sum + r.rating, 0) / selectedCoachReviews.length).toFixed(1)
                    : '0.0'
                  }
                  <FaStar size={20} />
                </div>
                <div style={{fontSize: '0.9rem', color: '#92400e'}}>Điểm trung bình</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #16a34a',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '4px'}}>
                  {selectedCoachReviews.filter(r => r.rating >= 4).length}
                </div>
                <div style={{fontSize: '0.9rem', color: '#15803d'}}>Đánh giá tích cực</div>
              </div>
            </div>

            {/* Danh sách đánh giá */}
            <div>
              <h4 style={{marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <FaComments />
                Chi tiết đánh giá ({selectedCoachReviews.length})
              </h4>
              
              {loadingReviews ? (
                <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                  <div style={{marginBottom: '12px'}}>⏳</div>
                  Đang tải đánh giá...
                </div>
              ) : selectedCoachReviews.length === 0 ? (
                <div style={{
                  textAlign: 'center', 
                  padding: '40px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  color: '#6b7280'
                }}>
                  <div style={{fontSize: '3rem', marginBottom: '12px'}}>📝</div>
                  <p>Chưa có đánh giá nào cho coach này</p>
                </div>
              ) : (
                <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                  {selectedCoachReviews.map((review, index) => (
                    <div key={review.reviewId || index} style={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px'}}>
                        <div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
                            <div style={{display: 'flex', gap: '2px'}}>
                              {Array.from({length: 5}, (_, i) => (
                                <FaStar 
                                  key={i} 
                                  size={16} 
                                  color={i < review.rating ? '#f59e0b' : '#e5e7eb'} 
                                />
                              ))}
                            </div>
                            <span style={{fontWeight: '600', color: '#374151'}}>
                              {review.rating}/5 sao
                            </span>
                          </div>
                          <div style={{fontSize: '0.85rem', color: '#6b7280'}}>
                            Bởi: {review.memberName || 'Thành viên'} • {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </div>
                        </div>
                        
                        {/* Nút xóa review */}
                        <button
                          onClick={() => handleDeleteReview(review.reviewId)}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            color: '#dc2626',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = '#fecaca';
                            e.target.style.color = '#b91c1c';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = '#fee2e2';
                            e.target.style.color = '#dc2626';
                          }}
                          title="Xóa đánh giá"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                      
                      {review.comment && (
                        <div style={{
                          background: '#f9fafb',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '0.95rem',
                          color: '#374151',
                          lineHeight: '1.5'
                        }}>
                          "{review.comment}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminCoaches;
