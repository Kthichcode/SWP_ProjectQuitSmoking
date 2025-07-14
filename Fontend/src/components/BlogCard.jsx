import React from 'react';
import '../assets/CSS/Blog.css';

export default function BlogCard({ blog, onReadMore }) {
  const imgSrc = blog.image || blog.coverImage || '';
  return (
    <div className="blog-card">
      <div className="blog-card-image" style={{ backgroundImage: `url(${imgSrc})` }}></div>
      <div className="blog-card-content">
        <span className="blog-card-tag">{blog.tag || blog.categoryName}</span>
        <h3 className="blog-card-title">{blog.title}</h3>
        <p className="blog-card-summary">{blog.summary || blog.content?.slice(0, 100) + '...'}</p>
        <div className="blog-card-footer">
          <span className="blog-card-author">{blog.author || ''}</span>
          <span className="blog-card-date">{blog.date || ''}</span>
        </div>
        <button className="blog-card-readmore" onClick={() => onReadMore && onReadMore(blog)}>
          Đọc tiếp →
        </button>
      </div>
    </div>
  );
}
