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

  // API endpoints
  const API_BASE_URL = 'http://localhost:8080/api/blog-categories';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
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
    if (window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      try {
        // Note: Backend cần thêm DELETE endpoint
        alert('Chức năng xóa chưa được hỗ trợ từ backend. Vui lòng liên hệ developer để thêm DELETE endpoint.');
        
        // Uncomment khi backend đã có DELETE endpoint
        // const token = localStorage.getItem('token');
        // await axios.delete(`${API_BASE_URL}/${id}`, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // });
        // 
        // fetchCategories(); // Reload list
        // alert('Xóa thể loại thành công!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Lỗi khi xóa thể loại');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        alert(modalMode === 'create' ? 'Tạo thể loại thành công!' : 'Cập nhật thể loại thành công!');
      } else {
        setError(response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Lỗi khi lưu thể loại');
      }
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
                    required
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
    </div>
  );
};

export default AdminBlogCategories;
