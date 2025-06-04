import React, { useState } from 'react';
import '../assets/CSS/Blog.css';
import BlogCard from '../components/BlogCard';

const dummyBlogs = [
    {
        id: 1,
        title: '10 lợi ích sau khi bỏ thuốc lá trong 30 ngày đầu tiên',
        summary: 'Khám phá những thay đổi tích cực mà cơ thể bạn trải qua ngay khi dừng hút thuốc lá.',
        tag: 'Câu chuyện',
        author: 'BS. Trịnh Văn Hiền',
        date: '13/03/2025',
        image: '/src/assets/images/blog1.jpg',
    },
    {
        id: 2,
        title: '5 bước vượt qua cơn thèm thuốc hiệu quả',
        summary: 'Cơn thèm thuốc là thử thách lớn, nhưng bạn có thể vượt qua nó với các bước đơn giản.',
        tag: 'Kinh nghiệm',
        author: 'Coach Thanh Phong',
        date: '20/03/2025',
        image: '/src/assets/images/blog2.jpg',
    },
    {
        id: 3,
        title: 'Sự hỗ trợ của gia đình khi bạn cai thuốc',
        summary: 'Vai trò của gia đình rất quan trọng trong quá trình bỏ thuốc lá.',
        tag: 'Câu chuyện',
        author: 'Mai Hương',
        date: '22/03/2025',
        image: '/src/assets/images/blog3.jpg',
    },
    {
        id: 4,
        title: 'Dinh dưỡng phù hợp khi cai thuốc lá',
        summary: 'Chế độ ăn uống ảnh hưởng lớn đến tâm trạng và khả năng cai thuốc.',
        tag: 'Kinh nghiệm',
        author: 'Dược sĩ Khánh Linh',
        date: '25/03/2025',
        image: '/src/assets/images/blog4.jpg',
    },
    {
        id: 5,
        title: 'Những sai lầm thường gặp khi bỏ thuốc',
        summary: 'Tránh những sai lầm phổ biến giúp bạn duy trì việc cai thuốc lâu dài.',
        tag: 'Nghiên cứu',
        author: 'TS. Trần Mạnh',
        date: '27/03/2025',
        image: '/src/assets/images/blog5.jpg',
    },
    {
        id: 6,
        title: 'Ứng dụng hỗ trợ hành trình không khói thuốc',
        summary: 'Các app như NoSmoke mang lại động lực và theo dõi tiến trình dễ dàng.',
        tag: 'Nghiên cứu',
        author: 'Admin NoSmoke',
        date: '01/04/2025',
        image: '/src/assets/images/blog6.jpg',
    },
];

export default function Blog() {
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 3;

    // Tính chỉ số blog để phân trang
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = dummyBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

    const totalPages = Math.ceil(dummyBlogs.length / blogsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
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

            <div className="blog-grid">
                {currentBlogs.map(blog => (
                    <BlogCard key={blog.id} blog={blog} />
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
