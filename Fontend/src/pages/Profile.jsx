import React, { useState, useRef } from "react";
import "../assets/CSS/Profile.css";
import { useAuth } from '../contexts/AuthContext';
import { AiOutlineBell, AiOutlineMail, AiOutlineLock, AiOutlineSafety, AiOutlineUser, AiOutlinePhone, AiOutlineHome, AiOutlineCalendar, AiOutlineMan, AiOutlineIdcard, AiOutlineContacts, AiOutlineClose } from "react-icons/ai";
import axios from 'axios';

const SETTINGS = {
  notifications: [
    { label: "Nhắc nhở hàng ngày", checked: true, icon: <AiOutlineBell size={22} /> },
    { label: "Thông báo thành tích", checked: true, icon: <AiOutlineMail size={22} /> },
    { label: "Email tuần", checked: false, icon: <AiOutlineMail size={22} /> },
  ],
  security: [
    { label: "Đổi mật khẩu", icon: <AiOutlineLock size={22} /> },
    { label: "Xác thực 2 bước", icon: <AiOutlineSafety size={22} /> },
  ],
};

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState();
  const [tab, setTab] = useState("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState();
  const modalRef = useRef();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [badges, setBadges] = useState();

  // Lấy thông tin cá nhân từ API
  React.useEffect(() => {
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

  // Lấy huy hiệu của user (chỉ lấy theo user, không lấy tất cả)
  React.useEffect(() => {
    const token = authUser?.token || authUser?.accessToken;
    if (!token) return;
    axios.get('/api/users/badges', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setBadges(res.data || []))
      .catch(() => setBadges([]));
  }, [authUser]);

  // Lưu thông tin cá nhân (PUT)
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
      // Đảm bảo birthDate đúng định dạng yyyy-MM-dd hoặc null
      let birthDate = editForm.birthDate;
      if (birthDate instanceof Date) {
        birthDate = birthDate.toISOString().slice(0, 10);
      }
      if (!birthDate || birthDate === '') birthDate = null;
      // Chỉ gửi các trường hợp hợp lệ, loại bỏ undefined/null nếu backend cho phép
      const updateData = {
        username: editForm.username || '',
        email: editForm.email || '',
        fullName: editForm.fullName || '',
        phoneNumber: editForm.phoneNumber || '',
        birthDate: birthDate,
        address: editForm.address || '',
      };
      await axios.put('/api/users/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sau khi update thành công, lấy lại dữ liệu mới nhất từ BE
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

  // Lấy tên hiển thị ưu tiên theo thứ tự: user.fullName > user.username > user.email > "Người dùng"
  let displayName = "Người dùng";
  if (authUser?.fullName && authUser.fullName.trim() !== "") {
    displayName = authUser.fullName;
  } else if (authUser?.username) {
    displayName = authUser.username;
  } else if (authUser?.email) {
    displayName = authUser.email;
  }

  const handleEditClick = () => {
    setEditForm({
      ...user,
      email: authUser?.email || user.email,
      fullName: authUser?.fullName || user.fullName,
      username: authUser?.username || user.username,
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
              <AiOutlineUser size={26} style={{color:'#1976d2',marginRight:8}}/>
              <div>
                <div className="modal-edit-title">Chỉnh sửa thông tin cá nhân</div>
                <div className="modal-edit-desc">Cập nhật thông tin cá nhân của bạn. Nhấn lưu để thay đổi.</div>
              </div>
              <button className="modal-edit-close" onClick={handleEditCancel}><AiOutlineClose size={22}/></button>
            </div>
            <form className="edit-profile-form-2col" onSubmit={handleEditSave}>
              <div className="form-2col">
                <div className="form-row-2col">
                  <label><AiOutlineUser/> Username</label>
                  <input name="username" value={editForm.username} onChange={handleEditChange} required autoFocus readOnly />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineUser/> Họ và tên</label>
                  <input name="fullName" value={editForm.fullName} onChange={handleEditChange} required />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineMail/> Email</label>
                  <input name="email" value={editForm.email} readOnly tabIndex={-1} style={{background:'#f5f5f5', color:'#888'}} />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlinePhone/> Số điện thoại</label>
                  <input name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} required />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineCalendar/> Ngày sinh</label>
                  <input name="birthDate" value={editForm.birthDate ? (() => {
                    // Hiển thị dạng dd/MM/yyyy nếu có birthDate
                    const d = new Date(editForm.birthDate);
                    if (isNaN(d.getTime())) return editForm.birthDate;
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    return `${day}/${month}/${year}`;
                  })() : ''} onChange={handleEditChange} type="text" placeholder="dd/mm/yyyy" />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineHome/> Địa chỉ</label>
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
          <div>
            <h1>{displayName}</h1>
          </div>
          <button className="profile-edit-btn" onClick={handleEditClick}>
            <span className="icon-edit" /> Chỉnh sửa
          </button>
        </div>
        <div className="profile-tabs-row">
          <button className={tab==="overview" ? "tab-btn active" : "tab-btn"} onClick={()=>setTab("overview")}>Tổng quan</button>
        </div>
        {tab === "overview" && (
          <div className="profile-content-row">
            <div className="profile-info-card">
              <div className="profile-info-title">Thông tin cá nhân</div>
              <div className="profile-info-list">
                {loadingProfile ? <div>Đang tải...</div> : user ? <>
                  <div><span className="icon-user"/> <b>Username:</b> {user.username}</div>
                  <div><span className="icon-mail"/> <b>Email:</b> {user.email}</div>
                  <div><span className="icon-user"/> <b>Họ và tên:</b> {user.fullName}</div>
                  <div><span className="icon-phone"/> <b>Điện thoại:</b> {user.phoneNumber}</div>
                  <div><span className="icon-birth"/> <b>Ngày sinh:</b> {user.birthDate ? (() => {
                    // Hiển thị dạng dd/MM/yyyy nếu có birthDate
                    const d = new Date(user.birthDate);
                    if (isNaN(d.getTime())) return user.birthDate;
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    return `${day}/${month}/${year}`;
                  })() : ''}</div>
                  <div><span className="icon-home"/> <b>Địa chỉ:</b> {user.address}</div>
                  {/* Huy hiệu cá nhân ngay dưới thông tin cá nhân */}
                  <div className="profile-badges-card" style={{marginTop: 18}}>
                    <div className="profile-info-title" style={{color:'#1976d2'}}>Huy hiệu cá nhân</div>
                    <div className="profile-badges-list">
                      {badges === undefined ? (
                        <div>Đang tải huy hiệu...</div>
                      ) : badges.length === 0 ? (
                        <div>Chưa có huy hiệu nào.</div>
                      ) : (
                        badges.map(badge => (
                          <div key={badge.id} className="badge-item">
                            <div className="badge-title">{badge.title}</div>
                            <div className="badge-desc">{badge.description}</div>
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
