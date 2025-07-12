import React, { useState } from 'react';
import axios from 'axios';
import './DailyDeclarationForm.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const today = new Date().toISOString().slice(0, 10);

const cravingLevels = [
  { value: 'LOW', label: 'Ít' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HIGH', label: 'Nhiều' },
];

const DailyDeclarationForm = () => {
  const [date, setDate] = useState(today);
  const [smoked, setSmoked] = useState('Không');
  const [cigarettes, setCigarettes] = useState(0);
  const [craving, setCraving] = useState('LOW');
  const [health, setHealth] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [hasInitialInfo, setHasInitialInfo] = useState(true);
  const [checkingInitialInfo, setCheckingInitialInfo] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkInitialInfo = async () => {
      setCheckingInitialInfo(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5175/api/member-initial-info/has-submitted', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasInitialInfo(res.data === true);
      } catch {
        setHasInitialInfo(false);
      } finally {
        setCheckingInitialInfo(false);
      }
    };
    checkInitialInfo();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5175/api/smoking-logs', {
        smoked: smoked === 'Có',
        smokeCount: Number(cigarettes),
        cravingLevel: craving,
        healthStatus: health,
        logDate: date,
        frequency: 'DAILY',
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Khai báo thành công!');
    } catch {
      setError('Khai báo thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="daily-declaration-form">
      <h3>✔️ Khai báo hằng ngày</h3>
      <p className="desc">Ghi nhận tiến trình của bạn hôm nay</p>
      {checkingInitialInfo ? (
        <div>Đang kiểm tra thông tin khai báo...</div>
      ) : hasInitialInfo ? (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label>Ngày</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
              <label>Hôm nay bạn có hút thuốc không?</label>
              <select value={smoked} onChange={e => setSmoked(e.target.value)}>
                <option value="Không">Không</option>
                <option value="Có">Có</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Số điếu thuốc đã hút</label>
              <input type="number" min={0} value={cigarettes} onChange={e => setCigarettes(e.target.value)} required />
            </div>
            <div>
              <label>Mức độ thèm thuốc</label>
              <select value={craving} onChange={e => setCraving(e.target.value)}>
                {cravingLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label>Tình trạng sức khỏe</label>
            <textarea value={health} onChange={e => setHealth(e.target.value)} placeholder="Mô tả cảm giác và tình trạng sức khỏe của bạn hôm nay..." />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="btn-main" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu khai báo hằng ngày'}</button>
        </form>
      ) : (
        <div className="initial-info-required">
          <div style={{color: 'red', marginBottom: 12}}>Bạn cần khai báo thông tin ban đầu trước khi ghi nhật ký hằng ngày.</div>
          <button className="btn-main" onClick={() => navigate('/initial-info')}>Chuyển đến trang khai báo thông tin</button>
        </div>
      )}
    </div>
  );
};

export default DailyDeclarationForm;
