import React from 'react';

function DailyLogsTable({ dailyLogs, loading, error }) {
  if (loading) return <div style={{color:'#888',marginBottom:8}}>Đang tải khai báo hàng ngày...</div>;
  if (error) return <div style={{color:'red',marginBottom:8}}>{error}</div>;
  if (!dailyLogs || dailyLogs.length === 0) return null;
  // Đổi cảm giác thèm sang tiếng Việt
  const cravingLevelVN = {
    LOW: 'Ít',
    MEDIUM: 'Trung bình',
    HIGH: 'Nhiều'
  };
  return (
    <div style={{marginBottom:16}}>
      <h5>Khai báo hàng ngày</h5>
      <table style={{width:'100%',borderCollapse:'collapse',marginBottom:8}}>
        <thead>
          <tr style={{background:'#e3eefd'}}>
            <th style={{border:'1px solid #ccc',padding:4}}>Ngày</th>
            <th style={{border:'1px solid #ccc',padding:4}}>Số điếu thuốc</th>
            <th style={{border:'1px solid #ccc',padding:4}}>Cảm giác thèm</th>
            <th style={{border:'1px solid #ccc',padding:4}}>Sức khỏe</th>
            <th style={{border:'1px solid #ccc',padding:4}}>Cải thiện?</th>
          </tr>
        </thead>
        <tbody>
          {dailyLogs.map(log => (
            <tr key={log.logId}>
              <td style={{border:'1px solid #ccc',padding:4}}>{log.logDate}</td>
              <td style={{border:'1px solid #ccc',padding:4}}>{log.smokeCount}</td>
              <td style={{border:'1px solid #ccc',padding:4}}>{cravingLevelVN[log.cravingLevel] || log.cravingLevel}</td>
              <td style={{border:'1px solid #ccc',padding:4}}>{log.healthStatus}</td>
              <td style={{border:'1px solid #ccc',padding:4}}>{log.isImprovement ? 'Có' : 'Không'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DailyLogsTable;
