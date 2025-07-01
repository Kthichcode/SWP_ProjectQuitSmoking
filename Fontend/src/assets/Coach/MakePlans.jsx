import React, { useState } from 'react';
import './MakePlans.css';

const clientsData = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    age: 32,
    status: 'Đang tư vấn',
    plan: {
      goal: 'Cai thuốc trong 30 ngày',
      steps: [
        'Giảm số lượng thuốc mỗi ngày',
        'Tập thể dục 30 phút/ngày',
        'Tham gia nhóm hỗ trợ',
        'Theo dõi tiến trình hàng tuần'
      ],
      note: 'Cần động viên thêm vào tuần thứ 2.'
    }
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    age: 28,
    status: 'Chưa có kế hoạch',
    plan: null
  },
  {
    id: 3,
    name: 'Lê Văn Cường',
    age: 40,
    status: 'Đang tư vấn',
    plan: {
      goal: 'Giảm dần trong 60 ngày',
      steps: [
        'Theo dõi nhật ký hút thuốc',
        'Thay thế thói quen bằng hoạt động lành mạnh',
        'Tư vấn hàng tuần',
        'Đánh giá tiến trình mỗi 2 tuần'
      ],
      note: ''
    }
  }
];


function MakePlans() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [planForm, setPlanForm] = useState({ goal: '', steps: [''], note: '' });
  const [clients, setClients] = useState(clientsData);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    if (client.plan) {
      setPlanForm({
        goal: client.plan.goal,
        steps: client.plan.steps,
        note: client.plan.note || ''
      });
      setIsEditing(false);
    } else {
      setPlanForm({ goal: '', steps: [''], note: '' });
      setIsEditing(true);
    }
  };

 
  const handlePlanChange = (e, idx) => {
    const { name, value } = e.target;
    if (name === 'goal' || name === 'note') {
      setPlanForm(prev => ({ ...prev, [name]: value }));
    } else if (name === 'step') {
      const newSteps = [...planForm.steps];
      newSteps[idx] = value;
      setPlanForm(prev => ({ ...prev, steps: newSteps }));
    }
  };

  
  const handleAddStep = () => {
    setPlanForm(prev => ({ ...prev, steps: [...prev.steps, ''] }));
  };

  
  const handleRemoveStep = (idx) => {
    setPlanForm(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx) }));
  };

  
  const handleSavePlan = () => {
    
    const hasGoal = planForm.goal.trim() !== '';
    const hasStep = planForm.steps.some(s => s.trim() !== '');
    if (!hasGoal && !hasStep) {
      setError('Vui lòng nhập mục tiêu hoặc ít nhất một bước thực hiện.');
      return;
    }
    setClients(prev => prev.map(c =>
      c.id === selectedClient.id ? { ...c, plan: { ...planForm } } : c
    ));
    setIsEditing(false);
    setError('');
  };

  
  const handleEditPlan = () => {
    setIsEditing(true);
  };

  
  const handleCancel = () => {
    if (selectedClient && selectedClient.plan) {
      setPlanForm({
        goal: selectedClient.plan.goal,
        steps: selectedClient.plan.steps,
        note: selectedClient.plan.note || ''
      });
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
          <h4>Danh sách khách hàng</h4>
          <ul>
            {clients.map(client => (
              <li
                key={client.id}
                className={selectedClient && selectedClient.id === client.id ? 'active' : ''}
                onClick={() => handleSelectClient(client)}
              >
                <b>{client.name}</b> ({client.age} tuổi)
                <span className={`status ${client.plan ? 'has-plan' : 'no-plan'}`}>{client.plan ? 'Đã có kế hoạch' : 'Chưa có kế hoạch'}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="makeplans-detail">
          {selectedClient ? (
            <div className="plan-form-box">
              <h4>Kế hoạch cho <span style={{color:'#2196F3'}}>{selectedClient.name}</span></h4>
              {selectedClient.plan && !isEditing ? (
                <>
                  <div className="plan-form-row">
                    <label>Mục tiêu cai thuốc</label>
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
                  <div style={{marginTop:16}}>
                    <button className="save-plan-btn" onClick={handleEditPlan}>Chỉnh sửa</button>
                    <button className="cancel-plan-btn" onClick={() => setSelectedClient(null)}>Đóng</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="plan-form-row">
                    <label>Mục tiêu cai thuốc</label>
                    <input
                      type="text"
                      name="goal"
                      value={planForm.goal}
                      onChange={handlePlanChange}
                      placeholder="Ví dụ: Cai thuốc trong 30 ngày"
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
                          onChange={e => handlePlanChange(e, idx)}
                          placeholder={`Bước ${idx + 1}`}
                        />
                        {planForm.steps.length > 1 && (
                          <button type="button" className="remove-step" onClick={() => handleRemoveStep(idx)}>-</button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="add-step" onClick={handleAddStep}>+ Thêm bước</button>
                  </div>
                  <div className="plan-form-row">
                    <label>Ghi chú</label>
                    <textarea
                      name="note"
                      value={planForm.note}
                      onChange={handlePlanChange}
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
            <div className="plan-empty">Chọn khách hàng để lập hoặc xem kế hoạch cai thuốc.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MakePlans;
