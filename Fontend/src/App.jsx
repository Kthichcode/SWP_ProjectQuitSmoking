import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Header from './pages/Header';
import Footer from './pages/Footer';
import Register from './pages/Register';
import About from './pages/About';
import Blog from './pages/Blog';
import Ranking from './pages/Ranking';
import Payment from './pages/Payment';
import CoachPayment from './pages/CoachPayment';
import CoachProfile from './pages/CoachProfile';
import AdminDashboard from './assets/Admin/AdminDashBoard';
import Coach from './assets/Coach/Coach';
import { useAuth } from './contexts/AuthContext';

function RequireRole({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.scope?.toUpperCase() !== role) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/admin/dashboard"
          element={
            <RequireRole role="ADMIN">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/coach"
          element={
            <RequireRole role="COACH">
              <Coach />
            </RequireRole>
          }
        />
        <Route
          path="/coach-payment"
          element={<CoachPayment />}
        />
        <Route
          path="*"
          element={
            <>
              <Header />
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/about" element={<About />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/coach/:id" element={<CoachProfile />} />
                <Route path="/login/oauth2/code/google" element={<Navigate to="/login" />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;