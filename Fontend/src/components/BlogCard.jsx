import React from 'react';
import '../assets/CSS/Blog.css';

export default function BlogCard({ blog }) {
  return (
    <div className="blog-card">
      <img src={blog.image} alt={blog.title} className="blog-img" />
      <div className="blog-info">
        <span className="blog-tag">{blog.tag}</span>
        <h3 className="blog-title-card">{blog.title}</h3>
        <p className="blog-summary">{blog.summary}</p>
        <div className="blog-footer">
          <span className="blog-author">{blog.author}</span>
          <span className="blog-date">{blog.date}</span>
        </div>
        <a href="#" className="blog-readmore">Đọc tiếp →</a>
      </div>
    </div>
  );
}
