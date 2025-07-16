
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

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.fullName || editForm.fullName.length > 40) {
      alert('Họ và tên phải từ 1 đến 40 ký tự!');
      return;
    }
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

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditCancel = () => setShowEdit(false);

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
                  <input name="fullName" value={editForm.fullName} onChange={handleEditChange} required />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineMail /> Email</label>
                  <input name="email" value={editForm.email} readOnly tabIndex={-1} style={{ background: '#f5f5f5', color: '#888' }} />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlinePhone /> Số điện thoại</label>
                  <input name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} required />
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