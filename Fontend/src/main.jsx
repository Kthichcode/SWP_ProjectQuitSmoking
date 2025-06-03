import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ Thêm BrowserRouter
import App from './App'; // ✅ Import App chứa <Routes>
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App /> {/* ✅ Gọi App.jsx để có routing */}
    </BrowserRouter>
  </React.StrictMode>,
);
