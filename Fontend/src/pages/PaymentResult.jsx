import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../../../axiosInstance';
import '../assets/CSS/PaymentResult.css';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineHome } from 'react-icons/ai';

function PaymentResult() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [paymentInfo, setPaymentInfo] = useState({});

  useEffect(() => {
    // Lấy thông tin từ URL params
    const responseCode = searchParams.get('vnp_ResponseCode');
    const transactionId = searchParams.get('vnp_TxnRef');
    const amount = searchParams.get('vnp_Amount');
    const orderInfo = searchParams.get('vnp_OrderInfo');
    const payDate = searchParams.get('vnp_PayDate');

    setPaymentInfo({
      responseCode,
      transactionId,
      amount: amount ? parseInt(amount) / 100 : 0, // VNPay trả về amount * 100
      orderInfo,
      payDate
    });

    // Xác định trạng thái thanh toán
    if (responseCode === '00') {
      setPaymentStatus('success');
      // TODO: Gọi API để cập nhật membership cho user
    } else {
      setPaymentStatus('failed');
    }
    const verifyPayment = async () => {
    if (responseCode && transactionId) {
      try {
        const response = await axiosInstance.get('/api/payment/check-callback', {
          params: {
            vnp_TxnRef: transactionId,
            vnp_ResponseCode: responseCode
          }
        });
        console.log('Backend verification:', response.data);
      } catch (error) {
        console.error('Error verifying payment:', error);
      }
    }
  };
  
  verifyPayment();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoToProfile = () => {
    navigate('/profile', { replace: true });
  };

  const handleChooseCoach = () => {
    navigate('/coach-payment', { replace: true });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Format: yyyyMMddHHmmss -> dd/MM/yyyy HH:mm:ss
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    const second = dateString.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  return (
    <div className="payment-result-bg">
      <div className="payment-result-container">
        <div className="payment-result-card">
          {paymentStatus === 'success' ? (
            <>
              <div className="payment-result-icon success">
                <AiOutlineCheckCircle size={80} />
              </div>
              <h2 className="payment-result-title success">Thanh toán thành công! 🎉</h2>
              <p className="payment-result-message">
                Chúc mừng! Bạn đã nâng cấp gói thành viên thành công.<br/>
                <strong>Bước tiếp theo: Chọn Coach chuyên nghiệp để bắt đầu hành trình cai thuốc!</strong>
              </p>
            </>
          ) : paymentStatus === 'failed' ? (
            <>
              <div className="payment-result-icon failed">
                <AiOutlineCloseCircle size={80} />
              </div>
              <h2 className="payment-result-title failed">Thanh toán thất bại!</h2>
              <p className="payment-result-message">
                Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.
              </p>
            </>
          ) : (
            <>
              <div className="payment-result-icon processing">
                <div className="spinner"></div>
              </div>
              <h2 className="payment-result-title">Đang xử lý...</h2>
              <p className="payment-result-message">
                Vui lòng chờ trong giây lát
              </p>
            </>
          )}

          {paymentInfo.transactionId && (
            <div className="payment-details">
              <h3>Chi tiết giao dịch</h3>
              <div className="detail-row">
                <span className="detail-label">Mã giao dịch:</span>
                <span className="detail-value">{paymentInfo.transactionId}</span>
              </div>
              {paymentInfo.amount > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Số tiền:</span>
                  <span className="detail-value">{formatAmount(paymentInfo.amount)}</span>
                </div>
              )}
              {paymentInfo.orderInfo && (
                <div className="detail-row">
                  <span className="detail-label">Thông tin đơn hàng:</span>
                  <span className="detail-value">{paymentInfo.orderInfo}</span>
                </div>
              )}
              {paymentInfo.payDate && (
                <div className="detail-row">
                  <span className="detail-label">Thời gian:</span>
                  <span className="detail-value">{formatDate(paymentInfo.payDate)}</span>
                </div>
              )}
            </div>
          )}

          <div className="payment-result-actions">
            {paymentStatus === 'success' ? (
              <>
                <button className="btn-choose-coach" onClick={handleChooseCoach}>
                  🏆 Chọn Coach
                </button>
                <button className="btn-profile" onClick={handleGoToProfile}>
                  Xem hồ sơ
                </button>
                <button className="btn-home secondary" onClick={handleGoHome}>
                  <AiOutlineHome size={20} />
                  Về trang chủ
                </button>
              </>
            ) : (
              <button className="btn-home" onClick={handleGoHome}>
                <AiOutlineHome size={20} />
                Về trang chủ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentResult;
