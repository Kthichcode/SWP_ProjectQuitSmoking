import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Header from './pages/Header';
import Footer from './pages/Footer';
import Register from './pages/Register';
import About from './pages/About';
import Blog from './pages/Blog';
import Ranking from './pages/Ranking';
function App() {
  return (
    <>
    <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/about" element={<About />} />
        <Route path="/login/oauth2/code/google" element={<Navigate to="/login" />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
