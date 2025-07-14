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
    axios.get(`/api/blog/getBlogById/${id}`, {
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
      .catch(err => {
        console.error('BlogDetail - API error:', err);
        setError('Không tìm thấy bài viết hoặc có lỗi xảy ra.');
      })
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  if (loading) return <div className="blog-detail-container">Đang tải...</div>;
  if (error) return <div className="blog-detail-container" style={{color:'red'}}>{error}</div>;
  if (!blog) return null;

  return (
    <div className="blog-detail-wrapper">
      <div className="blog-detail-container">
        <div className="blog-detail-header">
          <button 
            className="blog-back-btn" 
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>
          <div className="blog-detail-category">
            <span className="category-tag">{blog.categoryName}</span>
          </div>
        </div>
        
        <h1 className="blog-detail-title">{blog.title}</h1>
        
        <div className="blog-detail-meta">
          {blog.author && (
            <div className="meta-item">
              <span className="meta-label">✍️ Tác giả:</span>
              <span className="meta-value">{blog.author}</span>
            </div>
          )}
        </div>

        {blog.coverImage && (
          <div className="blog-detail-image-wrapper">
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              className="blog-detail-img" 
            />
          </div>
        )}
        
        <div className="blog-detail-content">
          <div className="content-wrapper">
            {blog.content && (
              blog.content.includes('\n')
                ? blog.content.split(/\r?\n/).map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))
                : blog.content
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
