import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPage.css';

function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentPackage, setCurrentPackage] = useState({ name: '', price: '', description: '', startDate: '', endDate: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  // Lấy token từ localStorage (hoặc context nếu có)
  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  const fetchPackages = async () => {
    try {
      const token = getToken();
      const res = await axios.get('/api/membership-packages/getAll', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      setPackages(res.data.data || []);
    } catch (err) {
      alert('Lỗi khi tải danh sách gói!');
    }
  };

  const handleOpenModal = (type, pkg = null) => {
    setModalType(type);
    setShowModal(true);
    if (type === 'edit' && pkg) {
      // Tách startDate và endDate từ duration nếu có định dạng "Từ ngày ... đến ngày ..."
      let startDate = '', endDate = '';
      if (pkg.duration) {
        const match = pkg.duration.match(/Từ ngày (\d{4}-\d{2}-\d{2}) đến ngày (\d{4}-\d{2}-\d{2})/);
        if (match) {
          // Chuyển yyyy-MM-dd sang dd/MM/yyyy để hiển thị
          const [sy, sm, sd] = match[1].split('-');
          const [ey, em, ed] = match[2].split('-');
          startDate = `${sd}/${sm}/${sy}`;
          endDate = `${ed}/${em}/${ey}`;
        } else {
          // Nếu không match, thử lấy luôn giá trị cũ nếu đã có
          startDate = pkg.startDate || '';
          endDate = pkg.endDate || '';
        }
      } else {
        startDate = pkg.startDate || '';
        endDate = pkg.endDate || '';
      }
      setCurrentPackage({
        name: pkg.name,
        price: pkg.price,
        description: pkg.description || '',
        startDate,
        endDate,
      });
      setEditId(pkg.id);
    } else {
      setCurrentPackage({ name: '', price: '', description: '', startDate: '', endDate: '' });
      setEditId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPackage({ name: '', price: '', description: '', startDate: '', endDate: '' });
    setEditId(null);
  };

  const handleChange = (e) => {
    setCurrentPackage({ ...currentPackage, [e.target.name]: e.target.value });
  };

  // Xử lý chuyển đổi ngày khi blur (chỉ cho phép dd/MM/yyyy và không cho nhập ngày quá khứ)
  const handleDateBlur = (e) => {
    let val = e.target.value;
    // Nếu không đúng định dạng dd/MM/yyyy thì báo lỗi và clear
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
      alert('Vui lòng nhập ngày theo định dạng dd/MM/yyyy!');
      setCurrentPackage((prev) => ({ ...prev, [e.target.name]: '' }));
      return;
    }
    // Kiểm tra ngày không được nhỏ hơn hôm nay
    const [day, month, year] = val.split('/');
    const inputDate = new Date(`${year}-${month}-${day}T00:00:00`);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (inputDate < today) {
      alert('Chỉ được nhập ngày từ hôm nay trở đi!');
      setCurrentPackage((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  // Xử lý tự động thêm dấu / khi nhập ngày (dd/MM/yyyy)
  const handleDateInput = (e) => {
    let val = e.target.value.replace(/[^\d]/g, ''); // chỉ lấy số
    if (val.length > 8) val = val.slice(0, 8);
    let formatted = val;
    if (val.length > 4) {
      formatted = val.slice(0,2) + '/' + val.slice(2,4) + '/' + val.slice(4);
    } else if (val.length > 2) {
      formatted = val.slice(0,2) + '/' + val.slice(2);
    }
    setCurrentPackage((prev) => ({ ...prev, [e.target.name]: formatted }));
  };

  // Xử lý nhập giá: chỉ cho phép số, tự động thêm dấu chấm phân cách nghìn
  const handlePriceInput = (e) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (!val) val = '';
    else val = Number(val).toLocaleString('vi-VN');
    setCurrentPackage((prev) => ({ ...prev, price: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chỉ cho phép dd/MM/yyyy, nếu không đúng thì không cho submit
      const checkDate = (val) => /^\d{2}\/\d{2}\/\d{4}$/.test(val);
      if (!checkDate(currentPackage.startDate) || !checkDate(currentPackage.endDate)) {
        alert('Vui lòng nhập ngày theo định dạng dd/MM/yyyy!');
        return;
      }
      // Chuyển startDate, endDate về yyyy-MM-dd
      const convertDate = (val) => {
        const [day, month, year] = val.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };
      const payload = {
        name: currentPackage.name,
        // Chuyển price về số nguyên không có dấu chấm
        price: Number(String(currentPackage.price).replace(/\D/g, '')),
        description: currentPackage.description,
        duration: `Từ ngày ${convertDate(currentPackage.startDate)} đến ngày ${convertDate(currentPackage.endDate)}`,
      };
      const token = getToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      if (modalType === 'add') {
        await axios.post('/api/membership-packages/create', payload, config);
      } else {
        await axios.put(`/api/membership-packages/updateByID/${editId}`, payload, config);
      }
      fetchPackages();
      handleCloseModal();
    } catch (err) {
      alert('Lỗi khi lưu gói!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa gói này?')) return;
    try {
      const token = getToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`/api/membership-packages/deleteByID/${id}`, config);
      fetchPackages();
    } catch (err) {
      alert('Lỗi khi xóa gói!');
    }
  };

  return (
    <div className="admin-page">
      <h2>Quản lý Gói Dịch Vụ</h2>
      <button className="admin-btn" onClick={() => handleOpenModal('add')}>Thêm gói mới</button>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Tên gói</th><th>Giá</th><th>Mô tả</th><th>Thời hạn</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {packages.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>Không có gói nào</td>
            </tr>
          ) : (
            packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.name}</td>
                <td>{pkg.price ? Number(String(pkg.price).replace(/\D/g, '')).toLocaleString('vi-VN') + ' VNĐ' : ''}</td>
                <td>{pkg.description}</td>
                <td>{pkg.duration}</td>
                <td>
                  <button className="admin-btn" onClick={() => handleOpenModal('edit', pkg)}>Sửa</button>
                  <button className="admin-btn" onClick={() => handleDelete(pkg.id)}>Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{modalType === 'add' ? 'Thêm gói mới' : 'Sửa gói'}</h3>
            <form onSubmit={handleSubmit}>
              <label>Tên gói:<input name="name" value={currentPackage.name} onChange={handleChange} required /></label>
              <label>Giá:
                <input
                  name="price"
                  value={currentPackage.price}
                  onChange={handlePriceInput}
                  required
                  placeholder="0"
                  style={{ width: 180, marginRight: 8 }}
                  inputMode="numeric"
                />
                <span style={{ color: '#555', marginLeft: 2 }}>VNĐ</span>
              </label>
              <label>Mô tả:<input name="description" value={currentPackage.description} onChange={handleChange} required /></label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                <label style={{ marginBottom: 0 }}>Ngày bắt đầu:
                  <input
                    type="text"
                    name="startDate"
                    value={currentPackage.startDate}
                    onChange={handleDateInput}
                    onBlur={handleDateBlur}
                    required
                    placeholder={modalType === 'edit' && packages[editId != null ? packages.findIndex(p => p.id === editId) : -1]?.duration ? (() => {
                      const pkg = packages[editId != null ? packages.findIndex(p => p.id === editId) : -1];
                      if (!pkg) return 'dd/MM/yyyy';
                      const match = pkg.duration.match(/Từ ngày (\d{4}-\d{2}-\d{2}) đến ngày (\d{4}-\d{2}-\d{2})/);
                      if (match) {
                        const [sy, sm, sd] = match[1].split('-');
                        return `${sd}/${sm}/${sy}`;
                      }
                      return 'dd/MM/yyyy';
                    })() : 'dd/MM/yyyy'}
                    style={{ marginLeft: 8, width: 120 }}
                    maxLength={10}
                  />
                </label>
                <span>đến</span>
                <label style={{ marginBottom: 0 }}>Ngày kết thúc:
                  <input
                    type="text"
                    name="endDate"
                    value={currentPackage.endDate}
                    onChange={handleDateInput}
                    onBlur={handleDateBlur}
                    required
                    placeholder={modalType === 'edit' && packages[editId != null ? packages.findIndex(p => p.id === editId) : -1]?.duration ? (() => {
                      const pkg = packages[editId != null ? packages.findIndex(p => p.id === editId) : -1];
                      if (!pkg) return 'dd/MM/yyyy';
                      const match = pkg.duration.match(/Từ ngày (\d{4}-\d{2}-\d{2}) đến ngày (\d{4}-\d{2}-\d{2})/);
                      if (match) {
                        const [ey, em, ed] = match[2].split('-');
                        return `${ed}/${em}/${ey}`;
                      }
                      return 'dd/MM/yyyy';
                    })() : 'dd/MM/yyyy'}
                    style={{ marginLeft: 8, width: 120 }}
                    maxLength={10}
                  />
                </label>
              </div>
              <div style={{ marginTop: 10 }}>
                <button className="admin-btn" type="submit">Lưu</button>
                <button className="admin-btn" type="button" onClick={handleCloseModal}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminPackages;
