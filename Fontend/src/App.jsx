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
import CoachProfilePage from './pages/CoachProfile';
import Progress from './pages/Progress';
import AdminDashboard from './assets/Admin/AdminDashBoard';
import { useAuth } from './contexts/AuthContext';
import CoachDashboard from './assets/Coach/CoachDashboard';
import Users from './assets/Coach/Users';
import MakePlans from './assets/Coach/MakePlans';
import Messages from './assets/Coach/Messages';
import CoachProfile from './assets/Coach/CoachProfile';
import AdminAchievements from './assets/Admin/AdminAchievements';
import AdminUsers from './assets/Admin/AdminUsers';
import AdminCoaches from './assets/Admin/AdminCoaches';
import AdminPackages from './assets/Admin/AdminPackages';
import AdminNotifications from './assets/Admin/AdminNotifications';
import AdminStatistics from './assets/Admin/AdminStatistics';
import AdminSystem from './assets/Admin/AdminSystem';
import AdminFeedback from './assets/Admin/AdminFeedback';
import CoachBlog from './assets/Coach/CoachBlog';
import AdminBlogs from './assets/Admin/AdminBlogs';
import AdminBlogCategories from './assets/Admin/AdminBlogCategories';
import BlogDetail from './pages/BlogDetail';
import Profile from './pages/Profile';
import AdminBadges from './assets/Admin/AdminBadges';
import Checkout from './pages/Checkout';
import PaymentResult from './pages/PaymentResult';
import VNPayCallback from './pages/VNPayCallback';
import MembershipDebug from './components/MembershipDebug';
import UserInitialInfo from './pages/UserInitialInfo';

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
          path="/admin/dashboard/*"
          element={
            <RequireRole role="ADMIN">
              <AdminDashboard />
            </RequireRole>
          }
        >
          <Route index element={<AdminStatistics />} />
          <Route path="achievements" element={<AdminAchievements />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coaches" element={<AdminCoaches />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="blog-categories" element={<AdminBlogCategories />} />
          <Route path="badges" element={<AdminBadges />} />
        </Route>
        <Route path="/initial-info" element={<UserInitialInfo />} />
        <Route
          path="/coach/*"
          element={
            <RequireRole role="COACH">
              <CoachDashboard />
            </RequireRole>
          }
        >
          <Route index element={
            <div>
             
              <h2>Chào mừng trở lại, Coach!</h2>
              <p>Hôm nay bạn có 5 cuộc hẹn và 8 tin nhắn mới</p>
            </div>
          } />
          <Route path="users" element={<Users />} />
          <Route path="plans" element={<MakePlans />} />
          <Route path="messages" element={<Messages />} />
          <Route path="blog" element={<CoachBlog />} />
          <Route path="profile" element={<CoachProfile />} />
        </Route>
        <Route
          path="/coach-payment"
          element={<CoachPayment />}
        />
        <Route
          path="/coach/:id"
          element={<CoachProfilePage />}
        />
        
        <Route
          path="/api/payment/*"
          element={<VNPayCallback />}
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
                <Route path="/payment-result" element={<PaymentResult />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/debug-membership" element={<MembershipDebug />} />
                <Route path="/login/oauth2/code/google" element={<Navigate to="/login" />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/progress" element={<Progress />} />
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