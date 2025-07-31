import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import './QuitPlanSummary.css';

function QuitPlanSummary() {
  const [plans, setPlans] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosInstance.get('http://localhost:5175/api/quitplan/member'),
      axiosInstance.get('/api/quitplan/stages/my')
    ])
      .then(([plansRes, stagesRes]) => {
        // Xử lý kế hoạch
        if (plansRes.data && Array.isArray(plansRes.data.data)) {
          setPlans(plansRes.data.data);
        } else {
          setPlans([]);
        }

        // Xử lý giai đoạn
        if (Array.isArray(stagesRes.data)) {
          setStages(stagesRes.data);
        } else if (stagesRes.data && Array.isArray(stagesRes.data.data)) {
          setStages(stagesRes.data.data);
        } else {
          setStages([]);
        }

        setError('');
      })
      .catch(() => {
        setPlans([]);
        setStages([]);
        setError('Không lấy được dữ liệu kế hoạch.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Kiểm tra xem tất cả 3 giai đoạn đã hoàn thành chưa
  const areAllStagesCompleted = () => {
    if (stages.length < 3) return false;
    return stages.every(stage => (stage.progressPercentage ?? 0) === 100 || stage.status === 'completed');
  };

  // Xác định trạng thái tổng thể dựa trên giai đoạn
  const getOverallStatus = () => {
    if (stages.length === 0) return 'Chưa bắt đầu';
    
    // Chỉ hiển thị "Hoàn thành" khi cả 3 giai đoạn đều hoàn thành
    if (areAllStagesCompleted()) {
      return 'Hoàn thành';
    }
    
    // Kiểm tra có giai đoạn nào đang active không
    const hasActiveStage = stages.some(stage => stage.status === 'active');
    if (hasActiveStage) {
      return 'Đang thực hiện';
    }
    
    // Kiểm tra có giai đoạn nào bị cancelled không
    const hasCancelledStage = stages.some(stage => stage.status === 'cancelled');
    if (hasCancelledStage) {
      return 'Có giai đoạn thất bại';
    }
    
    return 'Đang chờ';
  };

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
          <div className="quitplan-summary-value" style={{
            color: areAllStagesCompleted() ? '#27ae60' : 
                   getOverallStatus() === 'Đang thực hiện' ? '#3498db' : 
                   getOverallStatus() === 'Có giai đoạn thất bại' ? '#e74c3c' : '#666',
            fontWeight: areAllStagesCompleted() ? '600' : '500'
          }}>
            {getOverallStatus()}
            
          </div>
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
