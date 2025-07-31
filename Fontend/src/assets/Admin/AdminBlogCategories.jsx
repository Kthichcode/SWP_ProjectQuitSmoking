import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './AdminDashBoard.css';

const AdminBlogCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');

  // API endpoints
  const API_BASE_URL = 'http://localhost:8080/api/blog-categories';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/getAll`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.status === 'success') {
        setCategories(response.data.data);
      } else {
        setError('Không thể tải danh sách thể loại');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Lỗi khi tải danh sách thể loại');
      setErrorMessage('Lỗi khi tải danh sách thể loại');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setCurrentCategory({ id: null, name: '' });
    setShowModal(true);
    setError('');
  };

  const handleEdit = (category) => {
    setModalMode('edit');
    setCurrentCategory({ id: category.id, name: category.name });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/categories/${deleteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteError('');
      fetchCategories(); // Reload list
      setSuccessModalMessage('Xóa thể loại thành công!');
      setShowSuccessModal(true);
      setErrorMessage('');
    } catch (error) {
      console.error('Error deleting category:', error);
      setDeleteError('Lỗi khi xóa thể loại. Có thể thể loại này đang được sử dụng.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setDeleteError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    if (!currentCategory.name.trim()) {
      setError('Tên thể loại không được để trống');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const categoryData = {
        name: currentCategory.name.trim()
      };

      let response;
      if (modalMode === 'create') {
        response = await axios.post(`${API_BASE_URL}/create`, categoryData, { headers });
      } else {
        response = await axios.put(`${API_BASE_URL}/${currentCategory.id}`, categoryData, { headers });
      }

      if (response.data.status === 'success') {
        setShowModal(false);
        fetchCategories();
        setSuccessModalMessage(modalMode === 'create' ? 'Tạo thể loại thành công!' : 'Cập nhật thể loại thành công!');
        setShowSuccessModal(true);
        setErrorMessage('');
      } else {
        setError(response.data.message || 'Có lỗi xảy ra');
        setErrorMessage(response.data.message || 'Có lỗi xảy ra');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
        setErrorMessage(error.response.data.message);
      } else {
        setError('Lỗi khi lưu thể loại');
        setErrorMessage('Lỗi khi lưu thể loại');
      }
      setSuccessMessage('');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategory({ id: null, name: '' });
    setError('');
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Quản Lý Thể Loại Blog</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          <FaPlus /> Thêm Thể Loại
        </button>
      </div>

      {/* Thông báo thành công/thất bại */}
      {successMessage && <div style={{color:'green',marginBottom:8,fontWeight:600}}>{successMessage}</div>}
      {errorMessage && <div style={{color:'red',marginBottom:8,fontWeight:600}}>{errorMessage}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Thể Loại</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center">Không có thể loại nào</td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(category)}
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(category.id)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalMode === 'create' ? 'Thêm Thể Loại Mới' : 'Chỉnh Sửa Thể Loại'}</h3>
              <button className="btn-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                  <label htmlFor="categoryName">Tên Thể Loại *</label>
                  <input
                    type="text"
                    id="categoryName"
                    value={currentCategory.name}
                    onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                    placeholder="Nhập tên thể loại"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  <FaTimes /> Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaSave /> {modalMode === 'create' ? 'Tạo' : 'Cập Nhật'}
                </button>
              </div>
            </form>
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
            animation: 'deleteModalIn 0.3s ease-out',
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
            
            {/* Title and Message */}
            <div style={{
              color: '#1f2937',
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 8,
              lineHeight: 1.3,
            }}>
              {deleteError ? 'Không thể xóa' : 'Xác nhận xóa'}
            </div>
            <div style={{
              color: deleteError ? '#e11d48' : '#6b7280',
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.4,
              marginBottom: 32,
              minHeight: 24,
            }}>
              {deleteError ? deleteError : 'Bạn có chắc chắn muốn xóa thể loại này? Hành động này không thể hoàn tác.'}
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

      {/* Success Modal */}
      {showSuccessModal && (
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
            animation: 'successModalIn 0.3s ease-out',
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
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
              Thành công!
            </div>
            <div style={{
              color: '#6b7280',
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.4,
            }}>
              {successModalMessage}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes deleteModalIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes successModalIn {
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
    </div>
  );
};

export default AdminBlogCategories;
