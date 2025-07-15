import './AdminPage.css';
import { useState, useRef, useEffect } from 'react';
import { FaUser, FaEdit, FaPause, FaEllipsisV, FaStar, FaComments } from 'react-icons/fa';
import axios from 'axios';

function AdminCoaches() {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

  const fetchCoachReviews = async (coachId) => {
    try {
      setLoadingReviews(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5175/api/coach-reviews/coach/${coachId}`, {
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      });
      // API trả về mảng review trực tiếp
      const reviews = Array.isArray(res.data) ? res.data : [];
      setSelectedCoachReviews(reviews);
      setLoadingReviews(false);
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
      const res = await axios.get(`http://localhost:5175/api/coach-reviews/admin/statistics/${coachId}`, {
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      });
      if (res.data) {
        setReviewStats(res.data);
      } else {
        setReviewStats({});
      }
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
      await axios.delete(`/api/coach-reviews/${reviewId}`, {
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      });
      setSelectedCoachReviews(prev => prev.filter(r => r.reviewId !== reviewId));
      setSuccessMessage('Đã xóa đánh giá thành công');
    } catch (err) {
      console.error('Error deleting review:', err);
      setErrorMessage('Có lỗi khi xóa đánh giá');
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
        setErrorMessage('Email hoặc username đã tồn tại!');
        setSuccessMessage('');
        return;
      }
      if (!res.ok) {
        setErrorMessage('Có lỗi khi tạo coach!');
        setSuccessMessage('');
        return;
      }
      setSuccessMessage('Tạo coach thành công, mật khẩu đã gửi về email!');
      setErrorMessage('');
      setCoaches([
        ...coaches,
        { ...form, id: Date.now(), status: 'active', plans: 0 }
      ]);
      setForm({ name: '', username: '', email: '', phone: '', exp: '', rating: '' });
      setShowAdd(false);
    } catch (err) {
      setErrorMessage('Có lỗi khi tạo coach!');
      setSuccessMessage('');
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
            {successMessage && (
              <div style={{background:'#e0fbe0',color:'#15803d',padding:'10px 18px',borderRadius:'8px',fontWeight:600,marginBottom:12,boxShadow:'0 2px 8px #0001',textAlign:'center'}}>{successMessage}</div>
            )}
            {errorMessage && (
              <div style={{background:'#fee2e2',color:'#b91c1c',padding:'10px 18px',borderRadius:'8px',fontWeight:600,marginBottom:12,boxShadow:'0 2px 8px #0001',textAlign:'center'}}>{errorMessage}</div>
            )}
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
            <th>Họ tên</th>
            <th>Email</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {coaches.map(c => (
            <tr key={c.id}>
              <td>{c.fullName || c.name}</td>
              <td>{c.email}</td>
              <td><span className={c.status && c.status.toLowerCase() === 'active' ? 'active' : 'inactive'}>{c.status && c.status.toLowerCase() === 'active' ? 'Hoạt động' : 'Không hoạt động'}</span></td>
              <td style={{position:'relative', display:'flex', gap:8}}>
                <button
                  className="admin-btn admin-btn-menu"
                  style={{display:'flex',alignItems:'center',gap:8,background:'#e0e7ff',border:'none',padding:'8px 16px',cursor:'pointer',color:'#222',fontSize:'1rem',borderRadius:8,fontWeight:500}}
                  onClick={() => setSelected(c)}
                  title="Xem hồ sơ"
                >
                  <FaUser /> <span style={{color:'#222'}}>Xem hồ sơ</span>
                </button>
                <button
                  className="admin-btn admin-btn-menu"
                  style={{display:'flex',alignItems:'center',gap:8,background:'#fef3c7',border:'none',padding:'8px 16px',cursor:'pointer',color:'#1e40af',fontSize:'1rem',borderRadius:8,fontWeight:500}}
                  onClick={() => handleViewReviews(c)}
                  title="Xem đánh giá"
                >
                  <FaStar /> <span style={{color:'#1e40af'}}>Xem đánh giá</span>
                </button>
                {/* Các thao tác khác nếu cần */}
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
            <div><b>Họ tên:</b> {selected.fullName || selected.name}</div>
            <div><b>Username:</b> {selected.username}</div>
            <div><b>Email:</b> {selected.email}</div>
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
                  {reviewStats.totalReviews !== undefined ? reviewStats.totalReviews : '...'}
                </div>
                <div style={{fontSize: '0.9rem', color: '#0369a1'}}>Tổng người review</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #f59e0b',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
                  {reviewStats.averageRating !== undefined ? reviewStats.averageRating : '...'}
                  <FaStar size={20} />
                </div>
                <div style={{fontSize: '0.9rem', color: '#92400e'}}>Điểm trung bình</div>
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
                            Bởi: {review.reviewerName || 'Ẩn danh'} • {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
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
                      
                      <div style={{
                        background: '#f9fafb',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '0.95rem',
                        color: '#374151',
                        lineHeight: '1.5'
                      }}>
                        {review.comment && review.comment.trim() !== ''
                          ? `"${review.comment}"`
                          : <span style={{color:'#9ca3af'}}>Không có nhận xét nào.</span>
                        }
                      </div>
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
