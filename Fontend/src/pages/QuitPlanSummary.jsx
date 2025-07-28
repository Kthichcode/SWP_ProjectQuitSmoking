import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import './QuitPlanSummary.css';

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

  if (loading) return <div className="quitplan-summary-loading">Đang tải kế hoạch...</div>;
  if (error) return <div className="quitplan-summary-error">{error}</div>;
  if (!plans.length) return <div className="quitplan-summary-empty">Chưa có kế hoạch nào.</div>;

  // Hiển thị chỉ 1 kế hoạch mới nhất (nếu có nhiều)
  const plan = plans[0];

  return (
    <div className="quitplan-summary-card">
      <div className="quitplan-summary-title">
        <span className="quitplan-summary-icon">🎯</span>
        <span className="quitplan-summary-heading">Kế hoạch cai thuốc</span>
      </div>
      <div className="quitplan-summary-content">
        <div className="quitplan-summary-row">
          <div className="quitplan-summary-label">Trạng thái</div>
          <div className="quitplan-summary-value">{plan.status === 'active' ? 'Đang thực hiện' : plan.status === 'cancelled' ? 'Đã Hủy' : plan.status === 'completed' ? 'Đã hoàn thành' : plan.status || 'Không xác định'}</div>
        </div>
        <div className="quitplan-summary-row">
          <div className="quitplan-summary-label">Lý do cai thuốc</div>
          <div className="quitplan-summary-value">{plan.reasonToQuit}</div>
        </div>
        <div className="quitplan-summary-row">
          <div className="quitplan-summary-label">Tổng số giai đoạn</div>
          <div className="quitplan-summary-value">{plan.totalStages} giai đoạn</div>
        </div>
        <div className="quitplan-summary-row">
          <div className="quitplan-summary-label">Ngày tạo</div>
          <div className="quitplan-summary-value">{plan.createdAt && (new Date(plan.createdAt).toLocaleDateString('vi-VN'))}</div>
        </div>
        <div className="quitplan-summary-row">
          <div className="quitplan-summary-label">Mục tiêu chính</div>
          <div className="quitplan-summary-value">{plan.goal}</div>
        </div>
      </div>
    </div>
  );
}

export default QuitPlanSummary;
