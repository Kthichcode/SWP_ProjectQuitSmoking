
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './AdminBlogs.css';

function AdminBlogs() {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    coverImage: '',
    categoryId: '',
    status: 'PENDING',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    axios.get('/api/blog-categories/getAll')
      .then(res => setCategories(res.data.data || []))
      .catch(() => setCategories([]));
  }, []);

  const fetchBlogs = () => {
    if (!token) return;
    setLoading(true);
    axios.get('/api/blog/getAllBlog', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setBlogs(res.data.data || []))
      .catch(err => console.error('Lỗi lấy danh sách blog:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) fetchBlogs();
  }, [token]);



  // Hàm kiểm tra URL ảnh hợp lệ (http/https và đuôi ảnh)
  const isValidImageUrl = (url) => {
    if (!url) return true; // Cho phép bỏ trống
    try {
      const u = new URL(url);
      return /^https?:/.test(u.protocol) &&
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(u.pathname);
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Kiểm tra lỗi cho coverImage
    if (name === 'coverImage') {
      setErrors((prev) => ({
        ...prev,
        coverImage: isValidImageUrl(value)
          ? ''
          : 'Link ảnh bìa không hợp lệ. Vui lòng nhập một URL ảnh hợp lệ (http/https và đuôi .jpg, .jpeg, .png, .gif, .webp, .svg).',
      }));
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      coverImage: '',
      categoryId: '',
      status: 'PENDING',
    });
    setEditingId(null);
  };


  const handleAdd = async (e) => {
    e.preventDefault();
    // Kiểm tra lỗi URL ảnh
    if (!isValidImageUrl(form.coverImage)) {
      setErrors((prev) => ({ ...prev, coverImage: 'Link ảnh bìa không hợp lệ. Vui lòng nhập một URL ảnh hợp lệ (http/https và đuôi .jpg, .jpeg, .png, .gif, .webp, .svg).' }));
      return;
    }
    if (!form.title || !form.content || !form.categoryId) return;
    try {
      await axios.post('/api/blog/create', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      resetForm();
      fetchBlogs();
    } catch (error) {
      console.error('Lỗi khi thêm blog:', error);
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setForm({
      title: blog.title,
      content: blog.content,
      coverImage: blog.coverImage,
      categoryId: blog.categoryId,
      status: blog.status || 'PENDING',
    });
  };


  const handleUpdate = async (e) => {
    e.preventDefault();
    // Kiểm tra lỗi URL ảnh
    if (!isValidImageUrl(form.coverImage)) {
      setErrors((prev) => ({ ...prev, coverImage: 'Link ảnh bìa không hợp lệ. Vui lòng nhập một URL ảnh hợp lệ (http/https và đuôi .jpg, .jpeg, .png, .gif, .webp, .svg).' }));
      return;
    }
    try {
      await axios.put(`/api/blog/update/${editingId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      resetForm();
      fetchBlogs();
    } catch (error) {
      console.error('Lỗi khi cập nhật blog:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/blog/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (error) {
      console.error('Lỗi khi xóa blog:', error);
    }
  };

  const handleApprove = (id) => {
    axios.put(`/api/blog/approve/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchBlogs())
      .catch((err) => console.error('Lỗi duyệt blog:', err));
  };

  const handleReject = (id) => {
    axios.put(`/api/blog/reject/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {       
        setBlogs((prev) => prev.filter((b) => b.id !== id));
      })
      .catch((err) => console.error('Lỗi từ chối blog:', err));
  };

  // Pagination logic
  const filteredBlogs = blogs.filter((blog) => blog.status !== 'REJECTED');
  const totalPages = Math.ceil(filteredBlogs.length / PAGE_SIZE) || 1;
  const pagedBlogs = filteredBlogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page to 1 if filter/search changes and page out of range
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filteredBlogs.length, totalPages]);

  return (
    <div className="admin-blogs-container">
      <h2 className="admin-blogs-title">Quản lý Blog</h2>
      <div className="admin-blogs-desc">Quản lý và duyệt các bài blog của người dùng</div>

      <form onSubmit={editingId ? handleUpdate : handleAdd} className="admin-blogs-form">
        <div className="admin-blogs-form-fields">
          <div>
            <label htmlFor="admin-blogs-title">Tiêu đề blog</label>
            <input
              id="admin-blogs-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Tiêu đề blog"
              className="admin-blogs-input"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-blogs-coverImage">Link ảnh bìa</label>
            <input
              id="admin-blogs-coverImage"
              name="coverImage"
              value={form.coverImage}
              onChange={handleChange}
              placeholder="Link ảnh bìa"
              className="admin-blogs-input"
            />
            {errors.coverImage && (
              <div style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{errors.coverImage}</div>
            )}
          </div>
          <div>
            <label htmlFor="admin-blogs-content">Nội dung blog</label>
            <textarea
              id="admin-blogs-content"
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Nội dung blog"
              rows={4}
              className="admin-blogs-textarea"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-blogs-category">Danh mục</label>
            <select
              id="admin-blogs-category"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="admin-blogs-select"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="admin-blogs-form-btn"
            >
              {editingId ? 'Cập nhật' : 'Thêm mới'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="admin-blogs-form-btn-cancel"
              >
                Hủy
              </button>
            )}
          </div>
        </div>
      </form>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, padding: '40px 0' }}>Đang tải...</p>
      ) : filteredBlogs.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 16, padding: '60px 0' }}>Không có blog nào.</p>
      ) : (
        <>
          <div className="admin-blogs-list">
            {pagedBlogs.map((blog) => (
              <div key={blog.id} className="admin-blogs-card">
                <div className="admin-blogs-card-title">{blog.title}</div>
                {blog.coverImage && (
                  <img src={blog.coverImage} alt="cover" style={{ width: '100%', borderRadius: 8, marginBottom: 8, maxHeight: 180, objectFit: 'cover' }} />
                )}
                <div className="admin-blogs-card-content">{blog.content?.slice(0, 100) || ''}</div>
                <div className="admin-blogs-card-meta">
                  <b>Trạng thái:</b> {blog.status} | <b>Danh mục:</b> {blog.categoryName}
                </div>
                <div className="admin-blogs-card-actions">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="admin-blogs-btn admin-blogs-btn-edit"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="admin-blogs-btn admin-blogs-btn-delete"
                  >
                    Xóa
                  </button>
                  {blog.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(blog.id)}
                        className="admin-blogs-btn admin-blogs-btn-approve"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(blog.id)}
                        className="admin-blogs-btn admin-blogs-btn-reject"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="admin-blogs-pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="admin-blogs-pagination-btn"
              >Trước</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`admin-blogs-pagination-btn${page === i + 1 ? ' active' : ''}`}
                >{i + 1}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="admin-blogs-pagination-btn"
              >Sau</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminBlogs;
