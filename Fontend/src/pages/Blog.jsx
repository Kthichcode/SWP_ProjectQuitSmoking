import React, { useState, useEffect } from 'react';
import '../assets/CSS/Blog.css';
import BlogCard from '../components/BlogCard';
import axiosInstance from '../../axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Blog() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 9;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    // ...existing code...

    useEffect(() => {
        setLoading(true);
        if (selectedCategoryId) {
            axiosInstance.get(`/api/blog/getBlogByCategoryId/${selectedCategoryId}`)
                .then(res => {
                    const approvedBlogs = (res.data.data || []).filter(blog => blog.status === 'APPROVED');
                    setBlogs(approvedBlogs);
                    setError('');
                })
                .catch(err => {
                    setError('Không thể tải blog. Vui lòng thử lại.');
                    setBlogs([]);
                    console.error('Lỗi lấy danh sách blog:', err);
                })
                .finally(() => setLoading(false));
        } else {
            axiosInstance.get('/api/blog/getAllBlog')
                .then(res => {
                    const approvedBlogs = (res.data.data || []).filter(blog => blog.status === 'APPROVED');
                    setBlogs(approvedBlogs);
                    setError('');
                })
                .catch(err => {
                    setError('Không thể tải blog. Vui lòng thử lại.');
                    setBlogs([]);
                    console.error('Lỗi lấy danh sách blog:', err);
                })
                .finally(() => setLoading(false));
        }
        // Lấy thể loại blog từ API
        axiosInstance.get('/api/blog-categories/getAll')
            .then(res => {
                setCategories(res.data.data || []);
            })
            .catch(err => {
                console.error('Lỗi lấy thể loại blog:', err);
                setCategories([]);
            });
    }, [selectedCategoryId]);

    useEffect(() => {
        const handlePageShow = (event) => {
            if (event.persisted || performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
                window.location.reload();
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

 
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
    const totalPages = Math.ceil(blogs.length / blogsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    
    // ...đã xóa kiểm tra membership...

    const handleReadMore = (blog) => {
        const blogId = blog.id || blog._id;
        if (!token) {
            navigate('/login');
        } else if (blogId) {
            navigate(`/blog/${blogId}`);
        }
    };

    return (
        <div className="blog-container">
            {/* Đã xóa thông báo yêu cầu membership */}
            <h2 className="blog-title">Blog chia sẻ kinh nghiệm</h2>
            <p className="blog-subtitle">Khám phá các bài viết, câu chuyện thành công và lời khuyên từ chuyên gia</p>

            <div className="blog-filter-bar">
                
                <div className="blog-tags">
                    <button className={`tag-btn${!selectedCategoryId ? ' active' : ''}`} onClick={() => setSelectedCategoryId(null)}>Tất cả</button>
                    {categories.map(cat => (
                        <button
                          key={cat.id}
                          className={`tag-btn${selectedCategoryId === cat.id ? ' active' : ''}`}
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            setCurrentPage(1); // Reset về trang đầu tiên khi đổi danh mục
                          }}
                        >
                          {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div style={{color:'red',margin:'16px 0'}}>{error}</div>}

            <div className="blog-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                margin: '24px 0'
            }}>
                {loading ? <p>Đang tải...</p> : currentBlogs.map(blog => (
                    <div className="blog-card" key={blog.id || blog._id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div
                            className="blog-card-image"
                            style={{
                                backgroundImage: `url(${blog.coverImage || blog.image || '/default-image.jpg'})`,
                                cursor: 'pointer'
                            }}
                            onClick={() => handleReadMore(blog)}
                            title="Xem chi tiết bài viết"
                        ></div>
                        
                        <div className="blog-card-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{
                                alignSelf: 'flex-start',
                                background: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                borderRadius: 12,
                                padding: '3px 12px',
                                marginBottom: 8,
                                letterSpacing: 0.2,
                                boxShadow: '0 1px 4px rgba(25, 118, 210, 0.07)'
                            }}>
                                {blog.categoryName || blog.category?.name || 'Không rõ danh mục'}
                            </div>
                            <h4
                                className="blog-card-title"
                                style={{ cursor: 'pointer', marginBottom: 6, transition: 'text-decoration 0.15s' }}
                                onClick={() => handleReadMore(blog)}
                                title="Xem chi tiết bài viết"
                                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                            >
                                {blog.title || 'Không có tiêu đề'}
                            </h4>
                            <p className="blog-card-summary" style={{ marginBottom: 'auto' }}>
                                {(() => {
                                    const content = blog.content || '';
                                    if (!content) return 'Không có nội dung.';
                                    if (content.length <= 100) return content;
                                    let preview = content.slice(0, 100);
                                    const lastSpace = preview.lastIndexOf(' ');
                                    if (lastSpace > 0) preview = preview.slice(0, lastSpace);
                                    return preview + '...';
                                })()}
                            </p>
                            <span
                                className="blog-card-readmore"
                                onClick={() => handleReadMore(blog)}
                                style={{ alignSelf: 'flex-end', marginTop: 16, cursor: 'pointer' }}
                            >
                                Đọc tiếp →
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="blog-pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    « Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        className={currentPage === i + 1 ? 'active' : ''}
                        onClick={() => handlePageChange(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}

                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Tiếp »
                </button>
            </div>
        </div>
    );
}
