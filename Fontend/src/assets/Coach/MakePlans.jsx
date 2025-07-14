import React, { useState, useEffect } from 'react';
import DailyLogsTable from '../../components/DailyLogsTable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './MakePlans.css';
import axiosInstance from '../../../axiosInstance';
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // State cho khai báo hàng ngày
  const [dailyLogs, setDailyLogs] = useState([]);
  const [dailyLogsLoading, setDailyLogsLoading] = useState(false);
  const [dailyLogsError, setDailyLogsError] = useState('');

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

  // Hủy chỉnh sửa
  const handleCancel = () => {
    if (selectedClient && selectedClient.planStages && selectedClient.planStages[planForm.stage - 1]) {
      setPlanForm({ ...selectedClient.planStages[planForm.stage - 1], stage: planForm.stage });
      setIsEditing(false);
    } else {
      setSelectedClient(null);
    }
  };

  return (
    <div className="makeplans-container">
      <h2>Kế hoạch cai thuốc cho khách hàng</h2>
      {/* Form tạo kế hoạch mới */}
      <div className="create-plan-form" style={{marginBottom:32, padding:16, border:'1px solid #e3eefd', borderRadius:8, background:'#f8fbff'}}>
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
                <option key={client.id} value={client.memberId || client.id}>{client.username || client.fullName || client.name || client.email}</option>
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
              min={1}
              max={10}
              value={createPlanForm.totalStages}
              onChange={e => setCreatePlanForm(prev => ({ ...prev, totalStages: Number(e.target.value) }))}
              style={{padding:'6px 12px', borderRadius:6, border:'1px solid #ccc', width:80}}
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
              // memberId có thể là client.memberId hoặc client.id, ưu tiên memberId nếu có
              const memberId = Number(createPlanForm.memberId);
              await axiosInstance.post('/api/quitplan/create', {
                memberId,
                reasonToQuit: createPlanForm.reasonToQuit,
                totalStages: Number(createPlanForm.totalStages),
                goal: createPlanForm.goal
              });
              setCreatePlanError('Tạo kế hoạch thành công!');
              setCreatePlanForm({ memberId: '', reasonToQuit: '', totalStages: 3, goal: '' });
              // Cập nhật lại danh sách kế hoạch cho thành viên vừa tạo
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
                // Nếu lỗi thì không cập nhật
              }
            } catch (err) {
              setCreatePlanError('Tạo kế hoạch thất bại!');
            } finally {
              setCreatePlanLoading(false);
            }
          }}
        >{createPlanLoading ? 'Đang tạo...' : 'Tạo kế hoạch'}</button>
      </div>
      {/* ...existing code... */}
      <div className="makeplans-content">
      <div className="makeplans-list">
        <h4>Danh sách thành viên</h4>
        {loading ? (
          <div style={{color:'#888'}}>Đang tải danh sách...</div>
        ) : (
          <ul>
            {clients.map(client => (
              <li
                key={client.id}
                className={selectedClient && selectedClient.id === client.id ? 'active' : ''}
                onClick={() => setSelectedClient(client)}
              >
                <b>{client.fullName || client.name || client.username || client.email}</b>
                <span className={`status ${plansByMember[client.memberId || client.id] ? 'has-plan' : 'no-plan'}`}>{plansByMember[client.memberId || client.id] ? 'Đã có kế hoạch' : 'Chưa có kế hoạch'}</span>
                <button style={{marginLeft:12,padding:'2px 10px',borderRadius:6,border:'1px solid #2d6cdf',background:'#e3eefd',color:'#2d6cdf',fontWeight:600,cursor:'pointer'}} onClick={e => {e.stopPropagation(); setSelectedClient(client); handleStartPlan();}}>Xem kế hoạch</button>
                <button style={{marginLeft:8,padding:'2px 10px',borderRadius:6,border:'1px solid #43a047',background:'#e8f5e9',color:'#43a047',fontWeight:600,cursor:'pointer'}} onClick={async e => {
                  e.stopPropagation();
                  setSelectedClient(client);
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
                }}>Xem khai báo hàng ngày</button>
              </li>
            ))}
          </ul>
        )}
      </div>
        <div className="makeplans-detail">
          {selectedClient ? (
            <div className="plan-form-box">
              <h4>Kế hoạch cho <span style={{color:'#2196F3'}}>{selectedClient.fullName || selectedClient.name || selectedClient.username || selectedClient.email}</span></h4>
              {/* Hiển thị khai báo hàng ngày nếu có */}
              <DailyLogsTable dailyLogs={dailyLogs} loading={dailyLogsLoading} error={dailyLogsError} />
              {/* Hiển thị tất cả kế hoạch của member này */}
              {plansByMember[selectedClient.memberId || selectedClient.id] && plansByMember[selectedClient.memberId || selectedClient.id].length > 0 ? (
                <div style={{marginBottom:16}}>
                  {/* ...existing code... */}
                  {plansByMember[selectedClient.memberId || selectedClient.id].map(plan => (
                    <div key={plan.quitPlanId} style={{border:'1px solid #e3eefd',borderRadius:8,padding:12,marginBottom:12,background:'#f8fbff'}}>
                      <div><b>Mục tiêu:</b> {plan.goal}</div>
                      <div><b>Lý do:</b> {plan.reasonToQuit}</div>
                      <div><b>Ngày tạo:</b> {plan.createdAt}</div>
                      <div><b>Số giai đoạn:</b> {plan.totalStages}</div>
                      {/* ...existing code... */}
                      <div style={{marginTop:8}}>
                        {/* ...existing code... */}
                        <ul style={{marginLeft:16}}>
                          {plan.stages.map(stage => (
                            <li key={stage.stageId}>
                              Giai đoạn {stage.stageNumber}
                              <button style={{marginLeft:8,padding:'2px 8px',borderRadius:6,border:'1px solid #2d6cdf',background:'#fff',color:'#2d6cdf',fontWeight:600,cursor:'pointer'}} onClick={() => {
                                setEditingStage(stage);
                                setStageForm({
                                  startDate: stage.startDate || '',
                                  endDate: stage.endDate || '',
                                  targetCigaretteCount: stage.targetCigaretteCount || '',
                                  advice: stage.advice || ''
                                });
                                setStageUpdateError('');
                              }}>Cập nhật</button>
                              <button style={{marginLeft:8,padding:'2px 8px',borderRadius:6,border:'1px solid #aaa',background:'#eee',color:'#333',fontWeight:600,cursor:'pointer'}} onClick={async () => {
                                setStageUpdateError('');
                                try {
                                  const res = await axiosInstance.get(`http://localhost:5175/api/quitplan/stage/${stage.stageId}`);
                                  const data = res.data && res.data.data ? res.data.data : {};
                                  setEditingStage({ ...stage, ...data, viewOnly: true });
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
                              <button style={{marginLeft:8,padding:'2px 8px',borderRadius:6,border:'1px solid #e53935',background:'#fff',color:'#e53935',fontWeight:600,cursor:'pointer'}} onClick={async () => {
                                if (!window.confirm('Bạn có chắc muốn xóa giai đoạn này?')) return;
                                setStageUpdateError('');
                                try {
                                  await axiosInstance.delete(`http://localhost:5175/api/quitplan/stage/${stage.stageId}`);
                                  setStageUpdateError('Đã xóa giai đoạn!');
                                  // Xóa khỏi danh sách kế hoạch
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
                                  setStageUpdateError('Xóa thất bại!');
                                }
                              }}>Xóa</button>
                            </li>
                          ))}
                        </ul>
                        <button style={{marginTop:8,padding:'4px 16px',borderRadius:6,border:'1px solid #43a047',background:'#e8f5e9',color:'#43a047',fontWeight:600,cursor:'pointer'}} onClick={() => {
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
                        <div style={{marginTop:4, color:'#e53935', fontSize:13}}>
                          *Lưu ý: Ngày bắt đầu của giai đoạn mới nên sau ngày kết thúc của giai đoạn trước ít nhất 1 ngày.
                        </div>
                        {/* Form cập nhật/thêm giai đoạn */}
                        {editingStage && (
                          <div style={{border:'1px solid #2d6cdf',borderRadius:8,padding:16,background:'#fff',marginBottom:16}}>
                            <h5>{editingStage.viewOnly ? 'Chi tiết giai đoạn' : (editingStage.stageId ? `Cập nhật giai đoạn ${editingStage.stageNumber}` : `Thêm giai đoạn mới số ${editingStage.stageNumber}`)}</h5>
                            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                              <div>
                                <label>Ngày bắt đầu</label><br/>
                                <div style={{display:'flex',alignItems:'center',gap:8}}>
                                  <DatePicker
                                    selected={stageForm.startDate ? new Date(stageForm.startDate) : new Date()}
                                    onChange={date => setStageForm(f => ({...f,startDate: date ? date.toISOString().split('T')[0] : ''}))}
                                    minDate={new Date()}
                                    dateFormat="yyyy-MM-dd"
                                    disabled={editingStage.viewOnly}
                                    customInput={<input style={{padding:'6px 12px',borderRadius:6,border:'1px solid #ccc'}} />}
                                  />
                                  <button type="button" style={{border:'none',background:'none',cursor:'pointer'}} onClick={() => setStageForm(f => ({...f,startDate: new Date().toISOString().split('T')[0]}))} disabled={editingStage.viewOnly}>
                                    <span role="img" aria-label="calendar">📅</span>
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label>Ngày kết thúc</label><br/>
                                <div style={{display:'flex',alignItems:'center',gap:8}}>
                                  <DatePicker
                                    selected={stageForm.endDate ? new Date(stageForm.endDate) : null}
                                    onChange={date => setStageForm(f => ({...f,endDate: date ? date.toISOString().split('T')[0] : ''}))}
                                    minDate={stageForm.startDate ? new Date(stageForm.startDate) : new Date()}
                                    dateFormat="yyyy-MM-dd"
                                    disabled={editingStage.viewOnly}
                                    customInput={<input style={{padding:'6px 12px',borderRadius:6,border:'1px solid #ccc'}} />}
                                  />
                                  <button type="button" style={{border:'none',background:'none',cursor:'pointer'}} onClick={() => setStageForm(f => ({...f,endDate: stageForm.startDate || new Date().toISOString().split('T')[0]}))} disabled={editingStage.viewOnly}>
                                    <span role="img" aria-label="calendar">📅</span>
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label>Số điếu thuốc mục tiêu</label><br/>
                                <input type="number" value={stageForm.targetCigaretteCount} onChange={e => setStageForm(f => ({...f,targetCigaretteCount:e.target.value}))} disabled={editingStage.viewOnly} />
                              </div>
                              <div>
                                <label>Lời khuyên</label><br/>
                                <input type="text" value={stageForm.advice} onChange={e => setStageForm(f => ({...f,advice:e.target.value}))} disabled={editingStage.viewOnly} />
                              </div>
                            </div>
                            {stageUpdateError && <div style={{color:'red',marginTop:8}}>{stageUpdateError}</div>}
                            <div style={{marginTop:12}}>
                              <button
                                style={{padding:'6px 18px',borderRadius:6,border:'1px solid #2d6cdf',background:'#2d6cdf',color:'#fff',fontWeight:600,cursor:'pointer'}}
                                disabled={stageUpdateLoading || editingStage.viewOnly}
                                onClick={async () => {
                                  if (editingStage.viewOnly) return;
                                  setStageUpdateLoading(true);
                                  setStageUpdateError('');
                                  try {
                                    if (editingStage.stageId) {
                                      // Cập nhật giai đoạn
                                      await axiosInstance.put(`http://localhost:5175/api/quitplan/stage/${editingStage.stageId}`, {
                                        startDate: stageForm.startDate,
                                        endDate: stageForm.endDate,
                                        targetCigaretteCount: Number(stageForm.targetCigaretteCount),
                                        advice: stageForm.advice
                                      });
                                      setStageUpdateError('Cập nhật thành công!');
                                    } else {
                                      // Tạo mới giai đoạn
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
                                        setStageUpdateError('Thêm giai đoạn mới thành công!');
                                      } else {
                                        setStageUpdateError('Thêm giai đoạn mới thất bại!');
                                      }
                                    }
                                    setEditingStage(null);
                                  } catch (err) {
                                    setStageUpdateError(editingStage.stageId ? 'Cập nhật thất bại!' : 'Thêm giai đoạn mới thất bại!');
                                  } finally {
                                    setStageUpdateLoading(false);
                                  }
                                }}
                              >
                                {stageUpdateLoading ? (editingStage.stageId ? 'Đang cập nhật...' : 'Đang thêm...') : (editingStage.stageId ? 'Lưu' : 'Thêm')}
                              </button>
                              <button style={{marginLeft:8,padding:'6px 18px',borderRadius:6,border:'1px solid #aaa',background:'#eee',color:'#333',fontWeight:600,cursor:'pointer'}} onClick={() => setEditingStage(null)}>Đóng</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* ...existing code... */}
                </div>
              ) : (
                <div style={{color:'#888',marginBottom:16}}>Chưa có kế hoạch nào cho thành viên này.</div>
              )}
              {/* ...existing code... (form chỉnh sửa/lập kế hoạch) */}
            </div>
          ) : (
            <div className="plan-empty">Chọn thành viên để lập hoặc xem kế hoạch cai thuốc.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MakePlans;
