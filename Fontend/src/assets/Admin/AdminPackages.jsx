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
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

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
    setErrors({}); // Clear errors when opening modal
    const todayStr = format(new Date(), 'dd/MM/yyyy');

    if (type === 'edit' && pkg) {
      console.log('Editing package:', pkg); // Debug log
      
      const parseDate = (val) => {
        try {
          if (!val) return '';
          // Handle ISO string with time: yyyy-MM-ddTHH:mm:ss
          if (/^\d{4}-\d{2}-\d{2}T/.test(val)) {
            const datePart = val.split('T')[0];
            const [y, m, d] = datePart.split('-');
            return `${d}/${m}/${y}`;
          }
          if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const [y, m, d] = val.split('-');
            return `${d}/${m}/${y}`;
          } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
            return val;
          }
          return '';
        } catch (error) {
          console.error('Error parsing date:', val, error);
          return '';
        }
      };

      try {
        setCurrentPackage({
          name: pkg.name || '',
          price: pkg.price ? Number(String(pkg.price).replace(/\D/g, '')).toLocaleString('vi-VN') : '',
          description: pkg.description || '',
          releaseDate: parseDate(pkg.releaseDate) || todayStr,
          endDate: parseDate(pkg.endDate) || '',
        });
        setEditId(pkg.id);
      } catch (error) {
        console.error('Error setting package data:', error);
        alert('Lỗi khi mở form sửa. Vui lòng thử lại!');
        setShowModal(false);
      }
    } else {
      setCurrentPackage({ 
        name: '', 
        price: '', 
        description: '', 
        releaseDate: todayStr, 
        endDate: '' 
      });
      setEditId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPackage({ name: '', price: '', description: '', releaseDate: '', endDate: '' });
    setEditId(null);
    setErrors({}); // Clear errors when closing modal
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name': {
        if (!value || value.trim() === '') return 'Tên gói không được bỏ trống.';
        if (value.length < 5) return 'Tên gói phải có ít nhất 5 ký tự.';
        if (value.length > 25) return 'Tên gói tối đa 25 ký tự.';
        if (/^\d/.test(value)) return 'Tên gói không được bắt đầu bằng số.';
        if (/[^a-zA-Z0-9\sÀ-ỹ]/.test(value)) return 'Tên gói không được chứa ký tự đặc biệt.';
        
        return '';
      }
      case 'price': {
        if (!value || value.trim() === '') return 'Giá không được bỏ trống.';
        if (!/^[1-9][0-9]*$/.test(value.replace(/\D/g, ''))) return 'Giá phải là số nguyên dương.';
        return '';
      }
      case 'description': {
        if (!value || value.trim() === '') return 'Mô tả không được bỏ trống.';
        if (value.length < 10) return 'Mô tả phải có ít nhất 10 ký tự.';
        return '';
      }
      case 'releaseDate': {
        if (!value || value.trim() === '') return 'Ngày bắt đầu không được bỏ trống.';
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return 'Ngày bắt đầu không hợp lệ.';
        return '';
      }
      case 'endDate': {
        if (!value || value.trim() === '') return 'Ngày kết thúc không được bỏ trống.';
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return 'Ngày kết thúc không hợp lệ.';
        return '';
      }
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPackage({ ...currentPackage, [name]: value });
    let errorMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handlePriceInput = (e) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (!val) val = '';
    else val = Number(val).toLocaleString('vi-VN');
    setCurrentPackage((prev) => ({ ...prev, price: val }));
    let errorMsg = validateField('price', val);
    setErrors(prev => ({ ...prev, price: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors first
    setErrors({});
    
    // Validate all fields
    const newErrors = {};
    newErrors.name = validateField('name', currentPackage.name);
    newErrors.price = validateField('price', currentPackage.price);
    newErrors.description = validateField('description', currentPackage.description);
    newErrors.releaseDate = validateField('releaseDate', currentPackage.releaseDate);
    newErrors.endDate = validateField('endDate', currentPackage.endDate);
    
    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    setErrors(newErrors);
    
    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      return;
    }

    const convertDate = (val) => {
      const [day, month, year] = val.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const releaseDateStr = convertDate(currentPackage.releaseDate);
    const endDateStr = convertDate(currentPackage.endDate);

    const payload = {
      name: currentPackage.name.trim(),
      price: Number(String(currentPackage.price).replace(/\D/g, '')),
      description: currentPackage.description.trim(),
      releaseDate: releaseDateStr,
      endDate: endDateStr,
    };

    console.log('Submitting package data:', payload);
    console.log('Modal type:', modalType);
    console.log('Edit ID:', editId);

    try {
      const token = getToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      if (modalType === 'add') {
        await axios.post('/api/membership-packages/create', payload, config);
        setSuccessMsg('Thêm mới gói thành công!');
      } else if (modalType === 'edit' && editId) {
        await axios.put(`/api/membership-packages/updateByID/${editId}`, payload, config);
        setSuccessMsg('Cập nhật gói thành công!');
      }
      fetchPackages();
      handleCloseModal();
    } catch (err) {
      console.error('Submit error:', err);
      setErrors(prev => ({ ...prev, submit: 'Có lỗi xảy ra!' }));
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = getToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`/api/membership-packages/deleteByID/${deleteId}`, config);
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteError('');
      setSuccessMsg('Xóa gói thành công!');
      fetchPackages();
    } catch (err) {
      let msg = '';
      if (err.response && err.response.status === 500) {
        if (err.response.data && typeof err.response.data === 'string' && err.response.data.includes('đang sử dụng')) {
          msg = 'Không thể xóa: Có người dùng đang sử dụng gói này!';
        } else if (err.response.data && err.response.data.message && err.response.data.message.includes('đang sử dụng')) {
          msg = 'Không thể xóa: Có người dùng đang sử dụng gói này!';
        } else {
          msg = 'Không thể xóa: Có người dùng đang sử dụng gói này!';
        }
      } else {
        msg = 'Không thể xóa: Có người dùng đang sử dụng gói này!';
      }
      setDeleteError(msg);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setDeleteError('');
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
                <td>
                  {pkg.description && typeof pkg.description === 'string' && pkg.description.trim() !== '' ? (
                    <ul style={{margin:0,paddingLeft:18}}>
                      {pkg.description.split(/\r?\n/).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  ) : ''}
                </td>
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

      {/* Redesigned Success Message Box Modal */}
      {successMsg && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #ffffff, #f8fffe)',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(34,197,94,0.2), 0 8px 32px rgba(0,0,0,0.1)',
            padding: '40px 50px',
            minWidth: 380,
            maxWidth: 500,
            textAlign: 'center',
            border: '1px solid rgba(34,197,94,0.2)',
            position: 'relative',
            transform: 'scale(1)',
            animation: 'successBoxIn 0.3s ease-out',
          }}>
            {/* Close Button */}
            <button
              onClick={() => setSuccessMsg('')}
              style={{
                position: 'absolute',
                top: 15,
                right: 20,
                background: 'rgba(136,136,136,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: '#666',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(136,136,136,0.2)';
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(136,136,136,0.1)';
                e.target.style.color = '#666';
              }}
              aria-label="Đóng thông báo"
            >×</button>
            
            {/* Success Icon */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #22c55e, #16a34a)',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2"/>
              </svg>
            </div>
            
            {/* Success Message */}
            <div style={{
              color: '#1f2937',
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 8,
              lineHeight: 1.3,
            }}>
              
            </div>
            <div style={{
              color: '#6b7280',
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.4,
            }}>
              {successMsg}
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #ffffff, #fef7f7)',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(239,68,68,0.2), 0 8px 32px rgba(0,0,0,0.1)',
            padding: '40px 50px',
            minWidth: 380,
            maxWidth: 500,
            textAlign: 'center',
            border: '1px solid rgba(239,68,68,0.2)',
            position: 'relative',
            transform: 'scale(1)',
            animation: 'successBoxIn 0.3s ease-out',
          }}>
            {/* Warning Icon */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #ef4444, #dc2626)',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Warning Message */}
            <div style={{
              color: '#1f2937',
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 8,
              lineHeight: 1.3,
            }}>
              {deleteError ? 'Không thể xóa' : ''}
            </div>
            <div style={{
              color: deleteError ? '#e11d48' : '#6b7280',
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.4,
              marginBottom: 32,
              minHeight: 24,
            }}>
              {deleteError ? deleteError : 'Bạn chắc chắn muốn xóa gói dịch vụ này? Hành động này không thể hoàn tác.'}
            </div>
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
            }}>
              <button
                onClick={cancelDelete}
                style={{
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 16,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(107,114,128,0.2)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#4b5563';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#6b7280';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  background: deleteError ? '#d1d5db' : 'linear-gradient(145deg, #ef4444, #dc2626)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontWeight: 600,
                  cursor: deleteError ? 'not-allowed' : 'pointer',
                  fontSize: 16,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                  opacity: deleteError ? 0.6 : 1,
                }}
                disabled={!!deleteError}
                onMouseEnter={e => {
                  if (!deleteError) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(239,68,68,0.4)';
                  }
                }}
                onMouseLeave={e => {
                  if (!deleteError) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(239,68,68,0.3)';
                  }
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes successBoxIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal admin-package-modal">
            <h3 className="admin-package-modal-title">{modalType === 'add' ? 'Thêm gói mới' : 'Sửa gói'}</h3>
            <form className="admin-package-form" onSubmit={handleSubmit}>
              <div className="admin-package-form-group">
                <label className="admin-package-label">Tên gói</label>
                <input 
                  className="admin-package-input" 
                  name="name" 
                  value={currentPackage.name || ''} 
                  onChange={handleChange} 
                />
                <span style={{ minHeight: 18, display: 'block' }}>{errors.name && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.name.split('\n').map((line, i) => <div key={i}>{line}</div>)}</span>}</span>
              </div>
              <div className="admin-package-form-group">
                <label className="admin-package-label">Giá</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    className="admin-package-input"
                    name="price"
                    value={currentPackage.price || ''}
                    onChange={handlePriceInput}
                    placeholder="0"
                    inputMode="numeric"
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: '#555', fontWeight: 500 }}>VNĐ</span>
                </div>
                <span style={{ minHeight: 18, display: 'block' }}>{errors.price && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.price}</span>}</span>
              </div>
              <div className="admin-package-form-group">
                <label className="admin-package-label">Mô tả (mỗi dòng 1 chức năng)</label>
                <textarea
                  className="admin-package-input"
                  name="description"
                  value={currentPackage.description || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Nhập từng chức năng, mỗi dòng 1 chức năng"
                />
                <span style={{ minHeight: 18, display: 'block' }}>{errors.description && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.description}</span>}</span>
              </div>
              <div className="admin-package-form-group">
                <label className="admin-package-label">Ngày bắt đầu</label>
                <DatePicker
                  selected={currentPackage.releaseDate ? parseDateString(currentPackage.releaseDate) : null}
                  onChange={(date) => {
                    if (date) {
                      setCurrentPackage(prev => ({ ...prev, releaseDate: formatDateString(date) }));
                      let errorMsg = validateField('releaseDate', formatDateString(date));
                      setErrors(prev => ({ ...prev, releaseDate: errorMsg }));
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  className="admin-package-input"
                  disabled={modalType === 'add'}
                  locale={vi}
                  minDate={modalType === 'edit' ? null : new Date()}
                />
                <span style={{ minHeight: 18, display: 'block' }}>{errors.releaseDate && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.releaseDate}</span>}</span>
              </div>
              <div className="admin-package-form-group">
                <label className="admin-package-label">Ngày kết thúc</label>
                <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
                  <DatePicker
                    selected={currentPackage.endDate ? parseDateString(currentPackage.endDate) : null}
                    onChange={(date) => {
                      if (date) {
                        setCurrentPackage(prev => ({ ...prev, endDate: formatDateString(date) }));
                        let errorMsg = validateField('endDate', formatDateString(date));
                        setErrors(prev => ({ ...prev, endDate: errorMsg }));
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/MM/yyyy"
                    minDate={new Date()}
                    className="admin-package-input"
                    locale={vi}
                    style={{ flex: 1 }}
                  />
                </div>
                <span style={{ minHeight: 18, display: 'block' }}>{errors.endDate && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.endDate}</span>}</span>
              </div>
              <span style={{ minHeight: 18, display: 'block', width: '100%' }}>{errors.submit && <span style={{ color: '#e11d48', fontSize: 13 }}>{errors.submit}</span>}</span>
              {/* Remove inline success message here, now shown as modal */}
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