import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Users.css';


function Users() {
  const navigate = useNavigate();
  const handleGoToMessages = () => {
    navigate('/coach/messages');
  };
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberDeclarations, setMemberDeclarations] = useState({}); // { [memberId]: info }
  const [loadingDeclarations, setLoadingDeclarations] = useState({}); // { [memberId]: boolean }
  const [errorDeclarations, setErrorDeclarations] = useState({}); // { [memberId]: string|null }
  const [openDeclarations, setOpenDeclarations] = useState({}); // { [memberId]: boolean }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/coach-members/my-members', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setUsers(res.data.data || []);
      } catch (err) {
        setError('Không thể tải danh sách thành viên');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleViewDeclaration = async (memberId) => {
    setLoadingDeclarations(prev => ({ ...prev, [memberId]: true }));
    setErrorDeclarations(prev => ({ ...prev, [memberId]: null }));
    setOpenDeclarations(prev => ({ ...prev, [memberId]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5175/api/member-initial-info/my-members?memberId=${memberId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      // Lọc đúng khai báo theo memberId
      const memberInfo = Array.isArray(res.data.data)
        ? res.data.data.find(item => item.memberId === memberId)
        : null;
      setMemberDeclarations(prev => ({ ...prev, [memberId]: memberInfo || null }));
    } catch (err) {
      setErrorDeclarations(prev => ({ ...prev, [memberId]: 'Không thể tải thông tin khai báo của thành viên' }));
    } finally {
      setLoadingDeclarations(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleCloseDeclaration = (memberId) => {
    setOpenDeclarations(prev => ({ ...prev, [memberId]: false }));
  };

  return (
    <div>
      <h2>Danh sách người dùng</h2>
      {loading && <div>Đang tải...</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      <div className="user-list">
        {users.map((user, idx) => {
          const memberId = user.id || user.memberId;
          return (
            <div className="user-card" key={memberId || idx}>
              <div className="user-info" style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:24,flexWrap:'wrap'}}>
                <div style={{display:'flex',flexDirection:'column',gap:8,minWidth:260,flex:1}}>
                  <span className="user-name" style={{fontWeight:700,fontSize:'1.13rem',color:'#222',marginBottom:2}}>{user.fullName || user.name}</span>
                  <span className="user-contact" style={{fontSize:'1rem',color:'#444'}}>Email: <b>{user.email}</b> | SĐT: <b>{user.phone || user.phoneNumber || '-'}</b></span>
                  {openDeclarations[memberId] && (
                    <div className="member-declaration-info" style={{marginTop:12,background:'#fff',borderRadius:12,padding:'18px 22px',boxShadow:'0 2px 8px rgba(33,150,243,0.06)',maxWidth:420}}>
                      {loadingDeclarations[memberId] && <div>Đang tải thông tin khai báo...</div>}
                      {errorDeclarations[memberId] && <div style={{color:'red'}}>{errorDeclarations[memberId]}</div>}
                      {memberDeclarations[memberId]
                        ? (
                          memberDeclarations[memberId].memberId === memberId || memberDeclarations[memberId].id === memberId
                            ? <>
                                <h3 style={{fontSize:'1.13rem',marginBottom:10}}>Thông tin khai báo ban đầu của thành viên</h3>
                                <div style={{marginBottom:3}}><b>Họ tên:</b> {memberDeclarations[memberId].fullName}</div>
                                <div style={{marginBottom:3}}><b>Số năm hút thuốc:</b> {memberDeclarations[memberId].yearsSmoking}</div>
                                <div style={{marginBottom:3}}><b>Số điếu mỗi ngày:</b> {memberDeclarations[memberId].cigarettesPerDay}</div>
                                <div style={{marginBottom:3}}><b>Lý do cai thuốc:</b> {memberDeclarations[memberId].reasonToQuit}</div>
                                <div style={{marginBottom:8}}><b>Tình trạng sức khỏe:</b> {memberDeclarations[memberId].healthStatus}</div>
                              </>
                            : <div style={{color:'orange'}}>Thông tin khai báo không khớp với thành viên này. Vui lòng kiểm tra lại dữ liệu!</div>
                        )
                        : <div style={{color:'gray'}}>Không có thông tin khai báo cho thành viên này.</div>
                      }
                      <button className="action-button" style={{marginTop:8,padding:'7px 22px',borderRadius:7,border:'none',background:'#2d6cdf',color:'#fff',fontWeight:600,fontSize:'1rem',cursor:'pointer'}} onClick={() => handleCloseDeclaration(memberId)}>Đóng</button>
                    </div>
                  )}
                </div>
                <div className="user-actions" style={{display:'flex',flexDirection:'column',gap:12,minWidth:160,alignItems:'flex-end',marginTop:8}}>
                  <button className="action-button" style={{padding:'8px 22px',borderRadius:8,border:'none',background:'#43a047',color:'#fff',fontWeight:600,fontSize:'1rem',cursor:'pointer',boxShadow:'0 2px 8px rgba(67,160,71,0.10)',transition:'all 0.16s',minWidth:120}} onClick={() => handleViewDeclaration(memberId)}>Xem khai báo</button>
                  <button className="action-button" style={{padding:'8px 22px',borderRadius:8,border:'none',background:'#43a047',color:'#fff',fontWeight:600,fontSize:'1rem',cursor:'pointer',boxShadow:'0 2px 8px rgba(67,160,71,0.10)',transition:'all 0.16s',minWidth:120}} onClick={handleGoToMessages}>Tin nhắn</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Users;
