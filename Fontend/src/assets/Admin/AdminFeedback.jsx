import './AdminPage.css';
function AdminFeedback() {
  return (
    <div className="admin-page">
      <h2>Phản Hồi Người Dùng</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Người gửi</th><th>Nội dung</th><th>Ngày gửi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nguyễn Văn A</td><td>Ứng dụng rất hữu ích!</td><td>12/06/2025</td>
          </tr>
          <tr>
            <td>Lê Thị B</td><td>Tôi muốn thêm tính năng nhắc nhở.</td><td>11/06/2025</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export default AdminFeedback;
