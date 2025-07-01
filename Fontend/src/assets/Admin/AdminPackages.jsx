import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPage.css';
import './AdminPackageModal.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parse, format } from 'date-fns';
import { vi } from 'date-fns/locale';

function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentPackage, setCurrentPackage] = useState({ name: '', price: '', description: '', releaseDate: '', endDate: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  const fetchPackages = async () => {
    try {
      const token = getToken();
      const res = await axios.get('/api/membership-packages/getAll', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      setPackages(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      alert('Lỗi khi tải danh sách gói!');
    }
  };

  const parseDateString = (dateStr) => {
    try {
      return parse(dateStr, 'dd/MM/yyyy', new Date());
    } catch {
      return null;
    }
  };

  const formatDateString = (date) => {
    try {
      return format(date, 'dd/MM/yyyy');
    } catch {
      return '';
    }
  };

  const handleOpenModal = (type, pkg = null) => {
    setModalType(type);
    setShowModal(true);
    const todayStr = format(new Date(), 'dd/MM/yyyy');

    if (type === 'edit' && pkg) {
      const parseDate = (val) => {
        if (!val) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          const [y, m, d] = val.split('-');
          return `${d}/${m}/${y}`;
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
          return val;
        }
        return '';
      };
      setCurrentPackage({
        name: pkg.name,
        price: pkg.price,
        description: pkg.description || '',
        releaseDate: todayStr,
        endDate: parseDate(pkg.endDate),
      });
      setEditId(pkg.id);
    } else {
      setCurrentPackage({ name: '', price: '', description: '', releaseDate: todayStr, endDate: '' });
      setEditId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPackage({ name: '', price: '', description: '', releaseDate: '', endDate: '' });
    setEditId(null);
  };

  const handleChange = (e) => {
    setCurrentPackage({ ...currentPackage, [e.target.name]: e.target.value });
  };

  const handlePriceInput = (e) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (!val) val = '';
    else val = Number(val).toLocaleString('vi-VN');
    setCurrentPackage((prev) => ({ ...prev, price: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const checkDate = (val) => /^\d{2}\/\d{2}\/\d{4}$/.test(val);
      if (!checkDate(currentPackage.releaseDate) || !checkDate(currentPackage.endDate)) {
        alert('Vui lòng nhập ngày hợp lệ!');
        return;
      }

      const convertDate = (val) => {
        const [day, month, year] = val.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      const releaseDateStr = convertDate(currentPackage.releaseDate);
      const endDateStr = convertDate(currentPackage.endDate);

      const payload = {
        name: currentPackage.name,
        price: Number(String(currentPackage.price).replace(/\D/g, '')),
        description: currentPackage.description,
        releaseDate: releaseDateStr,
        endDate: endDateStr,
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
                <td>{pkg.releaseDate && pkg.endDate ? (() => {
                  const parseToDMY = (val) => {
                    if (!val || typeof val !== 'string') return '';
                    if (/^\d{4}-\d{2}-\d{2}T/.test(val)) {
                      const datePart = val.split('T')[0];
                      const [y, m, d] = datePart.split('-');
                      return `${d}/${m}/${y}`;
                    }
                    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                      const [y, m, d] = val.split('-');
                      return `${d}/${m}/${y}`;
                    }
                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
                      return val;
                    }
                    return '';
                  };
                  const d1 = parseToDMY(pkg.releaseDate);
                  const d2 = parseToDMY(pkg.endDate);
                  return `Từ ngày ${d1} đến ngày ${d2}`;
                })() : ''}</td>
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
          <div className="modal admin-package-modal">
            <h3 className="admin-package-modal-title">{modalType === 'add' ? 'Thêm gói mới' : 'Sửa gói'}</h3>
            <form className="admin-package-form" onSubmit={handleSubmit}>
              <div className="admin-package-form-group">
                <label className="admin-package-label">Tên gói</label>
                <input className="admin-package-input" name="name" value={currentPackage.name} onChange={handleChange} required />
              </div>
              <div className="admin-package-form-group">
                <label className="admin-package-label">Giá</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    className="admin-package-input"
                    name="price"
                    value={currentPackage.price}
                    onChange={handlePriceInput}
                    required
                    placeholder="0"
                    inputMode="numeric"
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: '#555', fontWeight: 500 }}>VNĐ</span>
                </div>
              </div>
              <div className="admin-package-form-group">
                <label className="admin-package-label">Mô tả</label>
                <input className="admin-package-input" name="description" value={currentPackage.description} onChange={handleChange} required />
              </div>
              <div className="admin-package-form-group">
                <label className="admin-package-label">Ngày bắt đầu</label>
                <DatePicker
                  selected={parseDateString(currentPackage.releaseDate)}
                  dateFormat="dd/MM/yyyy"
                  className="admin-package-input"
                  disabled
                  locale={vi}
                />
              </div>
              <div className="admin-package-form-group">
                <label className="admin-package-label">Ngày kết thúc</label>
                <DatePicker
                  selected={currentPackage.endDate ? parseDateString(currentPackage.endDate) : null}
                  onChange={(date) => {
                    setCurrentPackage(prev => ({ ...prev, endDate: formatDateString(date) }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/MM/yyyy"
                  minDate={new Date()}
                  className="admin-package-input"
                  locale={vi}
                />
              </div>
              <div className="admin-package-form-actions">
                <button className="admin-btn admin-package-btn" type="submit">Lưu</button>
                <button className="admin-btn admin-package-btn-cancel" type="button" onClick={handleCloseModal}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPackages;