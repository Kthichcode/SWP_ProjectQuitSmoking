import './AdminPage.css';
function AdminStatistics() {
  return (
    <div className="admin-page">
      <h2>Thống Kê Người Dùng</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ngày</th><th>Người dùng mới</th><th>Người dùng hoạt động</th><th>Kế hoạch mới</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>12/06/2025</td><td>12</td><td>34</td><td>5</td>
          </tr>
          <tr>
            <td>11/06/2025</td><td>8</td><td>29</td><td>3</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export default AdminStatistics;
