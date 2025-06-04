import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App'; 
import './index.css';
import Footer from './pages/Footer';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="82302107538-mjprlclm2pvioc2ojv5q0mjjibkbpdni.apps.googleusercontent.com">
      <BrowserRouter>
        <App /> 
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
