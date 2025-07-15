import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import '../assets/CSS/Progress.css';

function DailyLogsHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/api/smoking-logs');
        if (Array.isArray(res.data)) {
          setLogs(res.data.filter(log => log.userId === (user.userId || user.id)));
        } else if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
          setLogs(res.data.data.filter(log => log.userId === (user.userId || user.id)));
        } else {
          setLogs([]);
        }
      } catch (err) {
        setError('Không thể tải lịch sử khai báo.');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user]);

  return (
    <div className="daily-logs-history" style={{ marginTop: 32, background: '#f8fbff', borderRadius: 12, boxShadow: '0 2px 12px rgba(44,62,80,0.07)', padding: 24 }}>
      <h3 style={{ textAlign: 'center', color: '#3498db', marginBottom: 18 }}>
        <span role="img" aria-label="history">📅</span> Lịch sử khai báo hàng ngày
      </h3>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: 16 }}>
          <span role="img" aria-label="loading">⏳</span> Đang tải...
        </div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: 16 }}>{error}</div>
      ) : logs.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 16 }}>
          <span role="img" aria-label="no-data">🗒️</span> Chưa có dữ liệu khai báo.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="logs-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, marginTop: 12, background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px rgba(44,62,80,0.05)' }}>
            <thead>
              <tr style={{ background: '#eaf6ff' }}>
                <th style={{ padding: '10px 12px', borderTopLeftRadius: 10 }}>Ngày</th>
                <th style={{ padding: '10px 12px' }}>Đã hút?</th>
                <th style={{ padding: '10px 12px' }}>Số điếu</th>
                <th style={{ padding: '10px 12px' }}>Mức độ thèm</th>
                <th style={{ padding: '10px 12px' }}>Sức khỏe</th>
                <th style={{ padding: '10px 12px' }}>Cải thiện?</th>
                <th style={{ padding: '10px 12px', borderTopRightRadius: 10 }}>Giai đoạn</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={log.logId} style={{ background: idx % 2 === 0 ? '#f6fcfa' : '#fff', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#d6eaff'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#f6fcfa' : '#fff'}>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{log.logDate}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{log.smoked ? <span style={{color:'#e74c3c'}}>Có 🚬</span> : <span style={{color:'#27ae60'}}>Không</span>}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{log.smokeCount}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{log.cravingLevel}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{log.healthStatus}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{log.isImprovement ? <span style={{color:'#27ae60'}}>Có 👍</span> : <span style={{color:'#e74c3c'}}>Không</span>}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{log.stageNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DailyLogsHistory;
