import React, { useState, useEffect } from 'react';
import './MakePlans.css';

import axiosInstance from '../../../axiosInstance';



function MakePlans() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [planForm, setPlanForm] = useState({ stage: 1, goal: '', steps: [''], note: '', completed: false });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch members from API
  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/api/coach-members/my-members')
      .then(res => {
        if (Array.isArray(res.data)) {
          setClients(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setClients(res.data.data);
        } else {
          setClients([]);
        }
      })
      .catch(() => setClients([]))
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
    if (!hasGoal && !hasStep) {
      setError('Vui lòng nhập mục tiêu hoặc ít nhất một bước thực hiện.');
      return;
    }
    setError('');
    // Giả sử lưu lên server, ở đây chỉ cập nhật local
    setClients(prev => prev.map(c => {
      if (c.id === selectedClient.id) {
        let stages = c.planStages && Array.isArray(c.planStages) ? [...c.planStages] : [null, null, null];
        stages[planForm.stage - 1] = { ...planForm };
        return { ...c, planStages: stages };
      }
      return c;
    }));
    setIsEditing(false);
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
              onClick={() => handleSelectClient(client)}
            >
              <b>{client.fullName || client.name || client.username || client.email}</b>
              <span className={`status ${client.planStages ? 'has-plan' : 'no-plan'}`}>{client.planStages ? 'Đã có kế hoạch' : 'Chưa có kế hoạch'}</span>
              <button style={{marginLeft:12,padding:'2px 10px',borderRadius:6,border:'1px solid #2d6cdf',background:'#e3eefd',color:'#2d6cdf',fontWeight:600,cursor:'pointer'}} onClick={e => {e.stopPropagation(); setSelectedClient(client); handleStartPlan();}}>Lập kế hoạch</button>
            </li>
          ))}
        </ul>
      )}
        </div>
        <div className="makeplans-detail">
          {selectedClient ? (
            <div className="plan-form-box">
              <h4>Kế hoạch cho <span style={{color:'#2196F3'}}>{selectedClient.fullName || selectedClient.name || selectedClient.username || selectedClient.email}</span></h4>
              <div style={{marginBottom:12}}>
                {Array.from({length:3}).map((_, idx) => (
                  <button key={idx} style={{marginRight:8,padding:'4px 14px',borderRadius:6,border:'1px solid #2d6cdf',background: planForm.stage === idx+1 ? '#2d6cdf' : '#e3eefd',color: planForm.stage === idx+1 ? '#fff' : '#2d6cdf',fontWeight:600,cursor:'pointer'}} onClick={() => handleStageChange(idx)}>Giai đoạn {idx+1}</button>
                ))}
              </div>
              {!isEditing ? (
                <>
                  <div className="plan-form-row">
                    <label>Mục tiêu giai đoạn {planForm.stage}</label>
                    <div className="plan-readonly">{planForm.goal}</div>
                  </div>
                  <div className="plan-form-row">
                    <label>Các bước thực hiện</label>
                    <ul className="plan-readonly-list">
                      {planForm.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="plan-form-row">
                    <label>Ghi chú</label>
                    <div className="plan-readonly">{planForm.note || <span style={{color:'#aaa'}}>Không có</span>}</div>
                  </div>
                  <div style={{marginTop:8}}>
                    {planForm.completed ? (
                      <span style={{color:'#22c55e',fontWeight:600}}>Đã hoàn thành giai đoạn này</span>
                    ) : (
                      <button className="save-plan-btn" onClick={handleCompleteStage}>Đánh dấu hoàn thành</button>
                    )}
                  </div>
                  <div style={{marginTop:16}}>
                    <button className="save-plan-btn" onClick={handleEditPlan}>Chỉnh sửa</button>
                    <button className="cancel-plan-btn" onClick={() => setSelectedClient(null)}>Đóng</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="plan-form-row">
                    <label>Mục tiêu giai đoạn {planForm.stage}</label>
                    <input
                      type="text"
                      name="goal"
                      value={planForm.goal}
                      onChange={e => setPlanForm(prev => ({ ...prev, goal: e.target.value }))}
                      placeholder={`Mục tiêu giai đoạn ${planForm.stage}`}
                    />
                  </div>
                  <div className="plan-form-row">
                    <label>Các bước thực hiện</label>
                    {planForm.steps.map((step, idx) => (
                      <div key={idx} className="plan-step-row">
                        <input
                          type="text"
                          name="step"
                          value={step}
                          onChange={e => {
                            const newSteps = [...planForm.steps];
                            newSteps[idx] = e.target.value;
                            setPlanForm(prev => ({ ...prev, steps: newSteps }));
                          }}
                          placeholder={`Bước ${idx + 1}`}
                        />
                        {planForm.steps.length > 1 && (
                          <button type="button" className="remove-step" onClick={() => setPlanForm(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx) }))}>-</button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="add-step" onClick={() => setPlanForm(prev => ({ ...prev, steps: [...prev.steps, ''] }))}>+ Thêm bước</button>
                  </div>
                  <div className="plan-form-row">
                    <label>Ghi chú</label>
                    <textarea
                      name="note"
                      value={planForm.note}
                      onChange={e => setPlanForm(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Ghi chú thêm (nếu có)"
                    />
                  </div>
                  {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
                  <div style={{marginTop:16}}>
                    <button className="save-plan-btn" onClick={handleSavePlan}>Lưu kế hoạch</button>
                    <button className="cancel-plan-btn" onClick={handleCancel}>Hủy</button>
                  </div>
                </>
              )}
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
