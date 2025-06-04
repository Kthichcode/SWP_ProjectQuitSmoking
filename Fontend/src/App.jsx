import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Footer from './pages/Footer';
import Register from './pages/Register';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Handle Google OAuth2 redirect */}
        <Route path="/login/oauth2/code/google" element={<Navigate to="/login" />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
