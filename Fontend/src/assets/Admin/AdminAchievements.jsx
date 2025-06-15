import './AdminPage.css';
function AdminAchievements() {
  return (
    <div className="admin-page">
      <h2>Quản lý Thành Tích</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Tên thành tích</th><th>Người đạt</th><th>Ngày đạt</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Top 1 tháng 6</td><td>Nguyễn Văn A</td><td>10/06/2025</td>
          </tr>
          <tr>
            <td>Coach xuất sắc</td><td>Trần Văn Minh</td><td>09/06/2025</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export default AdminAchievements;
