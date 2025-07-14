import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';

function PlanStages() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStage, setSelectedStage] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Đổi từ gọi trực tiếp localhost sang dùng axiosInstance với endpoint tương đối
    axiosInstance.get('/api/quitplan/member')
      .then(res => {
        if (res.data && Array.isArray(res.data.data)) {
          setPlans(res.data.data);
        } else {
          setPlans([]);
        }
        setError('');
      })
      .catch(() => {
        setPlans([]);
        setError('Không lấy được dữ liệu kế hoạch.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{color:'#888'}}>Đang tải kế hoạch...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!plans.length) return <div style={{color:'#888'}}>Chưa có kế hoạch nào.</div>;

  // Hiển thị theo quitPlan đầu tiên (hoặc có thể chọn)
  const plan = plans[0];
  const stages = plan.stages || [];

  return (
    <div style={{marginTop:16}}>
      <h4 style={{marginBottom:12}}>Các giai đoạn kế hoạch</h4>
      <div style={{display:'flex',gap:16,marginBottom:24}}>
        {stages.map(stage => (
          <button
            key={stage.stageId}
            style={{
              padding:'12px 24px',
              borderRadius:8,
              border:selectedStage && selectedStage.stageId === stage.stageId ? '2px solid #2d6cdf' : '1px solid #ccc',
              background:selectedStage && selectedStage.stageId === stage.stageId ? '#e3eefd' : '#fff',
              color:'#2d6cdf',
              fontWeight:600,
              cursor:'pointer',
              minWidth:120,
              boxShadow:'0 2px 8px rgba(44,124,223,0.08)'
            }}
            onClick={() => setSelectedStage(stage)}
          >
            Giai đoạn {stage.stageNumber}
          </button>
        ))}
      </div>
      {selectedStage ? (
        <div style={{border:'1.5px solid #2d6cdf',borderRadius:10,padding:20,background:'#f8fbff',maxWidth:400}}>
          <h5 style={{marginBottom:8}}>Chi tiết giai đoạn {selectedStage.stageNumber}</h5>
          <div><b>Ngày bắt đầu:</b> {selectedStage.startDate}</div>
          <div><b>Ngày kết thúc:</b> {selectedStage.endDate}</div>
          <div><b>Số điếu thuốc mục tiêu:</b> {selectedStage.targetCigaretteCount}</div>
          <div><b>Lời khuyên:</b> {selectedStage.advice}</div>
          <div><b>Trạng thái:</b> {selectedStage.status}</div>
        </div>
      ) : (
        <div style={{color:'#888',marginTop:12}}>Chọn một giai đoạn để xem chi tiết.</div>
      )}
    </div>
  );
}

export default PlanStages;
