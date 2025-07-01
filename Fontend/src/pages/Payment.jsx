import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/CSS/Payment.css';
import { AiFillHeart, AiFillStar, AiFillCrown, AiOutlineCheck } from 'react-icons/ai';
import axios from 'axios';

function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiPackages, setApiPackages] = useState([]);

  useEffect(() => {
    if (user === null) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    
    const fetchPackages = async () => {
      try {
        let config = {};
        if (user && user.token) {
          config.headers = { Authorization: `Bearer ${user.token}` };
        }
        const res = await axios.get('/api/membership-packages/getAll', config);
          let data = res.data.data;
        if (Array.isArray(data)) {
          setApiPackages(data);
        } else if (data && typeof data === 'object') {
          setApiPackages([data]);
        } else {
          setApiPackages([]);
        }
      } catch {
        setApiPackages([]);
      }
    };
    fetchPackages();
  }, [user]);

  const handleBuy = (id) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/checkout?package=${id}`);
    }
  };

  const displayPackages = apiPackages.map((pkg, idx) => ({
    id: pkg.id,
    name: pkg.name,
    price: Number(pkg.price),
    priceLabel: pkg.price === 0 ? 'Miễn phí' : `${Number(pkg.price).toLocaleString('vi-VN')}đ/tháng`,
    icon: idx === 0 ? <AiFillHeart size={38} color="#2e7d32" style={{background:'#fff',borderRadius:'50%',padding:6}} />
      : idx === 1 ? <AiFillStar size={38} color="#1976d2" style={{background:'#fff',borderRadius:'50%',padding:6}} />
      : <AiFillCrown size={38} color="#8e24aa" style={{background:'#fff',borderRadius:'50%',padding:6}} />,
    features: pkg.features && Array.isArray(pkg.features) ? pkg.features : [pkg.description || ''],
    btn: pkg.price === 0 ? 'Bắt đầu miễn phí' : 'Chọn gói này',
    btnClass: idx === 0 ? 'btn-free' : idx === 1 ? 'btn-popular' : 'btn-premium',
    highlight: idx === 1,
    borderColor: idx === 1 ? '#1976d2' : (idx === 2 ? '#8e24aa' : '#e0e0e0'),
    label: idx === 1 ? 'Phổ biến nhất' : undefined,
    desc: pkg.description || '',
  }));

  return (
    <div className="payment-bg">
      <div className="payment-container">
        <h2 className="payment-title">Hành trình cai nghiện thuốc lá cùng chúng tôi</h2>
        <div className="payment-sub">Chọn gói dịch vụ phù hợp để bắt đầu cuộc sống khỏe mạnh</div>
        <div className="package-list">
          {displayPackages.map((pkg, idx) => (
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
                {pkg.desc}
              </div>
              <ul className="package-features">
                {pkg.features.map((f, i) => (
                  <li key={f + i}><AiOutlineCheck color="#43a047" style={{marginRight:6}}/>{f}</li>
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
