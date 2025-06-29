import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

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

  // Lấy danh mục từ API thay vì hardcoded
  useEffect(() => {
    axios.get('/api/blog-categories/getAll')
      .then(res => setCategories(res.data.data || []))
      .catch(() => setCategories([]));
  }, []);

  // Lấy danh sách blog
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center' }}>Quản lý Blog</h2>

      <form onSubmit={editingId ? handleUpdate : handleAdd} style={{ marginBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 25 }}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Tiêu đề blog"
            style={{ padding: 5 }}
          />
          <input
            name="coverImage"
            value={form.coverImage}
            onChange={handleChange}
            placeholder="Link ảnh bìa"
            style={{ padding: 5, background: '#fff', color: '#222', border: '1px solid #ccc', borderRadius: 4 }}
          />
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Nội dung blog"
            rows={3}
            style={{ gridColumn: '1 / -1', padding: 10, background: '#fff', color: '#222', border: '1px solid #ccc', borderRadius: 4 }}
          />

          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            style={{ padding: 10, background: '#fff', color: '#222', border: '1px solid #ccc', borderRadius: 4 }}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={{ padding: 10, background: '#fff', color: '#222', border: '1px solid #ccc', borderRadius: 4 }}
          >
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Bị từ chối</option>
          </select>

          <div style={{ gridColumn: '1 / -1' }}>
            <button
              type="submit"
              style={{ padding: '10px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              {editingId ? 'Cập nhật' : 'Thêm mới'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{ marginLeft: 12, padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: 4 }}
              >
                Hủy
              </button>
            )}
          </div>
        </div>
      </form>

      {loading ? (
        <p>Đang tải...</p>
      ) : blogs.length === 0 ? (
        <p>Không có blog nào.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {blogs.map((blog) => (
            <div key={blog.id} style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, background: '#fff' }}>
              <h3>{blog.title}</h3>
              <p>{blog.content.length > 100 ? blog.content.slice(0, 100) + '...' : blog.content}</p>
              {blog.coverImage && (
                <img src={blog.coverImage} alt="cover" style={{ width: '100%', borderRadius: 6, marginBottom: 8 }} />
              )}
              <p style={{ fontSize: 14, color: '#666' }}>
                <b>Trạng thái:</b> {blog.status} | <b>Danh mục:</b> {blog.categoryName}
              </p>
              <div>
                <button
                  onClick={() => handleEdit(blog)}
                  style={{ marginRight: 8, padding: '6px 12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: 4 }}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4 }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminBlogs;
