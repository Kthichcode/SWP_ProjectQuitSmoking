import './AdminPage.css';

function AdminSystem() {
  return (
    <div className="admin-page">
      <h2>Quản lý Hệ Thống</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Tham số</th><th>Giá trị</th><th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Phiên bản</td><td>1.0.0</td><td>Phiên bản hiện tại</td>
          </tr>
          <tr>
            <td>Thời gian bảo trì</td><td>23:00-01:00</td><td>Bảo trì định kỳ</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default AdminSystem;
