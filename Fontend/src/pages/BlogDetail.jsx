import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/CSS/Blog.css';
import { useAuth } from '../contexts/AuthContext';

export default function BlogDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    console.log('BlogDetail - id:', id); 
    axios.get(`/api/blog/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        console.log('BlogDetail - API response:', res.data);
        if (!res.data || !res.data.data) {
          setError('Không tìm thấy bài viết hoặc có lỗi xảy ra.');
          setBlog(null);
        } else {
          setBlog(res.data.data);
          setError('');
        }
      })
      .catch(() => setError('Không tìm thấy bài viết hoặc có lỗi xảy ra.'))
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  if (loading) return <div className="blog-detail-container">Đang tải...</div>;
  if (error) return <div className="blog-detail-container" style={{color:'red'}}>{error}</div>;
  if (!blog) return null;

  return (
    <div className="blog-detail-container">
      <h2 className="blog-detail-title">{blog.title}</h2>
      {blog.coverImage && <img src={blog.coverImage} alt={blog.title} className="blog-detail-img" />}
      <div className="blog-detail-meta">
        <span>Danh mục: {blog.categoryName}</span> | <span>Ngày đăng: {blog.date || ''}</span>
      </div>
      <div className="blog-detail-content">
        {blog.content}
      </div>
    </div>
  );
}
