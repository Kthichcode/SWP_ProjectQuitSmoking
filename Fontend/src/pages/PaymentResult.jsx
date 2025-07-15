import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../../axiosInstance';
import { processPaymentCallback } from '../services/membershipService';
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
    let responseCode = searchParams.get('vnp_ResponseCode');
    // Đảm bảo luôn là chuỗi
    if (typeof responseCode !== 'string') responseCode = String(responseCode);
    if (responseCode === undefined || responseCode === null) responseCode = '';
    console.log('[PaymentResult] responseCode:', responseCode, typeof responseCode);
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

    // Sử dụng BroadcastChannel để đồng bộ trạng thái xử lý transactionId giữa các tab
    const channel = new window.BroadcastChannel('payment_transaction_channel');
    let isProcessing = false;

    const processedKey = transactionId ? `payment_processed_${transactionId}` : '';

    // Biến bảo vệ trạng thái đã thành công
    let paymentSuccessLocked = false;
    const verifyAndCreateMembership = async () => {
      // Xử lý trường hợp nghi ngờ (07)
      if (responseCode === '07') {
        setPaymentStatus('pending');
        console.log('Giao dịch nghi ngờ, cần xác thực lại với ngân hàng.');
        return;
      }
      if (responseCode === '00') {
        // Kiểm tra transactionId đã xử lý chưa
        const alreadyProcessed = localStorage.getItem(processedKey);
        if (alreadyProcessed) {
          if (!paymentSuccessLocked && paymentStatus !== 'success') {
            setPaymentStatus('success');
            paymentSuccessLocked = true;
          }
          console.log('Transaction already processed, skipping callback:', transactionId);
          return;
        }
        if (isProcessing) {
          // Đã có tab khác xử lý
          return;
        }
        isProcessing = true;
        channel.postMessage({ type: 'processing', transactionId });
        try {
          console.log('Processing payment callback:', { transactionId, responseCode, orderInfo });
          const result = await processPaymentCallback(transactionId, responseCode, orderInfo);
          console.log('Payment callback result:', result);
          if (result.paymentVerified) {
            if (!paymentSuccessLocked && paymentStatus !== 'success') {
              setPaymentStatus('success');
              paymentSuccessLocked = true;
            }
            localStorage.setItem(processedKey, 'true');
            channel.postMessage({ type: 'processed', transactionId });
            if (result.membershipResult && result.membershipResult.success) {
              setPaymentInfo(prev => ({
                ...prev,
                membershipCreated: true,
                membershipId: result.membershipResult.data?.data?.membershipId,
                membershipAction: result.membershipResult.action
              }));
              console.log('Membership processed successfully:', result.membershipResult);
            } else {
              setPaymentInfo(prev => ({
                ...prev,
                membershipError: result.membershipResult?.error || 'Unknown membership error'
              }));
              console.error('Membership creation failed:', result.membershipResult);
            }
          } else {
            if (!paymentSuccessLocked && paymentStatus !== 'success') {
              setPaymentStatus('failed');
            }
            console.error('Payment verification failed:', result.error);
          }
        } catch (error) {
          console.error('Error in verifyAndCreateMembership:', error);
          if (!paymentSuccessLocked && paymentStatus !== 'success') {
            setPaymentStatus('failed');
          }
        }
      } else if (responseCode !== '00') {
        if (!paymentSuccessLocked && paymentStatus !== 'success') {
          setPaymentStatus('failed');
        }
        console.log('Payment failed with response code:', responseCode);
      }
    };

    // Lắng nghe các tab khác xử lý transactionId
    channel.onmessage = (event) => {
      if (event.data && event.data.transactionId == transactionId) {
        if (event.data.type == 'processing') {
          isProcessing = true;
        }
        if (event.data.type == 'processed') {
          localStorage.setItem(processedKey, 'true');
          if (!paymentSuccessLocked && paymentStatus !== 'success') {
            setPaymentStatus('success');
            paymentSuccessLocked = true;
          }
        }
      }
    };

    verifyAndCreateMembership();

    return () => {
      channel.close();
    };
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

  // Add margin top to avoid header overlap
  // Extract package name from orderInfo if possible
  let packageName = '';
  if (paymentInfo.orderInfo) {
    // Try to extract PACKAGE_NAME:<name> from orderInfo string
    const match = paymentInfo.orderInfo.match(/PACKAGE_NAME:([^|]+)/);
    if (match && match[1]) {
      packageName = match[1].trim();
    }
  }

  return (
    <div className="payment-result-bg" style={{ minHeight: '100vh', marginTop: 0, paddingTop: 80, boxSizing: 'border-box' }}>
      <div className="payment-result-container">
        <div className="payment-result-card">
          {paymentStatus == 'success' ? (
            <>
              <div className="payment-result-icon success">
                <AiOutlineCheckCircle size={80} />
              </div>
              <h2 className="payment-result-title success">Thanh toán thành công! 🎉</h2>
              <div className="payment-result-message">
                <p>
                  Chúc mừng! Bạn đã nâng cấp gói thành viên thành công.
                </p>
                {paymentInfo.membershipCreated ? (
                  <p style={{fontWeight: 'bold'}}>
                    ✅ Gói membership
                    {packageName && (
                      <span> <span style={{
                        color:'red',
                        fontWeight:'bold',
                        textTransform:'uppercase',
                        fontSize:'1.3em',
                        letterSpacing:'0.1px',
                        margin:'0 1px'
                      }}>{packageName}</span></span>
                    )}
                    {` đã được ${paymentInfo.membershipAction == 'updated' ? 'cập nhật' : 'kích hoạt'} thành công!`}
                  </p>
                ) : paymentInfo.membershipError ? (
                  <p style={{color: '#f44336', fontSize: '14px'}}>
                    ⚠️ Thanh toán thành công nhưng có lỗi khi kích hoạt membership: {paymentInfo.membershipError}
                    <br/>Vui lòng liên hệ support để được hỗ trợ.
                  </p>
                ) : !paymentInfo.orderInfo ? (
                  <p style={{color: '#ff9800', fontSize: '14px'}}>
                    ⚠️ Thanh toán thành công nhưng không thể tự động kích hoạt gói membership do thiếu thông tin.
                    <br/>Vui lòng liên hệ support để được hỗ trợ kích hoạt gói.
                  </p>
                ) : (
                  <p style={{color: '#ff9800', fontSize: '14px'}}>
                    🔄 Đang kích hoạt gói membership...
                  </p>
                )}
                <p style={{
                  background: '#e3fcec',
                  color: '#219150',
                  fontWeight: 'bold',
                  fontSize: '1.1em',
                  borderRadius: 8,
                  padding: '10px 16px',
                  margin: '18px 0 0 0',
                  boxShadow: '0 2px 8px #e0f2e9',
                  display: 'inline-block',
                  letterSpacing: '0.2px'
                }}>
                  <span style={{textTransform: 'uppercase', color: '#1b7f3a'}}>Bước tiếp theo:</span> Hãy chọn Coach chuyên nghiệp cho bạn để bắt đầu hành trình cai thuốc!
                </p>
              </div>
            </>
          ) : paymentStatus == 'pending' ? (
            <>
              <div className="payment-result-icon pending">
                <AiOutlineCloseCircle size={80} />
              </div>
              <h2 className="payment-result-title pending">Giao dịch đang chờ xác thực!</h2>
              <p className="payment-result-message">
                Giao dịch của bạn đang được xác thực lại với ngân hàng.<br />
                Vui lòng kiểm tra lại sau hoặc liên hệ hỗ trợ nếu cần.
              </p>
              <button className="btn-home" onClick={handleGoHome}>
                <AiOutlineHome size={20} /> Về trang chủ
              </button>
            </>
          ) : paymentStatus == 'failed' ? (
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
              {packageName && (
                <div className="detail-row">
                  <span className="detail-label">Tên gói:</span>
                  <span className="detail-value">{packageName}</span>
                </div>
              )}
              {paymentInfo.membershipId && (
                <div className="detail-row">
                  <span className="detail-label">Membership ID:</span>
                  <span className="detail-value">{paymentInfo.membershipId}</span>
                </div>
              )}
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
            {paymentStatus == 'success' ? (
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
