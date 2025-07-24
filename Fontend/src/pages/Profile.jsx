import React, { useState, useRef, useEffect } from "react";
import "../assets/CSS/Profile.css";
import { useAuth } from '../contexts/AuthContext';
import { AiOutlineBell, AiOutlineMail, AiOutlineLock, AiOutlineSafety, AiOutlineUser, AiOutlinePhone, AiOutlineHome, AiOutlineCalendar, AiOutlineClose } from "react-icons/ai";
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse } from 'date-fns';
import { vi } from 'date-fns/locale';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState();
  const [tab, setTab] = useState("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState();
  const modalRef = useRef();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [badges, setBadges] = useState();
  const [successMsg, setSuccessMsg] = useState('');

  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}T00:00:00`);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  useEffect(() => {
    const token = authUser?.token || authUser?.accessToken;
    if (!token) return;
    setLoadingProfile(true);
    axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const data = res.data || {};
        setUser(data);
        setEditForm(data);
      })
      .catch(() => {
        setUser(undefined);
        setEditForm(undefined);
      })
      .finally(() => setLoadingProfile(false));
  }, [authUser]);

  useEffect(() => {
    const token = authUser?.token || authUser?.accessToken;
    const userId = user?.userId || authUser?.userId;
    if (!token || !userId) return;
    axios.get(`/api/member-badge/getallbage/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
          setBadges(res.data.data);
        } else {
          setBadges([]);
        }
      })
      .catch(() => setBadges([]));
  }, [authUser, user]);

  const validateFullName = (name) => {
    if (!name) return 'Họ và tên không được bỏ trống.';
    if (name.length < 5 || name.length > 50) return 'Họ và tên phải từ 5 đến 50 ký tự.';
    if (/[^A-Za-zÀ-ỹ\s]/.test(name)) return 'Họ và tên không được chứa số hoặc ký tự đặc biệt.';
    if (/[0-9]/.test(name)) return 'Họ và tên không được chứa số.';
    // Kiểm tra viết hoa chữ cái đầu mỗi từ
    if (!name.split(' ').every(w => w && w[0] === w[0].toUpperCase())) return 'Mỗi chữ cái đầu của từ phải viết hoa.';
    return '';
  };
  const validatePhone = (phone) => {
    if (!phone) return 'Số điện thoại không được bỏ trống.';
    if (!phone.startsWith('0')) return 'Số điện thoại phải bắt đầu bằng số 0.';
    if (phone.length < 10 || phone.length > 11) return 'Số điện thoại phải có từ 10-11 số.';
    return '';
  };
  const validateAddress = (address) => {
    if (!address) return 'Địa chỉ không được bỏ trống.';
    if (address.length < 7) return 'Địa chỉ phải ít nhất 7 ký tự.';
    if (!address.includes('/')) return 'Địa chỉ phải chứa dấu /.';
    if (/[^A-Za-zÀ-ỹ0-9\s/]/.test(address)) return 'Địa chỉ không được chứa ký tự đặc biệt ngoài dấu /.';
    return '';
  };
  const validateBirthDate = (birthDate) => {
    if (!birthDate) return 'Ngày sinh không được bỏ trống.';
    // Chuyển đổi về đối tượng Date nếu là chuỗi
    let dateObj = birthDate;
    if (typeof birthDate === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
      const [day, month, year] = birthDate.split('/');
      dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
    } else if (typeof birthDate === 'string') {
      dateObj = new Date(birthDate);
    }
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return 'Ngày sinh không hợp lệ.';
    if (dateObj > new Date()) return 'Ngày sinh không được lớn hơn hôm nay.';
    // Có thể thêm kiểm tra tuổi tối thiểu/tối đa nếu cần
    return '';
  };

  const [editErrors, setEditErrors] = useState({});

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
    let error = '';
    if (name === 'fullName') error = validateFullName(value);
    if (name === 'phoneNumber') error = validatePhone(value);
    if (name === 'address') error = validateAddress(value);
    if (name === 'birthDate') error = validateBirthDate(value);
    setEditErrors({ ...editErrors, [name]: error });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const errors = {
      fullName: validateFullName(editForm.fullName),
      phoneNumber: validatePhone(editForm.phoneNumber),
      birthDate: validateBirthDate(editForm.birthDate),
      address: validateAddress(editForm.address),
    };
    // Chỉ chặn lưu nếu có lỗi thực sự
    if (Object.values(errors).filter(Boolean).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({}); // Xóa lỗi sau khi lưu thành công
    const token = authUser?.token || authUser?.accessToken;
    if (!token) return;
    setLoadingProfile(true);
    try {
      let birthDate = editForm.birthDate;
      if (birthDate instanceof Date) {
        birthDate = birthDate.toISOString().slice(0, 10);
      }
      if (typeof birthDate === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
        const [day, month, year] = birthDate.split('/');
        birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      if (!birthDate || birthDate === '') birthDate = null;
      const updateData = {
        username: editForm.username || '',
        email: editForm.email || '',
        fullName: editForm.fullName || '',
        phoneNumber: editForm.phoneNumber || '',
        birthDate: birthDate,
        address: editForm.address || '',
        gender: editForm.gender || '',
      };
      await axios.put('/api/users/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data || {});
      setEditForm(res.data || {});
      setShowEdit(false);
      setEditErrors({}); // Xóa lỗi sau khi lưu thành công
      setSuccessMsg('Cập nhật thông tin cá nhân thành công!');
    } catch (err) {
      alert('Cập nhật thông tin thất bại!');
    } finally {
      setLoadingProfile(false);
    }
  };

  let displayName = authUser?.fullName?.trim() || authUser?.username || authUser?.email || "Người dùng";

  const handleEditClick = () => {
    if (!user && !authUser) return;
    setEditForm({
      ...user,
      email: authUser?.email || user?.email || '',
      fullName: authUser?.fullName || user?.fullName || '',
      username: authUser?.username || user?.username || '',
      gender: user?.gender || '',
    });
    setShowEdit(true);
  };

  const handleEditCancel = () => {
    setShowEdit(false);
    setEditErrors({}); // Xóa lỗi khi hủy
    setSuccessMsg(''); // Ẩn thông báo khi đóng modal
  };

  return (
    <div className="profile-bg">
      {showEdit && (
        <div className="modal-overlay" onClick={handleEditCancel}>
          <div className="modal-edit-profile modal-edit-profile-2col" onClick={e => e.stopPropagation()} ref={modalRef}>
            <div className="modal-edit-header">
              <AiOutlineUser size={26} style={{ color: '#1976d2', marginRight: 8 }} />
              <div>
                <div className="modal-edit-title">Chỉnh sửa thông tin cá nhân</div>
                <div className="modal-edit-desc">Cập nhật thông tin cá nhân của bạn. Nhấn lưu để thay đổi.</div>
              </div>
              <button className="modal-edit-close" onClick={handleEditCancel}><AiOutlineClose size={22} /></button>
            </div>
            <form className="edit-profile-form-2col" onSubmit={handleEditSave}>
              <div className="form-2col">
                <div className="form-row-2col">
                  <label><AiOutlineUser /> Username</label>
                  <input name="username" value={editForm.username} onChange={handleEditChange} required autoFocus readOnly />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineUser /> Họ và tên</label>
                  <input name="fullName" value={editForm.fullName} onChange={handleEditChange}  />
                  {editErrors.fullName && <div style={{ color: '#e11d48', fontSize: 13 }}>{editErrors.fullName}</div>}
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineMail /> Email</label>
                  <input name="email" value={editForm.email} readOnly tabIndex={-1} style={{ background: '#f5f5f5', color: '#888' }} />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlinePhone /> Số điện thoại</label>
                  <input 
                    name="phoneNumber" 
                    type="tel"
                    pattern="[0-9]*"
                    value={editForm.phoneNumber} 
                    onChange={handleEditChange}
                    onKeyDown={(e) => {
                      // Chỉ cho phép số, Backspace, Delete, Tab, Enter, và các phím di chuyển
                      if (!/[0-9]/.test(e.key) && 
                          !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {editErrors.phoneNumber && <div style={{ color: '#e11d48', fontSize: 13 }}>{editErrors.phoneNumber}</div>}
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineCalendar /> Ngày sinh</label>
                  <DatePicker
                    selected={editForm.birthDate ? parseDateString(editForm.birthDate) : null}
                    onChange={(date) => {
                      if (date > new Date()) {
                        alert("Ngày sinh không được lớn hơn hôm nay!");
                        return;
                      }
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      const formatted = `${day}/${month}/${year}`;
                      setEditForm({ ...editForm, birthDate: formatted });
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/MM/yyyy"
                    maxDate={new Date()}
                    className="date-picker-input"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    locale={vi}
                    onKeyDown={(e) => e.preventDefault()}
                  />
                  {editErrors.birthDate && <div style={{ color: '#e11d48', fontSize: 13 }}>{editErrors.birthDate}</div>}
                </div>
                <div className="form-row-2col">
                  <label>Giới tính</label>
                  <select name="gender" value={editForm.gender || ''} onChange={handleEditChange}>
                    <option value="">Chưa cập nhật</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineHome /> Địa chỉ</label>
                  <input name="address" value={editForm.address} onChange={handleEditChange} />
                  {editErrors.address && <div style={{ color: '#e11d48', fontSize: 13 }}>{editErrors.address}</div>}
                </div>
              </div>
              <div className="modal-actions-2col">
                <button type="button" className="cancel-btn-2col" onClick={handleEditCancel}>Hủy</button>
                <button type="submit" className="save-btn-2col">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Message Box Modal */}
      {successMsg && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #ffffff, #f8fffe)',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(34,197,94,0.2), 0 8px 32px rgba(0,0,0,0.1)',
            padding: '40px 50px',
            minWidth: 380,
            maxWidth: 500,
            textAlign: 'center',
            border: '1px solid rgba(34,197,94,0.2)',
            position: 'relative',
            transform: 'scale(1)',
            animation: 'successBoxIn 0.3s ease-out',
          }}>
            {/* Close Button */}
            <button
              onClick={() => setSuccessMsg('')}
              style={{
                position: 'absolute',
                top: 15,
                right: 20,
                background: 'rgba(136,136,136,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: '#666',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(136,136,136,0.2)';
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(136,136,136,0.1)';
                e.target.style.color = '#666';
              }}
              aria-label="Đóng thông báo"
            >×</button>
            
            {/* Success Icon */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #22c55e, #16a34a)',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2"/>
              </svg>
            </div>
            
            {/* Success Message */}
            <div style={{
              color: '#1f2937',
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 8,
              lineHeight: 1.3,
            }}>
              
            </div>
            <div style={{
              color: '#6b7280',
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.4,
            }}>
              {successMsg}
            </div>
          </div>
        </div>
      )}

      <div className="profile-main-card">
        <div className="profile-header-row">
          <div><h1>{displayName}</h1></div>
          <button className="profile-edit-btn" onClick={handleEditClick}><span className="icon-edit" /> Chỉnh sửa</button>
        </div>
        <div className="profile-tabs-row">
          <button className={tab === "overview" ? "tab-btn active" : "tab-btn"} onClick={() => setTab("overview")}>Tổng quan</button>
        </div>
        {tab === "overview" && (
          <div className="profile-content-row">
            <div className="profile-info-card">
              <div className="profile-info-title">Thông tin cá nhân</div>
              <div className="profile-info-list">
                {loadingProfile ? <div>Đang tải...</div> : user ? <>
                  <div><span className="icon-user" /> <b>Username:</b> {user.username}</div>
                  <div><span className="icon-mail" /> <b>Email:</b> {user.email}</div>
                  <div><span className="icon-user" /> <b>Họ và tên:</b> {user.fullName}</div>
                  <div><span className="icon-phone" /> <b>Điện thoại:</b> {user.phoneNumber || <span style={{color:'#888'}}>Chưa cập nhật</span>}</div>
                  <div><span className="icon-birth" /> <b>Ngày sinh:</b> {user.birthDate || <span style={{color:'#888'}}>Chưa cập nhật</span>}</div>
                  <div><span className="icon-user" /> <b>Giới tính:</b> {user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : user.gender === 'OTHER' ? 'Khác' : <span style={{color:'#888'}}>Chưa cập nhật</span>}</div>
                  <div><span className="icon-home" /> <b>Địa chỉ:</b> {user.address || <span style={{color:'#888'}}>Chưa cập nhật</span>}</div>
                  <div className="profile-badges-card" style={{ marginTop: 18 }}>
                    <div className="profile-info-title" style={{ color: '#1976d2' }}>Huy hiệu cá nhân</div>
                     <div className="profile-badges-list" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: '18px 10px',
                      alignItems: 'center',
                      marginTop: 8
                    }}>
                      {badges === undefined ? (
                        <div>Đang tải huy hiệu...</div>
                      ) : badges.length === 0 ? (
                        <div>Chưa có huy hiệu nào.</div>
                      ) : (
                        badges.map(badge => (
                           <div key={badge.id} className="badge-item" style={{display:'flex',alignItems:'center',gap:10}}>
                            {badge.iconUrl && (
                              <img
                                src={badge.iconUrl}
                                alt={badge.badgeName}
                                style={{
                                  width: 34,
                                  height: 34,
                                  objectFit: 'cover',
                                  marginRight: 10,
                                  borderRadius: '50%',
                                  border: '1.5px solid #ffd700',
                                  boxShadow: '0 2px 8px rgba(33,150,243,0.13)',
                                  background: 'linear-gradient(135deg,#fffbe6 60%,#ffe082 100%)',
                                  padding: 2
                                }}
                              />
                            )}
                            <div className="badge-title">{badge.badgeName}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </> : <div>Không có dữ liệu người dùng.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;