import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserInitialInfoForm from '../components/UserInitialInfoForm';

const UserInitialInfo = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkHasSubmitted = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:5175/api/member-initial-info/has-submitted', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data === true) {
          navigate('/home', { replace: true });
        }
      } catch {}
    };
    checkHasSubmitted();

    // Chặn back/forward khi chưa khai báo
    const handlePopState = (e) => {
      e.preventDefault();
      navigate('/initial-info', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  return (
    <div className="user-initial-info-page">
      <UserInitialInfoForm onSuccess={() => navigate('/home')} />
    </div>
  );
};

export default UserInitialInfo;