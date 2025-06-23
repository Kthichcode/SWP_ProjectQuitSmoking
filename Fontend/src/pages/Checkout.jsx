import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Checkout.css';
import { AiFillCheckCircle, AiOutlineCheck, AiOutlineArrowLeft } from 'react-icons/ai';
import vnpayLogo from '../assets/img/vnpay.svg';

const PACKAGE_MAP = {
  1: {
    name: 'Cơ bản',
    price: 0,
    priceLabel: 'Miễn phí',
    desc: 'Bắt đầu hành trình cai thuốc lá',
    features: [
      'Theo dõi tiến trình cơ bản',
      'Thống kê số ngày không hút thuốc',
      'Tính toán tiền tiết kiệm',
      'Nhật ký cá nhân',
      'Truy cập cộng đồng',
      'Hỗ trợ qua email',
    ],
  },
  2: {
    name: 'Nâng cao',
    price: 199000,
    priceLabel: '199.000đ/tháng',
    desc: 'Hỗ trợ chuyên sâu và cá nhân hóa',
    features: [
      'Tất cả tính năng gói Cơ bản',
      'Kế hoạch cai nghiện cá nhân hóa',
      'Biểu đồ chi tiết về sức khỏe',
      'Nhắc nhở thông minh',
      'Hệ thống huy hiệu mở rộng',
      'Tư vấn qua chat (5 buổi/tháng)',
      'Báo cáo tiến trình hàng tuần',
    ],
  },
  3: {
    name: 'Premium',
    price: 399000,
    priceLabel: '399.000đ/tháng',
    desc: 'Trải nghiệm hoàn hảo với hỗ trợ 24/7',
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
  },
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Checkout() {
  const query = useQuery();
  const navigate = useNavigate();
  const pkgId = query.get('package');
  const pkg = PACKAGE_MAP[pkgId] || PACKAGE_MAP[1];
  const [payment, setPayment] = React.useState('bank');
  const [success, setSuccess] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  const handleBack = () => navigate(-1);
  const handlePayment = e => {
    e.preventDefault();
    setShowModal(true);
  };
  const handleContinue = () => {
    setShowModal(false);
    navigate('/coach-payment');
  };

  return (
    <div className="checkout-bg-v2">
      <div className="checkout-main-v2">
        <div className="checkout-left-v2">
          <button className="checkout-back-btn" onClick={handleBack}><AiOutlineArrowLeft /> Quay lại</button>
          <h2 className="checkout-title-v2">Thanh toán đơn hàng</h2>
          <div className="checkout-order-card">
            <div className={`checkout-package-tag checkout-tag-${pkgId}`}>{pkg.name}</div>
            <div className="checkout-order-name">{pkg.name}</div>
            <div className="checkout-order-desc">{pkg.desc}</div>
            <div className="checkout-feature-list">
              <div className="checkout-feature-title">Tính năng được bao gồm:</div>
              <ul>
                {pkg.features.map(f => (
                  <li key={f}><AiOutlineCheck color="#43a047" style={{marginRight:6}}/>{f}</li>
                ))}
              </ul>
            </div>
            <div className="checkout-order-total">
              Tổng thanh toán: <span>{pkg.priceLabel}</span>
            </div>
            <div className="checkout-safe-box">
              <div className="checkout-safe-title">Thanh toán an toàn 100%</div>
              <div className="checkout-safe-desc">Thông tin được mã hóa SSL</div>
            </div>
            <div className="checkout-active-box">
              <div className="checkout-active-title">Kích hoạt tức thì</div>
              <div className="checkout-active-desc">Dịch vụ hoạt động sau 5-10 phút</div>
            </div>
          </div>
        </div>
        <div className="checkout-right-v2">
          <form className="checkout-method-form" onSubmit={handlePayment}>
            <div className="checkout-method-title">Chọn phương thức thanh toán</div>
            <div className="checkout-method-tabs">
              <button type="button" className={payment==='bank'? 'active' : ''} onClick={()=>setPayment('bank')}>Ngân hàng</button>
              <button type="button" className={payment==='momo'? 'active' : ''} onClick={()=>setPayment('momo')}>MoMo</button>
              <button type="button" className={payment==='vnpay'? 'active' : ''} onClick={()=>setPayment('vnpay')}>VNPay</button>
            </div>
            {payment==='bank' && (
              <div className="checkout-bank-box">
                <div className="checkout-bank-title">Chuyển khoản ngân hàng</div>
                <div className="checkout-bank-info">
                  <div><b>Ngân hàng:</b> <span>Vietcombank</span></div>
                  <div><b>Số tài khoản:</b> <span className="checkout-copy"></span></div>
                  <div><b>Chủ tài khoản:</b> <span>Nosmoke Admin</span></div>
                  <div><b>Nội dung chuyển khoản:</b> <span className="checkout-copy">Tên người dùng + {pkg.name}</span></div>
                </div>
                <div className="checkout-bank-note">* Nhập đúng nội dung để được xử lý tự động</div>
                <div className="checkout-qr-box">
                  <div className="checkout-qr-label">QR Code Vietcombank</div>
                  <div className="checkout-qr-img">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=VCB%20QuitBuddy%20${encodeURIComponent(pkg.name)}`} alt="QR Code Vietcombank" />
                  </div>
                  <div className="checkout-qr-desc">Quét QR để thanh toán tự động</div>
                </div>
              </div>
            )}
            {payment==='momo' && (
              <div className="checkout-bank-box momo-box">
                <div className="checkout-bank-title momo-title">
                  <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" style={{height:24,verticalAlign:'middle',marginRight:8}} />
                  Ví MoMo
                </div>
                <div className="checkout-bank-info">
                  <div><b>Số điện thoại:</b> <span className="checkout-copy"></span></div>  
                  <div><b>Tên tài khoản:</b> <span>NoSmoke Admin</span></div>
                  <div><b>Nội dung chuyển khoản:</b> <span className="checkout-copy">Tên người dùng + {pkg.name}</span></div>
                </div>
                <div className="checkout-bank-note momo-note">* Nhập đúng nội dung để được xử lý tự động</div>
                <div className="checkout-qr-box momo-qr">
                  <div className="checkout-qr-label momo-qr-label">
                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" style={{height:20,verticalAlign:'middle',marginRight:6}} />
                    QR Code MoMo
                  </div>
                  <div className="checkout-qr-img momo-qr-img">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=MoMo%20QuitBuddy%20${encodeURIComponent(pkg.name)}`} alt="QR Code MoMo" />
                  </div>
                  <div className="checkout-qr-desc momo-qr-desc">Quét QR MoMo để thanh toán nhanh</div>
                </div>
              </div>
            )}
            {payment==='vnpay' && (
              <div className="checkout-bank-box">
                <div className="checkout-bank-title">
                  <img src={vnpayLogo} alt="VNPay" style={{height:24,verticalAlign:'middle',marginRight:8}} />
                  
                </div>
                <div className="checkout-bank-info">
                  <div><b>Mã QR thanh toán:</b></div>
                  <div className="checkout-qr-box">
                    <div className="checkout-qr-label">
                      <img src={vnpayLogo} alt="VNPay" style={{height:20,verticalAlign:'middle',marginRight:6}} />
                      QR Code
                    </div>
                    <div className="checkout-qr-img">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=VNPay%20QuitBuddy%20${encodeURIComponent(pkg.name)}`} alt="QR Code" />
                    </div>
                    <div className="checkout-qr-desc">Quét QR để thanh toán nhanh</div>
                  </div>
                </div>
              </div>
            )}
            <button className="checkout-btn-v2" type="submit">Xác nhận đã thanh toán</button>
          </form>
          <div className="checkout-guide-box">
            <div className="checkout-guide-title">Hướng dẫn thanh toán</div>
            <ul>
              <li>Chuyển khoản đúng số tiền: <b>{pkg.priceLabel}</b></li>
              <li>Nội dung chuyển khoản: <b>Tên người dùng + {pkg.name}</b></li>
              <li>Kích hoạt 5-10 phút sau khi thanh toán</li>
              <li>Hỗ trợ 24/7: <b>1900-XXX-XXX</b></li>
              <li>Email: <b>support@quitbuddy.vn</b></li>
            </ul>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="checkout-modal-bg">
          <div className="checkout-modal-box">
            <div className="checkout-modal-title">Bạn đã hoàn thành giao dịch</div>
            <div className="checkout-modal-desc">Chào mừng bạn đến với <b>NoSmoke</b></div>
            <button className="checkout-modal-btn" onClick={handleContinue}>Tiếp tục</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
