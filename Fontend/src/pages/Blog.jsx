import React, { useState, useEffect } from 'react';
import '../assets/CSS/Blog.css';
import BlogCard from '../components/BlogCard';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Blog() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 9;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        axios.get('/api/blog/getAllBlog')
            .then(res => {
                // Chỉ lấy blog đã duyệt
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
    }, []);

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

    // Tính chỉ số blog để phân trang
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
    const totalPages = Math.ceil(blogs.length / blogsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Xử lý khi bấm Đọc tiếp
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
            <h2 className="blog-title">Blog chia sẻ kinh nghiệm</h2>
            <p className="blog-subtitle">Khám phá các bài viết, câu chuyện thành công và lời khuyên từ chuyên gia</p>

            <div className="blog-filter-bar">
                <input type="text" placeholder="Tìm kiếm bài viết..." className="blog-search" />
                <div className="blog-tags">
                    <button className="tag-btn active">Tất cả</button>
                    <button className="tag-btn">Kinh nghiệm</button>
                    <button className="tag-btn">Câu chuyện</button>
                    <button className="tag-btn">Nghiên cứu</button>
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
                    <BlogCard key={blog.id || blog._id} blog={blog} onReadMore={handleReadMore} />
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
