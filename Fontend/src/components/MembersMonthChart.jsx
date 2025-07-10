import React from 'react';
import { Column } from '@ant-design/plots';

function MembersMonthChart({ data }) {
  // data: [{ month: '01/2025', count: 5 }, ...]
  const config = {
    data,
    xField: 'month',
    yField: 'count',
    color: '#2d6cdf',
    columnWidthRatio: 0.6,
    label: {
      position: 'middle',
      style: { fill: '#fff', fontSize: 14 },
    },
    xAxis: {
      label: { autoHide: true, autoRotate: false },
      title: { text: 'Tháng', style: { fontWeight: 600 } },
    },
    yAxis: {
      title: { text: 'Số thành viên', style: { fontWeight: 600 } },
    },
    tooltip: { showMarkers: false },
    interactions: [{ type: 'active-region' }],
    height: 300,
  };
  return <Column {...config} />;
}

export default MembersMonthChart;
