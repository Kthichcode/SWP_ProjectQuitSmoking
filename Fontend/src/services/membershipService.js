import axios from '../../../axiosInstance';

// Helper function để tạo membership sau khi thanh toán thành công
export const createMembershipAfterPayment = async (orderInfo, transactionId) => {
  try {
    // Parse orderInfo để lấy userId và packageId
    // Format: USER_ID:2|PACKAGE_ID:1|PACKAGE_NAME:VIP
    const orderParts = orderInfo.split('|');
    const userIdPart = orderParts.find(part => part.startsWith('USER_ID:'));
    const packageIdPart = orderParts.find(part => part.startsWith('PACKAGE_ID:'));
    
    if (!userIdPart || !packageIdPart) {
      throw new Error('Invalid orderInfo format');
    }
    
    const userId = parseInt(userIdPart.split(':')[1]);
    const packageId = parseInt(packageIdPart.split(':')[1]);
    
    console.log('Creating membership for:', { userId, packageId, transactionId });
    
    // Kiểm tra xem user đã có membership active chưa
    try {
      const existingMembership = await axios.get(`/api/user-memberships/check-user-membership/${userId}`);
      if (existingMembership.data && existingMembership.data.data && existingMembership.data.data.status === 'ACTIVE') {
        console.log('User already has active membership, updating...');
        
        // Update membership hiện tại
        const membershipData = {
          userId: userId,
          membershipPackageId: packageId,
          status: 'ACTIVE',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          transactionId: transactionId
        };
        
        const updateResponse = await axios.put(`/api/user-memberships/update/${existingMembership.data.data.membershipId}`, membershipData);
        return {
          success: true,
          data: updateResponse.data,
          action: 'updated'
        };
      }
    } catch (checkError) {
      console.log('No existing membership found, creating new one...');
    }
    
    // Tạo membership mới
    const membershipData = {
      userId: userId,
      membershipPackageId: packageId,
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      transactionId: transactionId
    };
    
    const createResponse = await axios.post('/api/user-memberships/create', membershipData);
    return {
      success: true,
      data: createResponse.data,
      action: 'created'
    };
    
  } catch (error) {
    console.error('Error in createMembershipAfterPayment:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    };
  }
};

// Helper function để verify payment và tạo membership
export const processPaymentCallback = async (transactionId, responseCode, orderInfo) => {
  try {
    // Verify payment với backend
    const verifyResponse = await axios.get('/api/payment/check-callback', {
      params: {
        vnp_TxnRef: transactionId,
        vnp_ResponseCode: responseCode
      }
    });
    
    console.log('Payment verification:', verifyResponse.data);
    
    // Nếu thanh toán thành công, tạo membership
    if (responseCode === '00' && orderInfo) {
      const membershipResult = await createMembershipAfterPayment(orderInfo, transactionId);
      
      return {
        paymentVerified: true,
        membershipResult: membershipResult
      };
    } else {
      return {
        paymentVerified: false,
        error: 'Payment verification failed'
      };
    }
    
  } catch (error) {
    console.error('Error in processPaymentCallback:', error);
    return {
      paymentVerified: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    };
  }
};
