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
import CoachDashBoard from './pages/CoachDashBoard';
import CoachProfile from './pages/CoachProfile';
import AdminDashboard from './assets/Admin/AdminDashBoard';
import AdminUsers from './assets/Admin/AdminUsers';
import AdminCoaches from './assets/Admin/AdminCoaches';
import AdminPlans from './assets/Admin/AdminPlans';
import AdminAchievements from './assets/Admin/AdminAchievements';
import AdminSystem from './assets/Admin/AdminSystem';
import AdminFeedback from './assets/Admin/AdminFeedback';
import AdminPackages from './assets/Admin/AdminPackages';
import AdminStatistics from './assets/Admin/AdminStatistics';
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
        >
          <Route index element={<div>Thống kê tổng quan</div>} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coaches" element={<AdminCoaches />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="achievements" element={<AdminAchievements />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="statistics" element={<AdminStatistics />} />
        </Route>
        <Route
          path="*"
          element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/about" element={<About />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/coach-dashboard" element={<CoachDashBoard />} />
                <Route path="/coach/:id" element={<CoachProfile />} />
                <Route path="/login/oauth2/code/google" element={<Navigate to="/login" />} />
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
