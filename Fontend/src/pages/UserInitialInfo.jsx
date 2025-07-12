import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserInitialInfoForm from '../components/UserInitialInfoForm';

const UserInitialInfo = () => {
  const navigate = useNavigate();
  return (
    <div className="user-initial-info-page">
      <UserInitialInfoForm onSuccess={() => navigate('/home')} />
    </div>
  );
};

export default UserInitialInfo;