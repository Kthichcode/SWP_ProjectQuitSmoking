import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../../axiosInstance';

function MembershipDebug() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const runDebugChecks = async () => {
    if (!user || !user.token) {
      setDebugInfo('User not logged in');
      return;
    }

    setLoading(true);
    let info = '';

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      info += '=== DEBUG MEMBERSHIP ISSUES ===\n\n';

      // 1. Check user profile
      try {
        const profileRes = await axios.get('/api/users/getMyInfo', config);
        const userProfile = profileRes.data;
        const userId = userProfile.id || userProfile.userId || userProfile.memberId;
        
        info += '1. USER PROFILE:\n';
        info += `   - Profile response: ${JSON.stringify(userProfile, null, 2)}\n`;
        info += `   - Extracted userId: ${userId}\n`;
        info += `   - User ID type: ${typeof userId}\n\n`;

        // 2. Check if user exists in members table
        try {
          const userCheckRes = await axios.get(`/api/users/${userId}`, config);
          info += '2. USER EXISTS CHECK:\n';
          info += `   - User exists: YES\n`;
          info += `   - User data: ${JSON.stringify(userCheckRes.data, null, 2)}\n\n`;
        } catch (userError) {
          info += '2. USER EXISTS CHECK:\n';
          info += `   - User exists: NO\n`;
          info += `   - Error: ${userError.response?.status} - ${userError.response?.data?.message || userError.message}\n\n`;
        }

        // 3. Check membership packages
        try {
          const packagesRes = await axios.get('/api/membership-packages/getAll', config);
          info += '3. MEMBERSHIP PACKAGES:\n';
          info += `   - Packages: ${JSON.stringify(packagesRes.data, null, 2)}\n\n`;
        } catch (packError) {
          info += '3. MEMBERSHIP PACKAGES:\n';
          info += `   - Error: ${packError.response?.status} - ${packError.response?.data?.message || packError.message}\n\n`;
        }

        // 4. Check existing memberships
        try {
          const membershipRes = await axios.get(`/api/user-memberships/check-user-membership/${userId}`, config);
          info += '4. CHECK USER MEMBERSHIP:\n';
          info += `   - Membership response: ${JSON.stringify(membershipRes.data, null, 2)}\n\n`;
        } catch (membershipError) {
          info += '4. CHECK USER MEMBERSHIP:\n';
          info += `   - Error: ${membershipError.response?.status} - ${membershipError.response?.data?.message || membershipError.message}\n\n`;
        }

        // 5. Check active membership
        try {
          const activeRes = await axios.get(`/api/user-memberships/check-active/${userId}`, config);
          info += '5. CHECK ACTIVE MEMBERSHIP:\n';
          info += `   - Active response: ${JSON.stringify(activeRes.data, null, 2)}\n\n`;
        } catch (activeError) {
          info += '5. CHECK ACTIVE MEMBERSHIP:\n';
          info += `   - Error: ${activeError.response?.status} - ${activeError.response?.data?.message || activeError.message}\n\n`;
        }

        // 6. Get all memberships
        try {
          const allRes = await axios.get('/api/user-memberships/getAll', config);
          info += '6. ALL MEMBERSHIPS:\n';
          info += `   - All memberships: ${JSON.stringify(allRes.data, null, 2)}\n\n`;
        } catch (allError) {
          info += '6. ALL MEMBERSHIPS:\n';
          info += `   - Error: ${allError.response?.status} - ${allError.response?.data?.message || allError.message}\n\n`;
        }

        // 7. Test create membership with minimal data
        info += '7. TEST CREATE MEMBERSHIP:\n';
        const testMembershipData = {
          userId: userId,
          membershipPackageId: 1, // Giả sử package ID 1 tồn tại
          status: 'ACTIVE',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        info += `   - Test data: ${JSON.stringify(testMembershipData, null, 2)}\n`;
        info += '   - Note: This is just showing the data that would be sent, not actually creating\n\n';

      } catch (error) {
        info += `GENERAL ERROR: ${error.message}\n`;
        info += `Error details: ${JSON.stringify(error.response?.data, null, 2)}\n`;
      }

    } catch (error) {
      info += `FATAL ERROR: ${error.message}\n`;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const testCreateMembership = async () => {
    if (!user || !user.token) {
      alert('User not logged in');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      const profileRes = await axios.get('/api/users/getMyInfo', config);
      const userProfile = profileRes.data;
      const userId = userProfile.id || userProfile.userId || userProfile.memberId;

      const testData = {
        userId: userId,
        membershipPackageId: 1, // Package ID 1
        status: 'ACTIVE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      console.log('Attempting to create membership:', testData);
      const result = await axios.post('/api/user-memberships/create', testData, config);
      console.log('Create result:', result.data);
      alert('Test membership created successfully! Check console for details.');
      
    } catch (error) {
      console.error('Test create failed:', error);
      alert(`Test create failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Membership Debug Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runDebugChecks}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Running Debug...' : 'Run Debug Checks'}
        </button>
        
        <button 
          onClick={testCreateMembership}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Create Membership
        </button>
      </div>

      {debugInfo && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          padding: '15px',
          fontFamily: 'monospace',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          maxHeight: '600px',
          overflow: 'auto'
        }}>
          {debugInfo}
        </div>
      )}
    </div>
  );
}

export default MembershipDebug;
