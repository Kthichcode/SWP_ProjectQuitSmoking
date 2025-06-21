import React, { useState, useRef } from "react";
import "../assets/CSS/Profile.css";
import { useAuth } from '../contexts/AuthContext';
import { AiOutlineBell, AiOutlineMail, AiOutlineLock, AiOutlineSafety, AiOutlineUser, AiOutlinePhone, AiOutlineHome, AiOutlineCalendar, AiOutlineMan, AiOutlineIdcard, AiOutlineContacts, AiOutlineClose } from "react-icons/ai";

const ACHIEVEMENTS = [
  {
    title: "Ngày đầu tiên",
    desc: "1 ngày không hút thuốc",
    date: "01/02/2024",
    achieved: true,
  },
  {
    title: "Tuần đầu tiên",
    desc: "7 ngày không hút thuốc",
    date: "08/02/2024",
    achieved: true,
  },
  {
    title: "Tháng đầu tiên",
    desc: "30 ngày không hút thuốc",
    date: "02/03/2024",
    achieved: true,
  },
  {
    title: "Tiết kiệm 1 triệu",
    desc: "Tiết kiệm được 1,000,000 VNĐ",
    date: "15/03/2024",
    achieved: true,
  },
  {
    title: "3 tháng",
    desc: "90 ngày không hút thuốc",
    date: "",
    achieved: false,
  },
  {
    title: "6 tháng",
    desc: "180 ngày không hút thuốc",
    date: "",
    achieved: false,
  },
];

const userInit = {
  joinDate: "15/01/2024",
  smokeFreeDays: 45,
  smokeFreeSince: "01/02/2024",
  cigarettesAvoided: 900,
  moneySaved: 1800000,
  healthScore: 78,
  email: "nam.nguyen@email.com",
  phone: "0123 456 789",
  address: "123 Phố Huế, Quận Hai Bà Trưng, Hà Nội",
  dob: "15/08/1985",
  gender: "Nam",
  job: "Kỹ sư phần mềm",
  emergency: "Nguyễn Thị Lan - 0987 654 321",
  smokeYears: 15,
  cigsPerDay: 20,
  quitAttempts: 3,
  quitReason: "Sức khỏe gia đình",
  motivations: [
    "Sức khỏe bản thân",
    "Gia đình và con cái",
    "Tiết kiệm tài chính",
    "Cải thiện thể lực",
  ],
};

const HEALTH_BENEFITS = [
  {
    title: "Cải thiện tuần hoàn máu",
    desc: "Tuần hoàn máu được cải thiện rõ rệt sau khi ngừng hút thuốc.",
    time: "Sau 2-12 tuần",
    status: "done",
  },
  {
    title: "Giảm nguy cơ đau tim",
    desc: "Nguy cơ đau tim giảm đáng kể sau 1 năm cai thuốc.",
    time: "Sau 1 năm",
    status: "progress",
  },
  {
    title: "Giảm nguy cơ ung thư",
    desc: "Nguy cơ mắc các bệnh ung thư giảm mạnh sau 5 năm.",
    time: "Sau 5 năm",
    status: "soon",
  },
  {
    title: "Phổi khỏe như người không hút",
    desc: "Chức năng phổi phục hồi gần như bình thường sau 10 năm.",
    time: "Sau 10 năm",
    status: "soon",
  },
];

const EXERCISES = [
  {
    title: "Bài tập hít thở sâu",
    desc: "Giúp giảm cảm giác thèm thuốc và thư giãn tinh thần.",
    link: "#",
  },
  {
    title: "Tập thể dục nhẹ",
    desc: "Đi bộ, yoga hoặc vận động nhẹ giúp giảm stress và tăng sức khỏe.",
    link: "#",
  },
  {
    title: "Thiền và thư giãn",
    desc: "Thiền giúp kiểm soát cảm xúc và giảm lo âu khi cai thuốc.",
    link: "#",
  },
  {
    title: "Uống nước và ăn trái cây",
    desc: "Giúp giảm cảm giác thèm thuốc và tăng sức đề kháng.",
    link: "#",
  },
];

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
  const [user, setUser] = useState(userInit);
  const [tab, setTab] = useState("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(user);
  const modalRef = useRef();

  // Lấy tên hiển thị ưu tiên theo thứ tự: user.name (họ tên Google/backend) > user.email > "Người dùng"
  let displayName = "Người dùng";
  if (authUser?.name && authUser.name.trim() !== "") {
    displayName = authUser.name;
  } else if (authUser?.email) {
    displayName = authUser.email;
  }

  const handleEditClick = () => {
    setEditForm({
      ...user,
      email: authUser?.email || user.email,
      gender: authUser?.gender || user.gender,
    });
    setShowEdit(true);
  };
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSave = (e) => {
    e.preventDefault();
    setUser(editForm);
    setShowEdit(false);
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
                  <label><AiOutlineUser/> Họ và tên</label>
                  <input name="name" value={editForm.name} onChange={handleEditChange} required autoFocus />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineMail/> Email</label>
                  <input name="email" value={authUser?.email || editForm.email} readOnly tabIndex={-1} style={{background:'#f5f5f5', color:'#888'}} />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlinePhone/> Số điện thoại</label>
                  <input name="phone" value={editForm.phone} onChange={handleEditChange} required />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineIdcard/> Nghề nghiệp</label>
                  <input name="job" value={editForm.job} onChange={handleEditChange} />
                </div>
              </div>
              <div className="form-row-2col-full">
                <label><AiOutlineHome/> Địa chỉ</label>
                <textarea name="address" value={editForm.address} onChange={handleEditChange} rows={2} />
              </div>
              <div className="form-2col">
                <div className="form-row-2col">
                  <label><AiOutlineCalendar/> Ngày sinh</label>
                  <input name="dob" value={editForm.dob} onChange={handleEditChange} type="date" />
                </div>
                <div className="form-row-2col">
                  <label><AiOutlineMan/> Giới tính</label>
                  <input name="gender" value={authUser?.gender || editForm.gender} readOnly tabIndex={-1} style={{background:'#f5f5f5', color:'#888'}} />
                </div>
              </div>
              <div className="form-row-2col-full">
                <label><AiOutlineContacts/> Liên hệ khẩn cấp</label>
                <input name="emergency" value={editForm.emergency} onChange={handleEditChange} />
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
            <div className="profile-join">Thành viên từ {user.joinDate}</div>
          </div>
          <button className="profile-edit-btn" onClick={handleEditClick}>
            <span className="icon-edit" /> Chỉnh sửa
          </button>
        </div>
        <div className="profile-badges-row">
          <span className="badge-green">✔  {user.smokeFreeDays} ngày không hút thuốc</span>
          <span className="badge-blue">↗  Điểm sức khỏe: {user.healthScore}/100</span>
        </div>
        <div className="profile-stats-row">
          <div className="stat-card">
            <div className="stat-icon stat-blue">📅</div>
            <div className="stat-title">Ngày không hút</div>
            <div className="stat-value">{user.smokeFreeDays}</div>
            <div className="stat-desc">Kể từ {user.smokeFreeSince}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-red">🚭</div>
            <div className="stat-title">Điếu thuốc tránh</div>
            <div className="stat-value">{user.cigarettesAvoided}</div>
            <div className="stat-desc">Điếu thuốc lá</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-green">💵</div>
            <div className="stat-title">Tiền tiết kiệm</div>
            <div className="stat-value stat-money">{user.moneySaved.toLocaleString()}đ</div>
            <div className="stat-desc">Số tiền đã tiết kiệm</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-pink">❤️</div>
            <div className="stat-title">Điểm sức khỏe</div>
            <div className="stat-value stat-health">{user.healthScore}/100</div>
            <div className="stat-bar">
              <div className="stat-bar-inner" style={{width: user.healthScore + '%'}}></div>
            </div>
          </div>
        </div>
        <div className="profile-tabs-row">
          <button className={tab==="overview" ? "tab-btn active" : "tab-btn"} onClick={()=>setTab("overview")}>Tổng quan</button>
          <button className={tab==="achievements" ? "tab-btn active" : "tab-btn"} onClick={()=>setTab("achievements")}>Thành tích</button>
          <button className={tab==="health" ? "tab-btn active" : "tab-btn"} onClick={()=>setTab("health")}>Sức khỏe</button>
          <button className={tab==="settings" ? "tab-btn active" : "tab-btn"} onClick={()=>setTab("settings")}>Cài đặt</button>
        </div>
        {tab === "overview" && (
          <div className="profile-content-row">
            <div className="profile-info-card">
              <div className="profile-info-title">Thông tin cá nhân</div>
              <div className="profile-info-list">
                <div><span className="icon-mail"/> <b>Email:</b> {user.email}</div>
                <div><span className="icon-phone"/> <b>Điện thoại:</b> {user.phone}</div>
                <div><span className="icon-home"/> <b>Địa chỉ:</b> {user.address}</div>
                <div><span className="icon-birth"/> <b>Ngày sinh:</b> {user.dob}</div>
                <div><span className="icon-gender"/> <b>Giới tính:</b> {user.gender}</div>
                <div><span className="icon-job"/> <b>Nghề nghiệp:</b> {user.job}</div>
                <div><span className="icon-emergency"/> <b>Liên hệ khẩn cấp:</b> {user.emergency}</div>
              </div>
            </div>
            <div className="profile-info-card">
              <div className="profile-info-title">Lịch sử hút thuốc</div>
              <div className="profile-info-list">
                <div><b>Số năm hút thuốc:</b> {user.smokeYears} năm</div>
                <div><b>Điếu/ngày (trước đây):</b> {user.cigsPerDay} điếu</div>
                <div><b>Lần cai trước:</b> {user.quitAttempts} lần</div>
                <div><b>Lý do cai lần này:</b> {user.quitReason}</div>
                <div><b>Động lực cai thuốc:</b> {user.motivations.map((m,i)=>(<span key={i} className="motivation-tag">{m}</span>))}</div>
              </div>
            </div>
          </div>
        )}
        {tab === "achievements" && (
          <div className="profile-achievements-card">
            <div className="profile-info-title" style={{marginBottom: 4}}>
              <span style={{fontSize:'1.2em',marginRight:6}}>👤</span> Huy hiệu & Thành tích
            </div>
            <div className="profile-achievements-desc">Những mốc quan trọng bạn đã đạt được trong hành trình cai thuốc lá</div>
            <div className="achievements-grid">
              {ACHIEVEMENTS.map((a, idx) => (
                <div key={idx} className={a.achieved ? "achievement-box achieved" : "achievement-box"}>
                  <div className="achievement-title">{a.title} {a.achieved && <span className="achievement-badge">🏅</span>}</div>
                  <div className="achievement-desc">{a.desc}</div>
                  {a.achieved && a.date && <div className="achievement-date">Đạt được: {a.date}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "health" && (
          <div className="profile-health-card">
            <div className="profile-info-title" style={{marginBottom: 4}}>
              <span style={{fontSize:'1.2em',marginRight:6}}>↗</span> Cải thiện sức khỏe
            </div>
            <div className="profile-achievements-desc">Theo dõi những cải thiện về sức khỏe khi bạn ngừng hút thuốc</div>
            <div className="health-benefits-list">
              {HEALTH_BENEFITS.map((item, idx) => (
                <div key={idx} className="health-benefit-row">
                  <span className={
                    item.status === 'done' ? 'dot dot-green' :
                    item.status === 'progress' ? 'dot dot-yellow' :
                    'dot dot-gray'
                  }></span>
                  <div className="health-benefit-content">
                    <div className="health-benefit-title">{item.title}</div>
                    <div className="health-benefit-desc">{item.desc}</div>
                  </div>
                  <div className="health-benefit-time">{item.time}</div>
                  <div className="health-benefit-status">
                    {item.status === 'done' && <span className="status-done">Hoàn thành</span>}
                    {item.status === 'progress' && <span className="status-progress">Đang tiến hành</span>}
                    {item.status === 'soon' && <span className="status-soon">Sắp tới</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="profile-info-title" style={{marginTop:32, marginBottom:8}}>
              <span style={{fontSize:'1.2em',marginRight:6}}>🏃‍♂️</span> Các bài tập giảm hút thuốc
            </div>
            <div className="exercises-list">
              {EXERCISES.map((ex, idx) => (
                <div key={idx} className="exercise-box">
                  <div className="exercise-title">{ex.title}</div>
                  <div className="exercise-desc">{ex.desc}</div>
                  <button className="exercise-btn" onClick={()=>window.open(ex.link, '_blank')}>Xem chi tiết</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "settings" && (
          <div className="profile-settings-row">
            <div className="profile-settings-card">
              <div className="profile-info-title"><AiOutlineBell style={{marginRight:6}}/> Thông báo</div>
              <div className="settings-list">
                {SETTINGS.notifications.map((n, idx) => (
                  <div key={idx} className="settings-row settings-row-noti">
                    <div className="settings-row-left">
                      {n.icon}
                      <span>{n.label}</span>
                    </div>
                    <input type="checkbox" checked={n.checked} readOnly />
                  </div>
                ))}
              </div>
            </div>
            <div className="profile-settings-card">
              <div className="profile-info-title"><AiOutlineLock style={{marginRight:6}}/> Bảo mật</div>
              <div className="settings-list">
                {SETTINGS.security.map((s, idx) => (
                  <div key={idx} className="settings-row settings-row-sec">
                    <div className="settings-row-left">
                      {s.icon}
                      <span>{s.label}</span>
                    </div>
                    <AiOutlineLock size={20} style={{color:'#888'}} />
                  </div>
                ))}
                {/* Đã bỏ nút đăng xuất theo yêu cầu */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
