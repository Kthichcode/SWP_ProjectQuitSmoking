import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/CSS/Payment.css';
import { AiFillHeart, AiFillStar, AiFillCrown, AiOutlineCheck } from 'react-icons/ai';
import axios from '../../axiosInstance';

function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiPackages, setApiPackages] = useState([]);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [pendingPackage, setPendingPackage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (user === null) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.token) {
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };

        // Lấy thông tin user profile để có user ID
        const profileResponse = await axios.get('/api/users/getMyInfo', config);
        const userProfile = profileResponse.data;
        const userId = userProfile.id || userProfile.userId || userProfile.memberId;

        // Fetch packages trước
        const packagesRes = await axios.get('/api/membership-packages/getAll', config);
        
        // Set packages
        let packagesData = packagesRes.data.data;
        if (Array.isArray(packagesData)) {
          setApiPackages(packagesData);
        } else if (packagesData && typeof packagesData === 'object') {
          setApiPackages([packagesData]);
        } else {
          setApiPackages([]);
        }

        // Fetch membership riêng với error handling
        if (userId) {
          try {
            console.log('Checking membership for userId:', userId);
            const membershipRes = await axios.get(`/api/user-memberships/check-user-membership/${userId}`, config);
            console.log('Membership API response:', membershipRes.data);
            
            if (membershipRes.data && membershipRes.data.data) {
              setCurrentMembership(membershipRes.data.data);
              localStorage.setItem('currentMembership', JSON.stringify(membershipRes.data.data));
              console.log('Current membership set:', membershipRes.data.data);
            } else {
              console.log('No membership data found');
              setCurrentMembership(null);
            }
          } catch (membershipError) {
            console.error('Error fetching membership:', membershipError);
            console.error('Membership error response:', membershipError.response?.data);
            
            // Thử API kiểm tra active membership khác
            try {
              console.log('Trying alternative API - check-active');
              const activeRes = await axios.get(`/api/user-memberships/check-active/${userId}`, config);
              console.log('Active membership API response:', activeRes.data);
              
              if (activeRes.data && activeRes.data.data === true) {
                // Nếu có active membership, thử lấy tất cả membership của user
                try {
                  const allMemberships = await axios.get('/api/user-memberships/getAll', config);
                  console.log('All memberships:', allMemberships.data);
                  
                  // Tìm membership active của user hiện tại
                  if (allMemberships.data && allMemberships.data.data) {
                    const userActiveMembership = allMemberships.data.data.find(
                      membership => membership.userId === userId && membership.status === 'ACTIVE'
                    );
                    
                    if (userActiveMembership) {
                      setCurrentMembership(userActiveMembership);
                      localStorage.setItem('currentMembership', JSON.stringify(userActiveMembership));
                      console.log('Found active membership from getAll:', userActiveMembership);
                    }
                  }
                } catch (getAllError) {
                  console.error('Error getting all memberships:', getAllError);
                }
              }
            } catch (activeError) {
              console.error('Error checking active membership:', activeError);
            }
            
            // Không set error state, chỉ log để debug
            setCurrentMembership(null);
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setApiPackages([]);
        setCurrentMembership(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleBuy = async (packageId, skipConfirm = false) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Kiểm tra nếu user đã có membership active
    if (!skipConfirm && currentMembership && currentMembership.status === 'ACTIVE') {
      // Nếu đang cố mua cùng gói đang sử dụng
      if (currentMembership.membershipPackage && currentMembership.membershipPackage.id === packageId) {
        alert(`Bạn đang sử dụng gói ${currentMembership.membershipPackage.name}. Không thể mua lại gói này.`);
        return;
      }
      // Nếu cố mua gói khác, hiển thị modal xác nhận
      setUpgradeMessage(`Bạn đang có gói ${currentMembership.membershipPackage?.name || 'membership'} đang hoạt động. Gói hiện tại sẽ bị hủy khi bạn chọn gói mới. Bạn có chắc chắn muốn tiếp tục?`);
      setPendingPackage(packageId);
      setShowConfirmModal(true);
      return;
    }

    try {
      // Lấy thông tin user profile để có user ID chính xác
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      
      const profileResponse = await axios.get('/api/users/getMyInfo', config);
      const userProfile = profileResponse.data;
      
      const userId = userProfile.id || userProfile.userId || userProfile.memberId;
      
      if (!userId) {
        console.error('Không tìm thấy user ID trong profile:', userProfile);
        alert('Lỗi: Không tìm thấy thông tin người dùng. Vui lòng thử lại.');
        return;
      }

      // Tìm package để lấy thông tin
      const selectedPackage = apiPackages.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        alert('Không tìm thấy gói dịch vụ');
        return;
      }

      // Nếu là gói miễn phí thì tạo membership trực tiếp
      if (selectedPackage.price === 0) {
        try {
          console.log('Creating free membership for userId:', userId);
          console.log('Selected package:', selectedPackage);
          console.log('Current membership before:', currentMembership);
          
          // Kiểm tra xem user có tồn tại trong hệ thống không
          try {
            const userCheckRes = await axios.get(`/api/users/${userId}`, config);
            console.log('User exists check:', userCheckRes.data);
          } catch (userCheckError) {
            console.error('User check failed:', userCheckError);
            alert('Người dùng không tồn tại trong hệ thống. Vui lòng liên hệ admin.');
            return;
          }
          
          // Nếu đã có membership active thì update, không thì create mới
          if (currentMembership && currentMembership.status === 'ACTIVE') {
            console.log('Updating existing membership:', currentMembership.membershipId);
            
            // Update membership hiện tại
            const membershipRequest = {
              userId: userId,
              membershipPackageId: selectedPackage.id,
              status: 'ACTIVE',
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
            
            console.log('Update request:', membershipRequest);
            const updateRes = await axios.put(`/api/user-memberships/update/${currentMembership.membershipId}`, membershipRequest, config);
            console.log('Update response:', updateRes.data);
            alert('Đã cập nhật gói miễn phí thành công!');
          } else {
            console.log('Creating new membership');
            
            // Tạo membership mới
            const membershipRequest = {
              userId: userId,
              membershipPackageId: selectedPackage.id,
              status: 'ACTIVE',
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            console.log('Create request:', membershipRequest);
            const createRes = await axios.post('/api/user-memberships/create', membershipRequest, config);
            console.log('Create response:', createRes.data);
            alert('Đã đăng ký gói miễn phí thành công!');
          }
          
          // Refresh current membership với retry logic
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before checking
              const membershipRes = await axios.get(`/api/user-memberships/check-user-membership/${userId}`, config);
              console.log(`Refresh attempt ${retryCount + 1}:`, membershipRes.data);
              
              if (membershipRes.data && membershipRes.data.data) {
                setCurrentMembership(membershipRes.data.data);
                localStorage.setItem('currentMembership', JSON.stringify(membershipRes.data.data));
                console.log('Successfully refreshed membership');
                break;
              }
            } catch (refreshError) {
              console.error(`Retry ${retryCount + 1} failed:`, refreshError);
            }
            retryCount++;
          }
          
          return;
        } catch (error) {
          console.error('Lỗi tạo/cập nhật membership miễn phí:', error);
          console.error('Error details:', error.response?.data);
          console.error('Error status:', error.response?.status);
          console.error('Error headers:', error.response?.headers);
          
          // Hiển thị lỗi chi tiết hơn
          let errorMessage = 'Có lỗi xảy ra khi đăng ký gói miễn phí.';
          if (error.response?.data?.message) {
            errorMessage += ` Chi tiết: ${error.response.data.message}`;
          } else if (error.response?.status === 400) {
            errorMessage += ' Dữ liệu không hợp lệ.';
          } else if (error.response?.status === 404) {
            errorMessage += ' Không tìm thấy thông tin cần thiết.';
          } else if (error.response?.status === 500) {
            errorMessage += ' Lỗi server.';
          }
          errorMessage += ' Vui lòng thử lại!';
          
          alert(errorMessage);
          return;
        }
      }

      // Gọi API tạo URL thanh toán VNPay cho gói trả phí
      const orderInfo = `USER_ID:${userId}|PACKAGE_ID:${selectedPackage.id}|PACKAGE_NAME:${selectedPackage.name}`;
      
      const response = await axios.get('/api/payment/create-vnpay', {
        ...config,
        params: {
          amount: selectedPackage.price,
          orderInfo: orderInfo
        }
      });

      if (response.data) {
        // Chuyển hướng đến URL thanh toán VNPay
        window.location.href = response.data;
      } else {
        alert('Không thể tạo liên kết thanh toán');
      }
    } catch (error) {
      console.error('Lỗi tạo thanh toán:', error);
      alert('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!');
    }
  };

  const displayPackages = apiPackages.map((pkg, idx) => {
    // Kiểm tra nếu user đã có package này và đang active
    const isCurrentPackage = currentMembership && 
                             currentMembership.membershipPackage && 
                             currentMembership.membershipPackage.id === pkg.id && 
                             currentMembership.status === 'ACTIVE';

    return {
      id: pkg.id,
      name: pkg.name,
      price: Number(pkg.price),
      priceLabel:
        idx === 0
          ? `${Number(pkg.price).toLocaleString('vi-VN')}đ/tháng`
          : idx === 1
            ? `${Number(pkg.price).toLocaleString('vi-VN')}đ/6 tháng`
            : idx === 2
              ? `${Number(pkg.price).toLocaleString('vi-VN')}đ/9 tháng`
              : `${Number(pkg.price).toLocaleString('vi-VN')}đ/tháng`,
      icon: idx === 0 ? <AiFillHeart size={60} color="#2e7d32" style={{background:'#fff',borderRadius:'50%',padding:6}} />
        : idx === 1 ? <AiFillStar size={60} color="#1976d2" style={{background:'#fff',borderRadius:'50%',padding:6}} />
        : <AiFillCrown size={60} color="#8e24aa" style={{background:'#fff',borderRadius:'50%',padding:6}} />,
      features: pkg.features && Array.isArray(pkg.features) ? pkg.features : [pkg.description || ''],
      btn: isCurrentPackage ? 'Đang sử dụng' : (pkg.price === 0 ? 'Bắt đầu miễn phí' : 'Chọn gói này'),
      btnClass: isCurrentPackage ? 'btn-current' : (idx === 0 ? 'btn-free' : idx === 1 ? 'btn-popular' : 'btn-premium'),
      highlight: idx === 1,
      borderColor: isCurrentPackage ? '#4caf50' : (idx === 1 ? '#1976d2' : (idx === 2 ? '#8e24aa' : '#e0e0e0')),
      label: isCurrentPackage ? 'Gói hiện tại' : (idx === 1 ? 'Phổ biến nhất' : undefined),
      desc: pkg.description || '',
      isCurrentPackage: isCurrentPackage,
    };
  });

  return (
    <div className="payment-bg">
      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{background:'#fff',padding:32,borderRadius:16,minWidth:320,boxShadow:'0 4px 24px rgba(0,0,0,0.18)'}}>
            <div style={{marginBottom:24, color:'#d35400', fontWeight:600, fontSize:18}}>{upgradeMessage}</div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:12}}>
              <button
                style={{padding:'8px 20px',background:'#c92424ff',border:'none',borderRadius:6,fontWeight:500,cursor:'pointer'}}
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingPackage(null);
                }}
              >Hủy</button>
              <button
                style={{padding:'8px 20px',background:'#1976d2',color:'#fff',border:'none',borderRadius:6,fontWeight:500,cursor:'pointer'}}
                onClick={async () => {
                  setShowConfirmModal(false);
                  if (pendingPackage) {
                    await handleBuy(pendingPackage, true);
                    setPendingPackage(null);
                  }
                }}
              >Xác nhận</button>
            </div>
          </div>
        </div>
      )}
      <div className="payment-container">
        <h2 className="payment-title">Hành trình cai nghiện thuốc lá cùng chúng tôi</h2>
        <div className="payment-sub">Chọn gói dịch vụ phù hợp để bắt đầu cuộc sống khỏe mạnh</div>
        
        {/* Hiển thị thông tin membership hiện tại nếu có */}
        {currentMembership && currentMembership.status === 'ACTIVE' && (
          <div className="current-membership-info" style={{
            background: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '16px',
            margin: '20px 0',
            textAlign: 'center'
          }}>
            <h3 style={{color: '#2e7d32', margin: '0 0 8px 0'}}>
              Gói hiện tại: {currentMembership.membershipPackage?.name || currentMembership.membershipPackageName || 'N/A'}
            </h3>
            <p style={{margin: '0', color: '#555'}}>
              Hết hạn: {currentMembership.endDate ? new Date(currentMembership.endDate).toLocaleDateString('vi-VN') : 'N/A'}
            </p>
          </div>
        )}

        {loading ? (
          <div style={{textAlign: 'center', padding: '40px'}}>
            <p>Đang tải...</p>
          </div>
        ) : (
          <div className="package-list">
            {displayPackages.map((pkg, idx) => (
              <div
                className={`package-card-v2${pkg.highlight ? ' package-popular' : ''}${pkg.isCurrentPackage ? ' package-current' : ''}`}
                key={pkg.id}
                style={{borderColor: pkg.borderColor}}
              >
                {pkg.label && <div className="package-label">{pkg.label}</div>}
                <div className="package-icon">{pkg.icon}</div>
                <h3 className="package-name">{pkg.name}</h3>
                <div className="package-price">
                  <span className="package-price-main">{pkg.priceLabel}</span>
                </div>
                <div className="package-desc">
                  {pkg.desc && typeof pkg.desc === 'string' && pkg.desc.trim() !== '' ? (
                    <ul className="package-features">
                      {pkg.desc.split(/\r?\n/).map((f, i) => (
                        <li key={i}><AiOutlineCheck color="#43a047" style={{marginRight:6}}/>{f}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <button 
                  className={`buy-btn-v2 ${pkg.btnClass}`} 
                  onClick={() => handleBuy(pkg.id)}
                  disabled={pkg.isCurrentPackage}
                >
                  {pkg.btn}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Để handleBuy nhận thêm tham số skipConfirm (nếu xác nhận từ modal thì bỏ qua modal)
// eslint-disable-next-line
function PaymentWithConfirm(props) {
  return <Payment {...props} />;
}
export default Payment;
