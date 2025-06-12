import React from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm dòng này
import '../assets/CSS/Payment.css';

const packages = [
  { id: 1, name: 'Gói Cơ Bản', price: 0, features: ['Hỗ trợ cộng đồng', 'Xem bài viết'] },
  { id: 2, name: 'Gói Pro', price: 99000, features: ['Tất cả tính năng cơ bản', 'Ưu tiên hỗ trợ'] },
  { id: 3, name: 'Gói VIP', price: 199000, features: ['Tất cả tính năng Pro', 'Coach riêng 1-1'] },
];

function Payment() {
  const navigate = useNavigate(); // Thêm dòng này

  return (
    <div className="payment-container" style={{padding: '60px 0', textAlign: 'center'}}>
      <h1>Trang Nâng Cấp Tài Khoản</h1>
      
      <h2>Chọn gói nâng cấp thành viên</h2>
      <div className="package-list">
        {packages.map(pkg => (
          <div className="package-card" key={pkg.id}>
            <h3>{pkg.name}</h3>
            <p className="price">{pkg.price === 0 ? 'Miễn phí' : `${pkg.price.toLocaleString()}đ/tháng`}</p>
            <ul>
              {pkg.features.map(f => <li key={f}>{f}</li>)}
            </ul>
            <button className="buy-btn" onClick={() => navigate('/coach-dashboard')}>Chọn gói này</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Payment;
