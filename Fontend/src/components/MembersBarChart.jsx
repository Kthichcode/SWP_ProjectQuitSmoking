import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function MembersBarChart({ members }) {
  // Đếm số lượng thành viên theo ký tự đầu tiên của tên
  const counts = {};
  (members || []).forEach(m => {
    const name = m.full_name || m.fullName || 'Ẩn danh';
    const firstChar = name.charAt(0).toUpperCase();
    counts[firstChar] = (counts[firstChar] || 0) + 1;
  });
  const labels = Object.keys(counts).sort();
  const data = {
    labels,
    datasets: [
      {
        label: 'Số thành viên',
        data: labels.map(l => counts[l]),
        backgroundColor: '#2d6cdf',
        borderRadius: 6,
      },
    ],
  };
  const options = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eee' } },
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  return (
    <div style={{height:220, marginTop:24}}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default MembersBarChart;
