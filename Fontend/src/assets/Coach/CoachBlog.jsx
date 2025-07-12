import React, { useState, useEffect } from "react";
import "./CoachBlog.css";
import axios from "axios";
import { useAuth } from '../../contexts/AuthContext';
import { FaEye, FaHeart, FaCommentDots, FaEdit, FaShareAlt, FaPlus } from "react-icons/fa";

const filterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "PUBLISHED", label: "Đã xuất bản" },
  { value: "PENDING", label: "Chờ duyệt" }
];

export default function CoachBlog() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editBlog, setEditBlog] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
  
    title: '',
    content: '',
    coverImage: '',
    categoryId: '',
    status: 'PENDING',
  });
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
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

  useEffect(() => {
    axios.get('/api/blog-categories/getAll')
      .then(res => setCategories(res.data.data || []))
      .catch(() => setCategories([]));
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchSearch = blog.title.toLowerCase().includes(search.toLowerCase());
    let matchFilter = true;
    if (filter !== "all") {
      const status = (blog.status || '').toUpperCase();
      if (filter === "PUBLISHED") {
        matchFilter = status === "PUBLISHED" || status === "APPROVED";
      } else {
        matchFilter = status === filter.toUpperCase();
      }
    }
    return matchSearch && matchFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBlogs.length / PAGE_SIZE) || 1;
  const pagedBlogs = filteredBlogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page to 1 if filter/search changes and page out of range
  useEffect(() => {
    if (page > totalPages) setPage(1);
    // eslint-disable-next-line
  }, [filter, search, filteredBlogs.length]);

  const handleEdit = (blog) => {
    setEditBlog(blog);
    setEditForm({
      title: blog.title,
      desc: blog.desc || '',
      label: blog.label || '',
      tags: (blog.tags || []).join(", "),
      content: blog.content || "",
      categoryId: blog.categoryId || '',
      status: blog.status || 'draft',
    });
    setShowEditModal(true);
  };


  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditBlog(null);
  };

 
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

 
  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!addForm.title || !addForm.content || !addForm.categoryId) return;
    try {
      await axios.post('/api/blog/create', { ...addForm, status: 'PENDING' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setAddForm({
        title: '',
        content: '',
        coverImage: '',
        categoryId: '',
        status: 'PENDING',
      });
      fetchBlogs();
    } catch (error) {
      console.error('Lỗi khi thêm blog:', error);
    }
  };

  
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editBlog) return;
    try {
      await axios.put(`/api/blog/update/${editBlog.id}`, {
        title: editForm.title,
        content: editForm.content,
        label: editForm.label,
        tags: editForm.tags,
        status: editForm.status,
        
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      setEditBlog(null);
      fetchBlogs();
    } catch (error) {
      console.error('Lỗi khi cập nhật blog:', error);
    }
  };

  return (
    <div className="coach-blog-container">
      <div className="coach-blog-header">Quản lý Blog</div>
      <div className="coach-blog-desc">Viết và quản lý các bài blog của bạn</div>
      <div className="coach-blog-actions">
        <button className="coach-blog-btn-new" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Viết bài mới
        </button>
      </div>
      <div className="coach-blog-search-filter">
        <input
          className="coach-blog-search"
          type="text"
          placeholder="Tìm kiếm bài viết..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="coach-blog-filter"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {filterOptions.map(opt => (
            <option value={opt.value} key={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="coach-blog-list">
        {loading ? <p>Đang tải...</p> : pagedBlogs.map(blog => (
          <div className="coach-blog-card" key={blog.id}>
            <div className={`coach-blog-badge${blog.status === "draft" ? " draft" : blog.status === "PENDING" ? " pending" : ""}`}>
              {blog.status === "draft"
                ? "Bản nháp"
                : blog.status === "PENDING"
                ? "Chờ duyệt"
                : "Đã xuất bản"}
            </div>
            {blog.coverImage && (
              <img src={blog.coverImage} alt="cover" style={{ width: '100%', borderRadius: 8, marginBottom: 8, maxHeight: 180, objectFit: 'cover' }} />
            )}
            <div className="coach-blog-title">{blog.title}</div>
            <div className="coach-blog-desc2">{blog.content?.slice(0, 100) || blog.desc}</div>
            <div className="coach-blog-tags">
              {(blog.tags || []).map((tag, i) => (
                <span className="coach-blog-tag" key={i}>{tag}</span>
              ))}
            </div>
            <div className="coach-blog-footer">
              <span className="coach-blog-readtime">{blog.readTime}</span>
              <div className="coach-blog-actions-card">
                <button className="coach-blog-btn-icon" title="Chỉnh sửa" onClick={() => handleEdit(blog)}><FaEdit /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, margin: '32px 0' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #e5e7eb', background: page === 1 ? '#f3f4f6' : '#fff', color: '#222', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 600 }}
          >Trước</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: '1.5px solid',
                borderColor: page === i + 1 ? '#4CAF50' : '#e5e7eb',
                background: page === i + 1 ? '#4CAF50' : '#fff',
                color: page === i + 1 ? '#fff' : '#222',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: page === i + 1 ? '0 2px 8px #4CAF5022' : 'none',
                outline: 'none',
                margin: '0 2px'
              }}
            >{i + 1}</button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #e5e7eb', background: page === totalPages ? '#f3f4f6' : '#fff', color: '#222', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600 }}
          >Sau</button>
        </div>
      )}

      
      {showAddModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'flex-start',justifyContent:'center'}}>
          <div className="modal-edit-blog" style={{background:'#fff',borderRadius:12,maxWidth:800,width:'100%',marginTop:24,padding:32,boxShadow:'0 4px 32px rgba(0,0,0,0.12)',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{fontWeight:700,fontSize:24,marginBottom:24}}>Thêm bài viết mới</div>
            <button onClick={() => setShowAddModal(false)} style={{position:'absolute',top:18,right:24,fontSize:22,background:'none',border:'none',cursor:'pointer'}}>&times;</button>
            <form onSubmit={handleAddBlog}>
              <div style={{display:'flex',flexDirection:'column',gap:18}}>
                <div>
                  <div style={{fontWeight:500,marginBottom:6}}>Tiêu đề blog</div>
                  <input name="title" value={addForm.title} onChange={handleAddFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16,background:'#fff',color:'#222'}} required />
                </div>
                <div>
                  <div style={{fontWeight:500,marginBottom:6}}>Link ảnh bìa</div>
                  <input name="coverImage" value={addForm.coverImage} onChange={handleAddFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16,background:'#fff',color:'#222'}} />
                </div>
                <div>
                  <div style={{fontWeight:500,marginBottom:6}}>Nội dung blog</div>
                  <textarea name="content" value={addForm.content} onChange={handleAddFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16,minHeight:80,background:'#fff',color:'#222'}} required />
                </div>
                <div>
                  <div style={{fontWeight:500,marginBottom:6}}>Danh mục</div>
                  <select name="categoryId" value={addForm.categoryId} onChange={handleAddFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16,background:'#fff',color:'#222'}} required>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <button type="submit" style={{padding:'10px 24px',background:'#4CAF50',color:'#fff',border:'none',borderRadius:6,fontWeight:600,fontSize:16}}>Thêm mới</button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{marginLeft:12,padding:'10px 24px',background:'#ccc',border:'none',borderRadius:6,fontWeight:600,fontSize:16}}>Hủy</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {showEditModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'flex-start',justifyContent:'center'}}>
          <div className="modal-edit-blog" style={{background:'#fff',borderRadius:12,maxWidth:800,width:'100%',marginTop:24,padding:32,boxShadow:'0 4px 32px rgba(0,0,0,0.12)',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{fontWeight:700,fontSize:24,marginBottom:24}}>Chỉnh sửa bài viết</div>
            <button onClick={handleCloseModal} style={{position:'absolute',top:18,right:24,fontSize:22,background:'none',border:'none',cursor:'pointer'}}>&times;</button>
            <form onSubmit={handleEditSave}>
              <div style={{display:'flex',flexDirection:'column',gap:18}}>
                <div>
                  <div style={{fontWeight:500,marginBottom:6}}>Tiêu đề bài viết</div>
                  <input name="title" value={editForm.title||''} onChange={handleFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16,background:'#fff',color:'#222'}} required />
                </div>
                <div>
                  <div style={{fontWeight:500,marginBottom:6}}>Link ảnh bìa</div>
                  <input name="coverImage" value={addForm.coverImage} onChange={handleAddFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16,background:'#fff',color:'#222'}} />
                </div>
                <div style={{display:'flex',gap:16}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500,marginBottom:6}}>Danh mục</div>
                    <select name="label" value={editForm.label||''} onChange={handleFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16,background:'#fff',color:'#222'}} required>
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                </div>
                <div>
                  <div style={{fontWeight:500,marginBottom:6}}>Nội dung bài viết</div>
                  <textarea name="content" value={editForm.content||''} onChange={handleFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16,minHeight:120,background:'#fff',color:'#222'}} required />
                </div>
                <div>
                  <button type="submit" style={{padding:'10px 24px',background:'#2196F3',color:'#fff',border:'none',borderRadius:6,fontWeight:600,fontSize:16}}>Lưu</button>
                  <button type="button" onClick={handleCloseModal} style={{marginLeft:12,padding:'10px 24px',background:'#ccc',border:'none',borderRadius:6,fontWeight:600,fontSize:16}}>Hủy</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
