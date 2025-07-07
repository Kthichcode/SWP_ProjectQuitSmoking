import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function VNPayCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy tất cả query parameters từ VNPay
    const queryString = searchParams.toString();
    
    // Redirect về PaymentResult với tất cả parameters
    navigate(`/payment-result?${queryString}`, { replace: true });
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Đang xử lý kết quả thanh toán...
    </div>
  );
}

export default VNPayCallback;
