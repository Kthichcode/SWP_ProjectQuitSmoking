import React from 'react';
import './Appointments.css';

const appointmentsData = {
  today: 0,
  thisWeek: 23,
  pending: 3,
  completionRate: 96,
  upcoming: [
    { date: 'Thứ 4, 19/06/2025', time: '09:00', client: 'Nguyễn Văn An', status: 'Chờ xác nhận' },
    { date: 'Thứ 5, 20/06/2025', time: '14:00', client: 'Trần Thị Bình', status: 'Đã xác nhận' }
  ],
  calendar: [
    [1,2,3,4,5,6,7],
    [8,9,10,11,12,13,14],
    [15,16,17,18,19,20,21],
    [22,23,24,25,26,27,28],
    [29,30]
  ]
};

function Appointments() {
  return (
    <div>
      <h2>Quản lý lịch hẹn</h2>
      <div className="appointment-header">
        <div>Hôm nay: <b>{appointmentsData.today}</b></div>
        <div>Tuần này: <b>{appointmentsData.thisWeek}</b></div>
        <div>Chờ xác nhận: <b>{appointmentsData.pending}</b></div>
        <div>Tỷ lệ hoàn thành: <b>{appointmentsData.completionRate}%</b></div>
      </div>
      <div className="appointment-upcoming">
        <h4>Lịch hẹn sắp tới</h4>
        {appointmentsData.upcoming.length === 0 ? <div>Không có lịch hẹn sắp tới</div> : appointmentsData.upcoming.map((item, idx) => (
          <div key={idx} className="appointment-upcoming-item">
            <b>{item.date}</b> lúc <b>{item.time}</b> với <b>{item.client}</b> - <span className="status" style={{color:item.status==='Chờ xác nhận'?'orange':'green'}}>{item.status}</span>
          </div>
        ))}
      </div>
      <div>
        <h4>Lịch tổng quan tháng 6/2025</h4>
        <div className="appointment-calendar">
          {appointmentsData.calendar.flat().map((day, idx) => (
            <div key={idx} className="appointment-calendar-day">{day}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Appointments;
