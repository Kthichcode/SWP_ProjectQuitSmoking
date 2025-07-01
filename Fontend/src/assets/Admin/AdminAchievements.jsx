import './AdminPage.css';
import { useState, useRef, useEffect } from 'react';
import { FaLeaf, FaTree, FaSun, FaSeedling, FaHeart, FaSmile, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';

const initialBadges = [
  {
    id: 1,
    name: 'Ngày đầu tiên',
    type: 'Cột mốc',
    level: 'Phổ thông',
    description: 'Hoàn thành ngày đầu tiên không hút thuốc',
    condition: '1 ngày',
    achieved: 2547,
    reward: 10,
    icon: <FaLeaf color="#22c55e" size={32} />, 
  },
  {
    id: 2,
    name: 'Tuần đầu tiên',
    type: 'Cột mốc',
    level: 'Phổ thông',
    description: 'Hoàn thành tuần đầu tiên không hút thuốc',
    condition: '7 ngày',
    achieved: 1234,
    reward: 50,
    icon: <FaSeedling color="#16a34a" size={32} />, 
  },
  {
    id: 3,
    name: 'Tháng đầu tiên',
    type: 'Cột mốc',
    level: 'Hiếm',
    description: 'Hoàn thành tháng đầu tiên không hút thuốc',
    condition: '30 ngày',
    achieved: 567,
    reward: 200,
    icon: <FaTree color="#15803d" size={32} />, 
  },
  {
    id: 4,
    name: 'Chiến binh cai thuốc',
    type: 'Cột mốc',
    level: 'Sử thi',
    description: 'Hoàn thành 3 tháng không hút thuốc',
    condition: '90 ngày',
    achieved: 234,
    reward: 500,
    icon: <FaSun color="#fbbf24" size={32} />, 
  },
  
];

function AdminAchievements() {
  const [badges, setBadges] = useState(initialBadges);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', level: '', description: '', condition: '', achieved: 0, reward: 0, icon: 'trophy' });
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const iconOptions = {
    leaf: <FaLeaf color="#22c55e" size={32} />, 
    seedling: <FaSeedling color="#16a34a" size={32} />, 
    tree: <FaTree color="#15803d" size={32} />, 
    sun: <FaSun color="#fbbf24" size={32} />, 
    heart: <FaHeart color="#f472b6" size={32} />, 
    smile: <FaSmile color="#fbbf24" size={32} /> 
  };

  const handleAdd = e => {
    e.preventDefault();
    setBadges([
      ...badges,
      { ...form, id: Date.now(), achieved: 0, reward: Number(form.reward), icon: iconOptions[form.icon] }
    ]);
    setForm({ name: '', type: '', level: '', description: '', condition: '', achieved: 0, reward: 0, icon: 'trophy' });
    setShowAdd(false);
  };

  const handleDelete = id => {
    setBadges(badges.filter(b => b.id !== id));
    setOpenMenu(null);
  };

  return (
    <div className="admin-page">
      <h2>Quản lý Thành Tích</h2>
      
      <div style={{display:'flex',flexWrap:'wrap',gap:24,marginTop:24}}>
        {badges.map(b => (
          <div key={b.id} style={{background:'#fff',borderRadius:16,padding:24,minWidth:260,maxWidth:320,boxShadow:'0 2px 8px #0001',position:'relative',flex:'1 1 260px'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
              {b.icon}
              <div style={{fontWeight:700,fontSize:20}}>{b.name}</div>
              <button
                className="admin-btn admin-btn-more"
                onClick={e => {
                  e.stopPropagation();
                  setOpenMenu(openMenu === b.id ? null : b.id);
                }}
                style={{marginLeft:'auto',padding:6,borderRadius:'50%',background:'#f3f4f6',border:'none',cursor:'pointer',color:'#222',lineHeight:1}}
                title="Thao tác"
              >
                <FaEllipsisV size={18} color="#222" style={{verticalAlign:'middle'}} />
              </button>
              {openMenu === b.id && (
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
                    minWidth: 120,
                    padding: '6px 0'
                  }}
                >
                  <button
                    className="admin-btn admin-btn-menu"
                    style={{
                      display:'flex',alignItems:'center',gap:8,width:'100%',background:'none',border:'none',padding:'8px 16px',cursor:'pointer',
                      color:'#222',fontSize:'1rem',textAlign:'left',fontWeight:500
                    }}
                    onClick={() => {  setOpenMenu(null); }}
                  >
                    <FaEdit /> <span style={{color:'#222'}}>Sửa</span>
                  </button>
                  <button
                    className="admin-btn admin-btn-menu"
                    style={{
                      display:'flex',alignItems:'center',gap:8,width:'100%',background:'none',border:'none',padding:'8px 16px',cursor:'pointer',
                      color:'#ef4444',fontSize:'1rem',textAlign:'left',fontWeight:500
                    }}
                    onClick={() => handleDelete(b.id)}
                  >
                    <FaTrash /> <span style={{color:'#ef4444'}}>Xóa</span>
                  </button>
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap'}}>
              <span style={{background:'#e0f2fe',color:'#0284c7',borderRadius:8,padding:'2px 10px',fontSize:13,fontWeight:600}}>{b.type}</span>
              <span style={{background:'#f3e8ff',color:'#a21caf',borderRadius:8,padding:'2px 10px',fontSize:13,fontWeight:600}}>{b.level}</span>
            </div>
            <div style={{color:'#222',marginBottom:8}}>{b.description}</div>
            <div style={{fontSize:14,marginBottom:2}}>Điều kiện: <b>{b.condition}</b></div>
            <div style={{fontSize:14,marginBottom:2}}>Đã đạt được: <b>{b.achieved.toLocaleString()} người</b></div>
            <div style={{fontSize:14}}>Điểm thưởng: <b style={{color:'#2563eb'}}>{b.reward} điểm</b></div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default AdminAchievements;
