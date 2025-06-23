import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/CSS/Payment.css';
import { AiFillHeart, AiFillStar, AiFillCrown, AiOutlineCheck } from 'react-icons/ai';

const packages = [
  {
    id: 1,
    name: 'Cơ bản',
    price: 0,
    priceLabel: 'Miễn phí',
    icon: <AiFillHeart size={38} color="#2e7d32" style={{background:'#fff',borderRadius:'50%',padding:6}} />,
    features: [
      'Theo dõi tiến trình cơ bản',
      'Thống kê số ngày không hút thuốc',
      'Tính toán tiền tiết kiệm',
      'Nhật ký cá nhân',
      'Truy cập cộng đồng',
      'Hỗ trợ qua email',
    ],
    btn: 'Bắt đầu miễn phí',
    btnClass: 'btn-free',
    highlight: false,
    borderColor: '#e0e0e0',
  },
  {
    id: 2,
    name: 'Nâng cao',
    price: 199000,
    priceLabel: '199.000đ/tháng',
    icon: <AiFillStar size={38} color="#1976d2" style={{background:'#fff',borderRadius:'50%',padding:6}} />,
    features: [
      'Tất cả tính năng gói Cơ bản',
      'Kế hoạch cai nghiện cá nhân hóa',
      'Biểu đồ chi tiết về sức khỏe',
      'Nhắc nhở thông minh',
      'Hệ thống huy hiệu mở rộng',
      'Tư vấn qua chat (5 buổi/tháng)',
      'Báo cáo tiến trình hàng tuần',
    ],
    btn: 'Chọn gói này',
    btnClass: 'btn-popular',
    highlight: true,
    borderColor: '#1976d2',
    label: 'Phổ biến nhất',
  },
  {
    id: 3,
    name: 'Premium',
    price: 399000,
    priceLabel: '399.000đ/tháng',
    icon: <AiFillCrown size={38} color="#8e24aa" style={{background:'#fff',borderRadius:'50%',padding:6}} />,
    features: [
      'Tất cả tính năng gói Nâng cao',
      'Tư vấn 1-1 không giới hạn',
      'Video call với chuyên gia',
      'Kế hoạch dinh dưỡng cá nhân',
      'Theo dõi sức khỏe chi tiết',
      'Ưu tiên hỗ trợ 24/7',
      'Báo cáo chi tiết cho bác sĩ',
      'Nhóm hỗ trợ VIP',
    ],
    btn: 'Chọn gói này',
    btnClass: 'btn-premium',
    highlight: false,
    borderColor: '#8e24aa',
  },
];

function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user === null) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handleBuy = (id) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/checkout?package=${id}`);
    }
  };

  return (
    <div className="payment-bg">
      <div className="payment-container">
        <h2 className="payment-title">Hành trình cai nghiện thuốc lá cùng chúng tôi</h2>
        <div className="payment-sub">Chọn gói dịch vụ phù hợp để bắt đầu cuộc sống khỏe mạnh</div>
        <div className="package-list">
          {packages.map((pkg, idx) => (
            <div
              className={`package-card-v2${pkg.highlight ? ' package-popular' : ''}`}
              key={pkg.id}
              style={{borderColor: pkg.highlight ? '#1976d2' : pkg.borderColor}}
            >
              {pkg.label && <div className="package-label">{pkg.label}</div>}
              <div className="package-icon">{pkg.icon}</div>
              <h3 className="package-name">{pkg.name}</h3>
              <div className="package-price">
                <span className="package-price-main">{pkg.priceLabel}</span>
              </div>
              <div className="package-desc">
                {pkg.id === 1 && 'Bắt đầu hành trình cai thuốc lá'}
                {pkg.id === 2 && 'Hỗ trợ chuyên sâu và cá nhân hóa'}
                {pkg.id === 3 && 'Trải nghiệm hoàn hảo với hỗ trợ 24/7'}
              </div>
              <ul className="package-features">
                {pkg.features.map(f => (
                  <li key={f}><AiOutlineCheck color="#43a047" style={{marginRight:6}}/>{f}</li>
                ))}
              </ul>
              <button className={`buy-btn-v2 ${pkg.btnClass}`} onClick={()=>handleBuy(pkg.id)}>{pkg.btn}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Payment;
