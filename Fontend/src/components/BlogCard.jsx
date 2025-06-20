import React from 'react';
import '../assets/CSS/Blog.css';

export default function BlogCard({ blog, onReadMore }) {
  const imgSrc = blog.image || blog.coverImage || '';
  return (
    <div className="blog-card">
      <img src={imgSrc} alt={blog.title} className="blog-img" />
      <div className="blog-info">
        <span className="blog-tag">{blog.tag || blog.categoryName}</span>
        <h3 className="blog-title-card">{blog.title}</h3>
        <p className="blog-summary">{blog.summary || blog.content?.slice(0, 100) + '...'}</p>
        <div className="blog-footer">
          <span className="blog-author">{blog.author || ''}</span>
          <span className="blog-date">{blog.date || ''}</span>
        </div>
        <button className="blog-readmore" onClick={() => onReadMore && onReadMore(blog)} style={{background:'none',border:'none',color:'#2e7dff',cursor:'pointer',padding:0}}>Đọc tiếp →</button>
      </div>
    </div>
  );
}
