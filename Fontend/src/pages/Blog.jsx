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
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 9;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [showMembershipMessage, setShowMembershipMessage] = useState(false);

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        if (selectedCategoryId) {
            axios.get(`http://localhost:5175/api/blog/getBlogByCategoryId/${selectedCategoryId}`, { headers })
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
            axios.get('/api/blog/getAllBlog', { headers })
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
        axios.get('http://localhost:5175/api/blog-categories/getAll', { headers })
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

    
    // Kiểm tra membership từ localStorage
    const hasMembership = () => {
        const membership = localStorage.getItem('currentMembership');
        if (!membership) return false;
        try {
            const m = JSON.parse(membership);
            return m && m.status === 'ACTIVE';
        } catch {
            return false;
        }
    };

    const handleReadMore = (blog, membership) => {
        const blogId = blog.id || blog._id;
        if (!token) {
            navigate('/login');
        } else if (!hasMembership()) {
            setShowMembershipMessage(true);
            setTimeout(() => setShowMembershipMessage(false), 3000);
        } else if (blogId) {
            navigate(`/blog/${blogId}`);
        }
    };

    return (
        <div className="blog-container">
            {showMembershipMessage && (
                <div style={{position:'fixed',bottom:32,right:32,zIndex:9999,background:'#fffbe6',color:'#d35400',padding:'16px 28px',borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,0.12)',fontWeight:600}}>
                    Bạn cần đăng ký gói thành viên để có thể sử dụng chức năng này
                </div>
            )}
            <h2 className="blog-title">Blog chia sẻ kinh nghiệm</h2>
            <p className="blog-subtitle">Khám phá các bài viết, câu chuyện thành công và lời khuyên từ chuyên gia</p>

            <div className="blog-filter-bar">
                <input type="text" placeholder="Tìm kiếm bài viết..." className="blog-search" />
                <div className="blog-tags">
                    <button className={`tag-btn${!selectedCategoryId ? ' active' : ''}`} onClick={() => setSelectedCategoryId(null)}>Tất cả</button>
                    {categories.map(cat => (
                        <button key={cat.id} className={`tag-btn${selectedCategoryId === cat.id ? ' active' : ''}`} onClick={() => setSelectedCategoryId(cat.id)}>{cat.name}</button>
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
                    <BlogCard key={blog.id || blog._id} blog={blog} onReadMore={handleReadMore} hasMembership={hasMembership()} />
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
