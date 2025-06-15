import './AdminPage.css';
function AdminPackages() {
  return (
    <div className="admin-page">
      <h2>Quản lý Gói Dịch Vụ</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Tên gói</th><th>Giá</th><th>Thời hạn</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Gói 3 tháng</td><td>249.000đ</td><td>3 tháng</td>
            <td><button className="admin-btn">Xem</button></td>
          </tr>
          <tr>
            <td>Gói 6 tháng</td><td>449.000đ</td><td>6 tháng</td>
            <td><button className="admin-btn">Xem</button></td>
          </tr>
          <tr>
            <td>Gói 12 tháng</td><td>799.000đ</td><td>12 tháng</td>
            <td><button className="admin-btn">Xem</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export default AdminPackages;
