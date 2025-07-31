import React, { useState, useEffect } from 'react';
import DailyLogsTable from '../../components/DailyLogsTable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './MakePlans.css';
import axiosInstance from '../../../axiosInstance';

// Helper to get local date string (yyyy-MM-dd) in local timezone
function toLocalDateString(date) {
  if (!date) return '';
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}
function MakePlans() {
  // ...existing code...
  const [clients, setClients] = useState([]);
  const [plansByMember, setPlansByMember] = useState({});
  const [createPlanForm, setCreatePlanForm] = useState({ memberId: '', reasonToQuit: '', totalStages: 3, goal: '' });
  const [createPlanError, setCreatePlanError] = useState('');
  const [createPlanLoading, setCreatePlanLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [planForm, setPlanForm] = useState({ stage: 1, goal: '', steps: [''], note: '', completed: false });
  const [isEditing, setIsEditing] = useState(false);
  const [editingStage, setEditingStage] = useState(null); // stage object đang chỉnh sửa
  const [stageForm, setStageForm] = useState({ startDate: '', endDate: '', targetCigaretteCount: '', advice: '' });
  const [stageUpdateLoading, setStageUpdateLoading] = useState(false);
  const [stageUpdateError, setStageUpdateError] = useState('');
  const [resetStageLoading, setResetStageLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // State cho message box
  const [messageBox, setMessageBox] = useState(null);
  // State cho khai báo hàng ngày
  const [dailyLogs, setDailyLogs] = useState([]);
  const [dailyLogsLoading, setDailyLogsLoading] = useState(false);
  const [dailyLogsError, setDailyLogsError] = useState('');
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' or 'logs'

  // Fetch members and plans from API
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosInstance.get('/api/coach-members/my-members'),
      axiosInstance.get('http://localhost:5175/api/quitplan/coach')
    ])
      .then(([membersRes, plansRes]) => {
        // Members
        let members = [];
        if (Array.isArray(membersRes.data)) {
          members = membersRes.data;
        } else if (membersRes.data && Array.isArray(membersRes.data.data)) {
          members = membersRes.data.data;
        }
        setClients(members);

        // Plans
        let plans = [];
        if (plansRes.data && Array.isArray(plansRes.data.data)) {
          plans = plansRes.data.data;
        }
        // Group plans by memberId
        const grouped = {};
        plans.forEach(plan => {
          if (!grouped[plan.memberId]) grouped[plan.memberId] = [];
          grouped[plan.memberId].push(plan);
        });
        setPlansByMember(grouped);
      })
      .catch(() => {
        setClients([]);
        setPlansByMember({});
      })
      .finally(() => setLoading(false));
  }, []);

  // Select client and load plan stages
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    // Giả sử client.planStages là mảng 3 giai đoạn, nếu chưa có thì khởi tạo
    if (client.planStages && Array.isArray(client.planStages)) {
      setPlanForm({ ...client.planStages[0], stage: 1 });
      setIsEditing(false);
    } else {
      setPlanForm({ stage: 1, goal: '', steps: [''], note: '', completed: false });
      setIsEditing(false);
    }
  };

  // Chuyển giai đoạn kế hoạch
  const handleStageChange = (stageIdx) => {
    if (selectedClient && selectedClient.planStages && selectedClient.planStages[stageIdx]) {
      setPlanForm({ ...selectedClient.planStages[stageIdx], stage: stageIdx + 1 });
      setIsEditing(false);
    }
  };

  // Bắt đầu lập kế hoạch cho user
  const handleStartPlan = () => {
    setPlanForm({ stage: 1, goal: '', steps: [''], note: '', completed: false });
    setIsEditing(true);
  };

  // Sửa kế hoạch
  const handleEditPlan = () => {
    setIsEditing(true);
  };

  // Lưu kế hoạch cho giai đoạn hiện tại
  const handleSavePlan = async () => {
    const hasGoal = planForm.goal.trim() !== '';
    const hasStep = planForm.steps.some(s => s.trim() !== '');
    // Kiểm tra ngày kết thúc
    const todayStr = new Date().toISOString().split('T')[0];
    if (stageForm.endDate && stageForm.endDate < todayStr) {
      setError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu (hôm nay).');
      return;
    }
    if (!hasGoal && !hasStep) {
      setError('Vui lòng nhập mục tiêu hoặc ít nhất một bước thực hiện.');
      return;
    }
    setError('');
    // ...existing code...
  };

  // Đánh dấu hoàn thành giai đoạn
  const handleCompleteStage = () => {
    setPlanForm(prev => ({ ...prev, completed: true }));
    setClients(prev => prev.map(c => {
      if (c.id === selectedClient.id) {
        let stages = c.planStages && Array.isArray(c.planStages) ? [...c.planStages] : [null, null, null];
        stages[planForm.stage - 1] = { ...planForm, completed: true };
        return { ...c, planStages: stages };
      }
      return c;
    }));
  };
  const handleCancel = () => {
    if (selectedClient && selectedClient.planStages && selectedClient.planStages[planForm.stage - 1]) {
      setPlanForm({ ...selectedClient.planStages[planForm.stage - 1], stage: planForm.stage });
      setIsEditing(false);
    } else {
      setSelectedClient(null);
    }
  };

  // Reset stage function
  const handleResetStage = async (stageId) => {
    showMessageBox(
      'Bạn có chắc muốn reset giai đoạn này?',
      'warning',
      async () => {
        hideMessageBox();
        setResetStageLoading(true);
        setStageUpdateError('');
        
        try {
          await axiosInstance.post(`http://localhost:5175/api/quitplan/coach/reset-stage/${stageId}`);
          showNotification('Reset giai đoạn thành công!', 'success');
          
          // Refresh plans data after reset
          try {
            const res = await axiosInstance.get('http://localhost:5175/api/quitplan/coach');
            let plans = [];
            if (res.data && Array.isArray(res.data.data)) {
              plans = res.data.data;
            }
            const grouped = {};
            plans.forEach(plan => {
              if (!grouped[plan.memberId]) grouped[plan.memberId] = [];
              grouped[plan.memberId].push(plan);
            });
            setPlansByMember(grouped);
          } catch (err) {
            console.error('Error refreshing plans after reset:', err);
          }
        } catch (err) {
          showNotification('Reset giai đoạn thất bại!', 'error');
        } finally {
          setResetStageLoading(false);
        }
      },
      () => hideMessageBox()
    );
  };

  // Message box functions
  const showMessageBox = (message, type = 'info', onConfirm = null, onCancel = null) => {
    setMessageBox({
      message,
      type,
      onConfirm,
      onCancel,
      isConfirm: onConfirm !== null
    });
  };

  const hideMessageBox = () => {
    setMessageBox(null);
  };

  const showNotification = (message, type = 'success') => {
    setMessageBox({
      message,
      type,
      onConfirm: null,
      onCancel: null,
      isConfirm: false,
      autoClose: true
    });
    
    // Auto close after 3 seconds
    setTimeout(() => {
      setMessageBox(null);
    }, 3000);
  };

  return (
    <div className="makeplans-container">
      <h2>Kế hoạch cai thuốc cho khách hàng</h2>     
      <div className="create-plan-form" style={{marginBottom:32, padding:16, border:'1px solid #e3eefd', borderRadius:8, background:'lightgreen'}}>
        <h4>Tạo kế hoạch mới</h4>
        <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
          <div>
            <label>Chọn thành viên</label><br/>
            <select
              value={createPlanForm.memberId}
              onChange={e => setCreatePlanForm(prev => ({ ...prev, memberId: e.target.value }))}
              style={{padding:'6px 12px', borderRadius:6, border:'1px solid #ccc', background:'#fff',color:'#333', minWidth:180}}
            >
              <option value="">-- Chọn thành viên --</option>
              {clients.map(client => (
                <option key={client.id} value={client.memberId || client.id}>{client.fullName || client.name || client.username || client.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Lý do muốn cai thuốc</label><br/>
            <input
              type="text"
              value={createPlanForm.reasonToQuit}
              onChange={e => setCreatePlanForm(prev => ({ ...prev, reasonToQuit: e.target.value }))}
              placeholder="Nhập lý do"
              style={{padding:'6px 12px', borderRadius:6, border:'1px solid #ccc', minWidth:180}}
            />
          </div>
          <div>
            <label>Mục tiêu</label><br/>
            <input
              type="text"
              value={createPlanForm.goal}
              onChange={e => setCreatePlanForm(prev => ({ ...prev, goal: e.target.value }))}
              placeholder="Nhập mục tiêu"
              style={{padding:'6px 12px', borderRadius:6, border:'1px solid #ccc', minWidth:180}}
            />
          </div>
          <div>
            <label>Số giai đoạn</label><br/>
            <input
              type="number"
              min={3}
              max={3}
              value={3}
              readOnly
              disabled
              style={{padding:'6px 12px', borderRadius:6, border:'1px solid #ccc', width:80, background:'#f5f5f5', color:'#888'}}
            />
          </div>
        </div>
        {createPlanError && <div style={{color:'red', marginTop:8}}>{createPlanError}</div>}
        <button
          style={{marginTop:12, padding:'8px 24px', borderRadius:6, border:'1px solid #2d6cdf', background:'#2d6cdf', color:'#fff', fontWeight:600, cursor:'pointer'}}
          disabled={createPlanLoading}
          onClick={async () => {
            if (!createPlanForm.memberId) {
              setCreatePlanError('Vui lòng chọn thành viên');
              return;
            }
            if (!createPlanForm.reasonToQuit.trim()) {
              setCreatePlanError('Vui lòng nhập lý do muốn cai thuốc');
              return;
            }
            if (!createPlanForm.goal.trim()) {
              setCreatePlanError('Vui lòng nhập mục tiêu');
              return;
            }
            setCreatePlanError('');
            setCreatePlanLoading(true);
            try {
            
              const memberId = Number(createPlanForm.memberId);
              await axiosInstance.post('/api/quitplan/create', {
                memberId,
                reasonToQuit: createPlanForm.reasonToQuit,
                totalStages: Number(createPlanForm.totalStages),
                goal: createPlanForm.goal
              });
              showNotification('Tạo kế hoạch thành công!', 'success');
              setCreatePlanForm({ memberId: '', reasonToQuit: '', totalStages: 3, goal: '' });
              
              try {
                const res = await axiosInstance.get('http://localhost:5175/api/quitplan/coach');
                let plans = [];
                if (res.data && Array.isArray(res.data.data)) {
                  plans = res.data.data;
                }
                const grouped = {};
                plans.forEach(plan => {
                  if (!grouped[plan.memberId]) grouped[plan.memberId] = [];
                  grouped[plan.memberId].push(plan);
                });
                setPlansByMember(grouped);
              } catch (err) {
            
              }
            } catch (err) {
              showNotification('Tạo kế hoạch thất bại!', 'error');
            } finally {
              setCreatePlanLoading(false);
            }
          }}
        >{createPlanLoading ? 'Đang tạo...' : 'Tạo kế hoạch'}</button>
      </div>
     
      <div className="makeplans-content" style={{gap: '2.5rem'}}>
        <div className="makeplans-list" style={{boxShadow: '0 4px 16px rgba(33,150,243,0.07)', border: 'none', padding: '2rem 1.5rem', minHeight: 480}}>
          <h4 style={{fontSize:'1.15rem',marginBottom:'1.5rem',color:'#1976d2',letterSpacing:0.2}}>Danh sách thành viên</h4>
          {loading ? (
            <div style={{color:'#888'}}>Đang tải danh sách...</div>
          ) : (
            <ul style={{padding:0,margin:0,listStyle:'none'}}>
              {clients.map(client => (
                <li
                  key={client.id}
                  className={selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) ? 'active-member' : ''}
                  onClick={() => {
                    setSelectedClient(client);
                    setActiveTab('plan'); // Khi chọn thành viên, luôn show tab kế hoạch
                  }}
                  style={{
                    background: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) ? '#e3f2fd' : '#f8fbff',
                    border: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) ? '2.5px solid #1976d2' : '2px solid transparent',
                    borderRadius: 12,
                    marginBottom: 14,
                    padding: '1rem 1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) ? '0 4px 18px rgba(25,118,210,0.10)' : '0 2px 8px rgba(33,150,243,0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!(selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id))) {
                      e.currentTarget.style.background = '#f0f7ff';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(33,150,243,0.08)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!(selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id))) {
                      e.currentTarget.style.background = '#f8fbff';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(33,150,243,0.04)';
                    }
                  }}
                >
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                    <span style={{fontWeight:600,fontSize:'1.08rem',color: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) ? '#1976d2' : '#222', letterSpacing:0.2}}>{client.fullName || client.name || client.username || client.email}</span>
                    <span className={`status ${plansByMember[client.memberId || client.id] ? 'has-plan' : 'no-plan'}`} style={{marginLeft:8, fontWeight:600, fontSize:'0.98rem', color: plansByMember[client.memberId || client.id] ? '#388e3c' : '#e67e22', background: plansByMember[client.memberId || client.id] ? '#e8f5e9' : '#fffbe6', borderRadius:6, padding:'2px 10px'}}>{plansByMember[client.memberId || client.id] ? 'Đã có kế hoạch' : 'Chưa có kế hoạch'}</span>
                  </div>
                  <div style={{display:'flex',gap:10,marginTop:2}}>
                    <button
                      style={{
                        padding:'4px 14px',
                        borderRadius:6,
                        border:'1.5px solid #1976d2',
                        background: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) && activeTab === 'plan' ? '#1976d2' : '#e3eefd',
                        color: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) && activeTab === 'plan' ? '#fff' : '#1976d2',
                        fontWeight:700,
                        cursor: 'pointer',
                        fontSize:'0.99rem',
                        boxShadow: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) && activeTab === 'plan' ? '0 2px 8px rgba(25,118,210,0.10)' : 'none',
                        outline: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) && activeTab === 'plan' ? '2px solid #1976d2' : 'none',
                        transition:'all 0.18s',
                        opacity: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) ? 1 : 0.7
                      }}
                      // Cho phép click vào nút của bất kỳ user nào
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setActiveTab('plan');
                        handleStartPlan();
                      }}
                    >Xem kế hoạch</button>
                    <button
                      style={{
                        padding:'4px 14px',
                        borderRadius:6,
                        border:'1.5px solid #43a047',
                        background: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) && activeTab === 'logs' ? '#43a047' : '#e8f5e9',
                        color: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) && activeTab === 'logs' ? '#fff' : '#43a047',
                        fontWeight:700,
                        cursor: 'pointer',
                        fontSize:'0.99rem',
                        boxShadow: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) && activeTab === 'logs' ? '0 2px 8px rgba(67,160,71,0.10)' : 'none',
                        outline: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) && activeTab === 'logs' ? '2px solid #43a047' : 'none',
                        transition:'all 0.18s',
                        opacity: selectedClient && (selectedClient.memberId || selectedClient.id) === (client.memberId || client.id) ? 1 : 0.7
                      }}
                      // Cho phép click vào nút của bất kỳ user nào
                      onClick={async e => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setActiveTab('logs');
                        setDailyLogsLoading(true);
                        setDailyLogsError('');
                        try {
                          const memberId = client.memberId || client.id;
                          const res = await axiosInstance.get(`http://localhost:5175/api/smoking-logs/member/${memberId}`);
                          setDailyLogs(Array.isArray(res.data) ? res.data : (res.data && Array.isArray(res.data.data) ? res.data.data : []));
                        } catch (err) {
                          setDailyLogs([]);
                          setDailyLogsError('Không lấy được dữ liệu khai báo hàng ngày!');
                        } finally {
                          setDailyLogsLoading(false);
                        }
                      }}
                    >Xem khai báo hàng ngày</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="makeplans-detail" style={{boxShadow: '0 4px 16px rgba(33,150,243,0.07)', border: 'none', padding: '2.5rem 2rem', minHeight: 480}}>
          {selectedClient ? (
            <div className="plan-form-box">
              <h4 style={{fontSize:'1.18rem',marginBottom:18}}>Kế hoạch cho <span style={{color:'#2196F3'}}>{selectedClient.fullName || selectedClient.name || selectedClient.username || selectedClient.email}</span></h4>
              {activeTab === 'logs' ? (
                <>
                  <DailyLogsTable dailyLogs={dailyLogs} loading={dailyLogsLoading} error={dailyLogsError} />
                  {(!dailyLogsLoading && (!dailyLogs || dailyLogs.length === 0)) && (
                    <div style={{color:'#222',marginBottom:16}}>Chưa có khai báo hàng ngày nào cho thành viên này.</div>
                  )}
                </>
              ) : (
                <>
                  {plansByMember[selectedClient.memberId || selectedClient.id] && plansByMember[selectedClient.memberId || selectedClient.id].length > 0 ? (
                    <div style={{marginBottom:16}}>
                      {plansByMember[selectedClient.memberId || selectedClient.id].map(plan => (
                        <div key={plan.quitPlanId} style={{border:'1px solid #e3eefd',borderRadius:10,padding:'18px 18px 12px 18px',marginBottom:18,background:'#f8fbff',boxShadow:'0 2px 8px rgba(33,150,243,0.06)'}}>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                            <div style={{display:'flex', flexDirection:'column', gap:6}}>
                              <div><b>Mục tiêu:</b> {plan.goal}</div>
                              <div><b>Lý do:</b> {plan.reasonToQuit}</div>
                              <div><b>Ngày tạo:</b> {plan.createdAt}</div>
                              <div><b>Số giai đoạn:</b> {plan.totalStages}</div>
                            </div>
                            <button style={{padding:'6px 18px',borderRadius:6,border:'1px solid #43a047',background:'#e8f5e9',color:'#43a047',fontWeight:600,cursor:'pointer',fontSize:'0.97rem', marginLeft:16, marginTop:0}} onClick={() => {
                              let prevEndDate = '';
                              if (plan.stages.length > 0) {
                                const prevStage = plan.stages[plan.stages.length - 1];
                                prevEndDate = prevStage.endDate || '';
                              }
                              setEditingStage({
                                stageNumber: plan.stages.length + 1,
                                quitPlanId: plan.quitPlanId,
                                viewOnly: false,
                                stageId: null
                              });
                              setStageForm({
                                startDate: prevEndDate || new Date().toISOString().split('T')[0],
                                endDate: '',
                                targetCigaretteCount: '',
                                advice: ''
                              });
                              setStageUpdateError('');
                            }}>Thêm giai đoạn mới</button>
                          </div>
                          <div style={{marginTop:8}}>
                            <ul style={{marginLeft:16,marginBottom:8}}>
                              {plan.stages.map(stage => (
                                <li key={stage.stageId} style={{marginBottom:6, display:'flex', alignItems:'center', gap:8}}>
                                  <span style={{fontWeight:500}}>Giai đoạn {stage.stageNumber}</span>
                                  {/* Hiển thị status nếu có */}
                                  {stage.status && (
                                    <span style={{
                                      marginLeft:8, 
                                      fontWeight:600, 
                                      fontSize:'0.95rem', 
                                      borderRadius:6, 
                                      padding:'2px 8px',
                                      background: stage.status === 'cancelled' ? '#ffebee' : 
                                                  stage.status === 'active' ? '#e3f2fd' : 
                                                 stage.status === 'completed' ? '#e8f5e9' : 
                                                 stage.status === 'pending' ? '#e3f2fd' : '#f5f5f5',
                                      color: stage.status === 'cancelled' ? '#d32f2f' : 
                                            stage.status === 'active' ? '#0c6ddbff' :
                                            stage.status === 'completed' ? '#388e3c' : 
                                            stage.status === 'pending' ? '#64645fff' : '#666'
                                    }}>
                                      {stage.status === 'cancelled' ? 'Đã thất bại' : 
                                        stage.status === 'active' ? 'Đang thực hiện' :
                                       stage.status === 'completed' ? 'Hoàn thành' : 
                                       stage.status === 'pending' ? 'Đang chờ' : stage.status}
                                    </span>
                                  )}
                                  {/* Hiển thị phần trăm tiến độ nếu có */}
                                  {typeof stage.progressPercentage === 'number' && (
                                    <span style={{marginLeft:8, color:'#1976d2', fontWeight:600, fontSize:'0.98rem', background:'#e3eefd', borderRadius:6, padding:'2px 10px'}}>
                                      {stage.progressPercentage}%
                                    </span>
                                  )}
                                  {/* Chỉ hiện nút 'Cập nhật' khi đang ở chế độ xem (viewOnly: true) */}
                                  {editingStage && editingStage.viewOnly && editingStage.stageId === stage.stageId && false && (
                                    <button
                                      style={{marginLeft:8,padding:'2px 10px',borderRadius:6,border:'1px solid #2d6cdf',background:'#fff',color:'#2d6cdf',fontWeight:600,cursor:'pointer',fontSize:'0.96rem'}}
                                      onClick={() => {
                                        setEditingStage(prev => prev ? { ...prev, viewOnly: false } : null);
                                      }}
                                    >Cập nhật</button>
                                  )}
                                  <button style={{marginLeft:8,padding:'2px 10px',borderRadius:6,border:'1px solid #aaa',background:'#eee',color:'#333',fontWeight:600,cursor:'pointer',fontSize:'0.96rem'}} onClick={async () => {
                                    setStageUpdateError('');
                                    try {
                                      const res = await axiosInstance.get(`http://localhost:5175/api/quitplan/stage/${stage.stageId}`);
                                      const data = res.data && res.data.data ? res.data.data : {};
                                      // Lấy progressPercentage nếu có
                                      setEditingStage({ ...stage, ...data, viewOnly: true, progressPercentage: data.progressPercentage });
                                      setStageForm({
                                        startDate: data.startDate || '',
                                        endDate: data.endDate || '',
                                        targetCigaretteCount: data.targetCigaretteCount || '',
                                        advice: data.advice || ''
                                      });
                                    } catch (err) {
                                      setStageUpdateError('Không lấy được chi tiết giai đoạn!');
                                    }
                                  }}>Xem</button>
                                  {/* Nếu đang xem (viewOnly), cho phép chuyển sang cập nhật */}
                                  {editingStage && editingStage.viewOnly && editingStage.stageId === stage.stageId && (
                                    <button
                                      style={{marginLeft:8,padding:'2px 10px',borderRadius:6,border:'1px solid #2d6cdf',background:'#fff',color:'#2d6cdf',fontWeight:600,cursor:'pointer',fontSize:'0.96rem'}}
                                      onClick={() => {
                                        setEditingStage(prev => prev ? { ...prev, viewOnly: false } : null);
                                      }}
                                    >Cập nhật</button>
                                  )}
                                  <button style={{marginLeft:8,padding:'2px 10px',borderRadius:6,border:'1px solid #e53935',background:'#fff',color:'#e53935',fontWeight:600,cursor:'pointer',fontSize:'0.96rem'}} onClick={async () => {
                                    showMessageBox(
                                      'Bạn có chắc muốn xóa giai đoạn này?',
                                      'warning',
                                      async () => {
                                        hideMessageBox();
                                        setStageUpdateError('');
                                        try {
                                          await axiosInstance.delete(`http://localhost:5175/api/quitplan/stage/${stage.stageId}`);
                                          showNotification('Đã xóa giai đoạn!', 'success');
                                          setPlansByMember(prev => {
                                            const memberId = selectedClient.memberId || selectedClient.id;
                                            const plans = prev[memberId] ? prev[memberId].map(plan => ({
                                              ...plan,
                                              stages: plan.stages.filter(s => s.stageId !== stage.stageId)
                                            })) : [];
                                            return { ...prev, [memberId]: plans };
                                          });
                                          setEditingStage(null);
                                        } catch (err) {
                                          showNotification('Xóa thất bại!', 'error');
                                        }
                                      },
                                      () => hideMessageBox()
                                    );
                                  }}>Xóa</button>
                                  {/* Reset button - only show for cancelled stages */}
                                  {stage.status === 'cancelled' && (
                                    <button 
                                      style={{
                                        marginLeft:8,
                                        padding:'2px 10px',
                                        borderRadius:6,
                                        border:'1px solid #ff9800',
                                        background:'#fff',
                                        color:'#ff9800',
                                        fontWeight:600,
                                        cursor: resetStageLoading ? 'not-allowed' : 'pointer',
                                        fontSize:'0.96rem',
                                        opacity: resetStageLoading ? 0.6 : 1
                                      }} 
                                      disabled={resetStageLoading}
                                      onClick={() => handleResetStage(stage.stageId)}
                                    >
                                      {resetStageLoading ? 'Đang reset...' : '🔄 Reset'}
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                            <div style={{marginTop:4, color:'#e53935', fontSize:17}}>
                              *Lưu ý: Ngày bắt đầu của giai đoạn mới nên sau ngày kết thúc của giai đoạn trước ít nhất 1 ngày.
                            </div>
                            {editingStage && (
                              <div style={{border:'1px solid #2d6cdf',borderRadius:10,padding:18,background:'#fff',marginBottom:16,boxShadow:'0 2px 8px rgba(33,150,243,0.08)'}}>
                                <h5 style={{fontSize:'1.08rem',marginBottom:12}}>{editingStage.viewOnly ? 'Chi tiết giai đoạn' : (editingStage.stageId ? `Cập nhật giai đoạn ${editingStage.stageNumber}` : `Thêm giai đoạn mới số ${editingStage.stageNumber}`)}</h5>
                                {/* Hiển thị progressPercentage nếu có và đang ở chế độ xem */}
                                {editingStage.viewOnly && typeof editingStage.progressPercentage === 'number' && (
                                  <div style={{marginBottom:16}}>
                                    <label style={{fontWeight:600}}>Tiến độ kế hoạch:</label><br/>
                                    <div style={{width:'100%',maxWidth:320,background:'#e3eefd',borderRadius:8,overflow:'hidden',height:22,marginTop:4,marginBottom:4}}>
                                      <div style={{width:`${editingStage.progressPercentage}%`,background:'#1976d2',height:'100%',borderRadius:8,transition:'width 0.3s'}}></div>
                                    </div>
                                    <span style={{fontWeight:600,color:'#1976d2'}}>{editingStage.progressPercentage}%</span>
                                  </div>
                                )}
                                <div style={{display:'flex',gap:18,flexWrap:'wrap'}}>
                                  <div>
                                    <label>Ngày bắt đầu</label><br/>
                                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                                      <DatePicker
                                        selected={stageForm.startDate ? new Date(stageForm.startDate) : new Date()}
                                        onChange={date => setStageForm(f => ({...f,startDate: date ? toLocalDateString(date) : ''}))}
                                        minDate={new Date()}
                                        dateFormat="yyyy-MM-dd"
                                        disabled={editingStage.viewOnly}
                                        customInput={<input style={{padding:'6px 12px',borderRadius:6,border:'1px solid #ccc'}} />}
                                      />
                                      <button type="button" style={{border:'none',background:'none',cursor:'pointer'}} onClick={() => setStageForm(f => ({...f,startDate: toLocalDateString(new Date())}))} disabled={editingStage.viewOnly}>
                                        <span role="img" aria-label="calendar">📅</span>
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <label>Ngày kết thúc</label><br/>
                                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                                      <DatePicker
                                        selected={stageForm.endDate ? new Date(stageForm.endDate) : null}
                                        onChange={date => setStageForm(f => ({...f,endDate: date ? toLocalDateString(date) : ''}))}
                                        minDate={stageForm.startDate ? new Date(stageForm.startDate) : new Date()}
                                        dateFormat="yyyy-MM-dd"
                                        disabled={editingStage.viewOnly}
                                        customInput={<input style={{padding:'6px 12px',borderRadius:6,border:'1px solid #ccc'}} />}
                                      />
                                      <button type="button" style={{border:'none',background:'none',cursor:'pointer'}} onClick={() => setStageForm(f => ({...f,endDate: stageForm.startDate || toLocalDateString(new Date())}))} disabled={editingStage.viewOnly}>
                                        <span role="img" aria-label="calendar">📅</span>
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <label>Số điếu thuốc mục tiêu</label><br/>
                                    <input type="number" value={stageForm.targetCigaretteCount} onChange={e => setStageForm(f => ({...f,targetCigaretteCount:e.target.value}))} disabled={editingStage.viewOnly} />
                                  </div>
                                  <div style={{minWidth:260, flex:1}}>
                                    <label>Lời khuyên</label><br/>
                                    <textarea
                                      value={stageForm.advice}
                                      onChange={e => setStageForm(f => ({...f,advice:e.target.value}))}
                                      disabled={editingStage.viewOnly}
                                      rows={3}
                                      style={{width:'100%', minWidth:240, minHeight:60, maxWidth:400, resize:'vertical', padding:'6px 12px', borderRadius:6, border:'1px solid #ccc', fontSize:'1rem', color:'#333', background:'#fff'}}
                                      placeholder="Nhập lời khuyên (hoạt động, dinh dưỡng,...)"
                                    />
                                  </div>
                                </div>
                                {stageUpdateError && <div style={{color:'red',marginTop:8}}>{stageUpdateError}</div>}
                                <div style={{marginTop:14}}>
                                  <button
                                    style={{padding:'7px 22px',borderRadius:7,border:'1px solid #2d6cdf',background:'#2d6cdf',color:'#fff',fontWeight:600,cursor:'pointer',fontSize:'1rem'}}
                                    disabled={stageUpdateLoading || editingStage.viewOnly}
                                    onClick={async () => {
                                      if (editingStage.viewOnly) return;
                                      // Validate required fields
                                      if (!stageForm.targetCigaretteCount || String(stageForm.targetCigaretteCount).trim() === '') {
                                        setStageUpdateError('Vui lòng nhập số điếu thuốc mục tiêu.');
                                        return;
                                      }
                                      if (!stageForm.advice || stageForm.advice.trim() === '') {
                                        setStageUpdateError('Vui lòng nhập lời khuyên.');
                                        return;
                                      }
                                      setStageUpdateLoading(true);
                                      setStageUpdateError('');
                                      try {
                                        if (editingStage.stageId) {
                                          await axiosInstance.put(`http://localhost:5175/api/quitplan/stage/${editingStage.stageId}`, {
                                            startDate: stageForm.startDate,
                                            endDate: stageForm.endDate,
                                            targetCigaretteCount: Number(stageForm.targetCigaretteCount),
                                            advice: stageForm.advice
                                          });
                                          showNotification('Cập nhật thành công!', 'success');
                                        } else {
                                          const res = await axiosInstance.post(`http://localhost:5175/api/quitplan/${editingStage.quitPlanId}/stage`, {
                                            stageNumber: editingStage.stageNumber,
                                            startDate: stageForm.startDate,
                                            endDate: stageForm.endDate,
                                            targetCigaretteCount: Number(stageForm.targetCigaretteCount),
                                            advice: stageForm.advice
                                          });
                                          const newStage = res.data && res.data.data ? res.data.data : null;
                                          if (newStage) {
                                            setPlansByMember(prev => {
                                              const memberId = selectedClient.memberId || selectedClient.id;
                                              const plans = prev[memberId] ? prev[memberId].map(plan => {
                                                if (plan.quitPlanId === editingStage.quitPlanId) {
                                                  return { ...plan, stages: [...plan.stages, newStage] };
                                                }
                                                return plan;
                                              }) : [];
                                              return { ...prev, [memberId]: plans };
                                            });
                                            showNotification('Thêm giai đoạn mới thành công!', 'success');
                                          } else {
                                            setStageUpdateError('Thêm giai đoạn mới thất bại!');
                                          }
                                        }
                                        setEditingStage(null);
                                      } catch (err) {
                                        showNotification(editingStage.stageId ? 'Cập nhật thất bại!' : 'Thêm giai đoạn mới thất bại!', 'error');
                                      } finally {
                                        setStageUpdateLoading(false);
                                      }
                                    }}
                                  >
                                    {stageUpdateLoading ? (editingStage.stageId ? 'Đang cập nhật...' : 'Đang thêm...') : (editingStage.stageId ? 'Lưu' : 'Thêm')}
                                  </button>
                                  <button style={{marginLeft:10,padding:'7px 22px',borderRadius:7,border:'1px solid #aaa',background:'#eee',color:'#333',fontWeight:600,cursor:'pointer',fontSize:'1rem'}} onClick={() => setEditingStage(null)}>Đóng</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{color:'#888',marginBottom:16}}>Chưa có kế hoạch nào cho thành viên này.</div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="plan-empty">Chọn thành viên để lập hoặc xem kế hoạch cai thuốc.</div>
          )}
        </div>
      </div>

      {/* Message Box */}
      {messageBox && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: messageBox.type === 'success' ? 'linear-gradient(135deg, #4caf50, #45a049)' :
                       messageBox.type === 'error' ? 'linear-gradient(135deg, #f44336, #d32f2f)' :
                       messageBox.type === 'warning' ? 'linear-gradient(135deg, #ff9800, #f57c00)' :
                       'linear-gradient(135deg, #2196f3, #1976d2)',
            color: '#fff',
            padding: '24px 32px',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            maxWidth: 450,
            width: '90%',
            textAlign: 'center',
            position: 'relative',
            transform: 'scale(0.9)',
            animation: 'slideIn 0.3s ease-out forwards'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: messageBox.isConfirm ? 20 : 16,
              lineHeight: 1.4
            }}>
              {messageBox.message}
            </div>
            
            {messageBox.isConfirm ? (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  onClick={messageBox.onConfirm}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Xác nhận
                </button>
                <button
                  onClick={messageBox.onCancel}
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    color: '#fff',
                    border: '2px solid rgba(0, 0, 0, 0.3)',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Hủy
                </button>
              </div>
            ) : !messageBox.autoClose && (
              <button
                onClick={hideMessageBox}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Đóng
              </button>
            )}
            
            {!messageBox.isConfirm && !messageBox.autoClose && (
              <button
                onClick={hideMessageBox}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 12,
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 20,
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#fff';
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.background = 'none';
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            transform: scale(0.9) translateY(-20px);
            opacity: 0;
          }
          to { 
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default MakePlans;
