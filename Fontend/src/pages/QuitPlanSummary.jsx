import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';

function QuitPlanSummary() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('http://localhost:5175/api/quitplan/member')
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

  return (
    <div style={{marginBottom:12, background:'#f8fbff', border:'1px solid #e3eefd', borderRadius:8, padding:12}}>
      <h4 style={{margin:'8px 0'}}>Tổng quan kế hoạch cai thuốc</h4>
      <ul style={{margin:0, paddingLeft:16}}>
        {plans.map(plan => (
          <li key={plan.quitPlanId} style={{marginBottom:6}}>
            <b>Mục tiêu:</b> {plan.goal} | <b>Lý do:</b> {plan.reasonToQuit} | <b>Ngày tạo:</b> {plan.createdAt} | <b>Số giai đoạn:</b> {plan.totalStages}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuitPlanSummary;
