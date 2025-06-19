import React, { useState } from "react";
import "./CoachBlog.css";
import { FaEye, FaHeart, FaCommentDots, FaEdit, FaTrash, FaShareAlt, FaPlus } from "react-icons/fa";

const blogData = [
  {
    id: 1,
    title: "10 Bước Cai Thuốc Lá Hiệu Quả Cho Người Mới Bắt Đầu",
    desc: "Hướng dẫn chi tiết từng bước để bắt đầu hành trình cai thuốc lá một cách khoa học và bền vững...",
    date: "15/1/2024",
    views: 1250,
    likes: 89,
    comments: 23,
    tags: ["cai thuốc lá", "sức khỏe", "hướng dẫn"],
    label: "Hướng dẫn",
    readTime: "8 phút đọc",
    status: "published"
  },
  {
    id: 2,
    title: "Tác Hại Của Thuốc Lá Đối Với Hệ Hô Hấp",
    desc: "Phân tích chi tiết về những tác hại nghiêm trọng của thuốc lá lên hệ hô hấp và cách phục hồi...",
    date: "12/1/2024",
    views: 890,
    likes: 67,
    comments: 15,
    tags: ["tác hại thuốc lá", "hô hấp", "y học"],
    label: "Sức khỏe",
    readTime: "6 phút đọc",
    status: "published"
  },
  {
    id: 3,
    title: "Câu Chuyện Thành Công: Từ 2 Bao Thuốc/Ngày Đến Cuộc Sống Khỏe Mạnh",
    desc: "Chia sẻ câu chuyện thực tế của khách hàng đã thành công cai thuốc lá sau 15 năm nghiện...",
    date: "10/1/2024",
    views: 0,
    likes: 0,
    comments: 0,
    tags: ["thành công", "cảm hứng", "khách hàng"],
    label: "Câu chuyện",
    readTime: "5 phút đọc",
    status: "draft"
  },
  {
    id: 4,
    title: "Thực Phẩm Hỗ Trợ Quá Trình Cai Thuốc Lá",
    desc: "Danh sách các thực phẩm giúp giảm cơn thèm nicotine và hỗ trợ cơ thể phục hồi nhanh chóng...",
    date: "8/1/2024",
    views: 675,
    likes: 45,
    comments: 12,
    tags: ["thực phẩm", "dinh dưỡng", "phục hồi"],
    label: "Dinh dưỡng",
    readTime: "4 phút đọc",
    status: "published"
  }
];

const stats = [
  { label: "Tổng bài viết", value: 3, icon: <FaEdit />, color: "" },
  { label: "Tổng lượt xem", value: "2,815", icon: <FaEye />, color: "green" },
  { label: "Tổng lượt thích", value: 201, icon: <FaHeart />, color: "red" },
  { label: "Tổng bình luận", value: 50, icon: <FaCommentDots />, color: "purple" }
];

const filterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "published", label: "Đã xuất bản" },
  { value: "draft", label: "Bản nháp" }
];

export default function CoachBlog() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editBlog, setEditBlog] = useState(null); // blog đang chỉnh sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  const filteredBlogs = blogData.filter(blog => {
    const matchSearch = blog.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true : (filter === blog.status);
    return matchSearch && matchFilter;
  });

  // Xử lý mở modal chỉnh sửa
  const handleEdit = (blog) => {
    setEditBlog(blog);
    setEditForm({
      title: blog.title,
      desc: blog.desc,
      label: blog.label,
      tags: blog.tags.join(", "),
      content: blog.content || "",
    });
    setShowEditModal(true);
  };

  // Xử lý đóng modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditBlog(null);
  };

  // Xử lý thay đổi form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý xóa bài
  const handleDelete = (blog) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài này không?")) {
      // Xử lý xóa ở đây (hiện tại chỉ alert, bạn có thể thêm logic xóa thực tế)
      alert("Đã xóa bài: " + blog.title);
    }
  };

  return (
    <div className="coach-blog-container">
      <div className="coach-blog-header">Quản lý Blog</div>
      <div className="coach-blog-desc">Viết và quản lý các bài blog của bạn</div>
      <div className="coach-blog-stats">
        {stats.map((stat, idx) => (
          <div className="coach-blog-stat-card" key={idx}>
            <div className="coach-blog-stat-label">{stat.label}</div>
            <div className={`coach-blog-stat-value ${stat.color}`}>{stat.value} {stat.icon}</div>
          </div>
        ))}
      </div>
      <div className="coach-blog-actions">
        <button className="coach-blog-btn-new">
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
        {filteredBlogs.map(blog => (
          <div className="coach-blog-card" key={blog.id}>
            <div className={`coach-blog-badge${blog.status === "draft" ? " draft" : ""}`}>
              {blog.status === "draft" ? "Bản nháp" : "Đã xuất bản"}
            </div>
            <div className="coach-blog-title">{blog.title}</div>
            <div className="coach-blog-desc2">{blog.desc}</div>
            <div className="coach-blog-meta">
              <span><span className="icon"><FaEdit /></span>{blog.date}</span>
              <span><span className="icon"><FaEye /></span>{blog.views}</span>
              <span><span className="icon"><FaHeart /></span>{blog.likes}</span>
              <span><span className="icon"><FaCommentDots /></span>{blog.comments}</span>
            </div>
            <div className="coach-blog-tags">
              {blog.tags.map((tag, i) => (
                <span className="coach-blog-tag" key={i}>{tag}</span>
              ))}
            </div>
            <span className="coach-blog-label">{blog.label}</span>
            <div className="coach-blog-footer">
              <span className="coach-blog-readtime">{blog.readTime}</span>
              <div className="coach-blog-actions-card">
                <button className="coach-blog-btn-icon" title="Chỉnh sửa" onClick={() => handleEdit(blog)}><FaEdit /></button>
                <button className="coach-blog-btn-icon" title="Xóa" onClick={() => handleDelete(blog)}><FaTrash /></button>
                <button className="coach-blog-btn-icon" title="Chia sẻ"><FaShareAlt /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal chỉnh sửa */}
      {showEditModal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'flex-start',justifyContent:'center'}}>
          <div className="modal-edit-blog" style={{background:'#fff',borderRadius:12,maxWidth:800,width:'100%',marginTop:24,padding:32,boxShadow:'0 4px 32px rgba(0,0,0,0.12)',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{fontWeight:700,fontSize:24,marginBottom:24}}>Chỉnh sửa bài viết</div>
            <button onClick={handleCloseModal} style={{position:'absolute',top:18,right:24,fontSize:22,background:'none',border:'none',cursor:'pointer'}}>&times;</button>
            <div style={{display:'flex',flexDirection:'column',gap:18}}>
              <div>
                <div style={{fontWeight:500,marginBottom:6}}>Tiêu đề bài viết</div>
                <input name="title" value={editForm.title||''} onChange={handleFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16}} />
              </div>
              <div>
                <div style={{fontWeight:500,marginBottom:6}}>Mô tả ngắn</div>
                <textarea name="desc" value={editForm.desc||''} onChange={handleFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16,minHeight:60}} />
              </div>
              <div style={{display:'flex',gap:16}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:500,marginBottom:6}}>Danh mục</div>
                  <input name="label" value={editForm.label||''} onChange={handleFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16}} />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:500,marginBottom:6}}>Tags (phân cách bằng dấu phẩy)</div>
                  <input name="tags" value={editForm.tags||''} onChange={handleFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16}} />
                </div>
              </div>
              <div>
                <div style={{fontWeight:500,marginBottom:6}}>Nội dung bài viết</div>
                <textarea name="content" value={editForm.content||''} onChange={handleFormChange} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e5e7eb',fontSize:16,minHeight:120}} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
