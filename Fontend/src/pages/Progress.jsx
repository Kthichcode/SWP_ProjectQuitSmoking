import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import axiosInstance from '../../axiosInstance';
import WebSocketService from '../services/websocketService';
import coachReviewService from '../services/coachReviewService';
import CoachRatingModal from '../components/CoachRatingModal';
import '../assets/CSS/Progress.css';

function Progress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCoach, setSelectedCoach] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [quitDate, setQuitDate] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectionId, setSelectionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const [chatHistoryLoaded, setChatHistoryLoaded] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const messagesEndRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const hasNewMessageRef = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    checkUserMembership();
  }, [user, navigate]);

  const checkUserMembership = async () => {
    try {
      setCheckingMembership(true);
      const currentUserId = user.userId || user.id;
      const response = await axiosInstance.get(`/api/user-memberships/check-active/${currentUserId}`);

      if (response.data?.status === 'success' && response.data.data === true) {
        setMembershipStatus({ status: 'ACTIVE', hasActiveMembership: true });
        loadCoachInfo();
      } else {
        setMembershipStatus(null);
      }
    } catch {
      setMembershipStatus(null);
    } finally {
      setCheckingMembership(false);
    }
  };

  const loadCoachInfo = () => {
    const coach = location.state?.selectedCoach;
    const selectionIdFromState = location.state?.selectionId;

    if (coach) {
      setSelectedCoach(coach);
      localStorage.setItem('selectedCoach', JSON.stringify(coach));
      if (selectionIdFromState) {
        setSelectionId(selectionIdFromState);
        localStorage.setItem('selectionId', selectionIdFromState.toString());
      }
    } else {
      const savedCoach = localStorage.getItem('selectedCoach');
      const savedSelectionId = localStorage.getItem('selectionId');
      if (savedCoach) setSelectedCoach(JSON.parse(savedCoach));
      if (savedSelectionId) setSelectionId(parseInt(savedSelectionId));
    }
  };

  useEffect(() => {
    if (selectedCoach && !selectionId) {
      fetchSelectionId();
    }
  }, [selectedCoach, selectionId]);

  useEffect(() => {
    if (!selectionId) return;

    let subscription;
    let isMounted = true;

    const connect = async () => {
      subscription = await connectWebSocket();
      if (subscription && isMounted) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
        retryConnect();
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [selectionId]);

  const retryConnect = () => {
    if (reconnectAttempts.current >= 5) return;
    reconnectAttempts.current += 1;
    setTimeout(() => {
      connectWebSocket();
    }, 3000);
  };

  useEffect(() => {
    if (!selectionId) return;

    if (activeTab === 'chat') {
      return;
    }

    const interval = setInterval(() => {
      fetchChatHistory();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectionId, activeTab]);

  useEffect(() => {
    if (selectionId && activeTab === 'chat' && !chatHistoryLoaded) {
      fetchChatHistory();
      setChatHistoryLoaded(true);
    }
  }, [selectionId, activeTab, chatHistoryLoaded]);

  useEffect(() => {
    if (activeTab === 'chat' && hasNewMessageRef.current) {
      scrollToBottom();
      hasNewMessageRef.current = false;
    }
  }, [messages, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'chat') {
      setChatHistoryLoaded(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSelectionId = async () => {
    try {
      const currentUserId = user.userId || user.id;
      const currentCoachId = selectedCoach?.coachId || selectedCoach?.userId || selectedCoach?.id;
      if (!currentCoachId || !currentUserId) return;

      const response = await axiosInstance.get(`/api/users/members/selection-with-coach/${currentCoachId}`);

      if (response.data?.status === 'success' && response.data.data?.selectionId) {
        const realSelectionId = response.data.data.selectionId;
        setSelectionId(realSelectionId);
        localStorage.setItem('selectionId', realSelectionId.toString());
      } else {
        await createDummyMessage(currentUserId, currentCoachId);
      }
    } catch {
      const fallbackId = Date.now();
      setSelectionId(fallbackId);
      localStorage.setItem('selectionId', fallbackId.toString());
    }
  };

  const createDummyMessage = async (currentUserId, currentCoachId) => {
    try {
      const dummyMessageData = {
        selectionId: null,
        content: 'System: Initializing chat...',
        senderType: 'USER',
        userId: currentUserId,
        coachId: currentCoachId
      };
      const createResponse = await axiosInstance.post('/api/chat/send', dummyMessageData);
      if (createResponse.data?.status === 'success' && createResponse.data.data?.selectionId) {
        const newSelectionId = createResponse.data.data.selectionId;
        setSelectionId(newSelectionId);
        localStorage.setItem('selectionId', newSelectionId.toString());
      }
    } catch {
      const fallbackId = Date.now();
      setSelectionId(fallbackId);
      localStorage.setItem('selectionId', fallbackId.toString());
    }
  };

  const fetchChatHistory = async () => {
    if (!selectionId) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/chat/history/${selectionId}`);

      let messagesData = [];

      if (response.data?.status === 'success' && response.data.data) {
        messagesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        messagesData = response.data;
      } else if (response.data?.messages && Array.isArray(response.data.messages)) {
        messagesData = response.data.messages;
      }

      let hasNew = false;

      const formatted = messagesData.map(msg => ({
        id: msg.messageId || msg.id || Date.now(),
        text: msg.content || msg.message || '',
        sender:
          msg.senderType === 'MEMBER'
            ? 'user'
            : msg.senderType === 'COACH'
              ? 'coach'
              : (msg.senderType || msg.sender || 'user').toLowerCase(),
        timestamp: msg.sentAt
          ? new Date(msg.sentAt).toLocaleTimeString()
          : new Date().toLocaleTimeString(),
        senderName:
          msg.senderType === 'MEMBER' ||
          msg.senderType === 'USER' ||
          msg.sender === 'user'
            ? user.fullName
            : selectedCoach?.fullName
      }));

      setMessages(prev => {
        const combined = [...prev];

        formatted.forEach(f => {
          const exists = combined.some(p =>
            p.id === f.id ||
            (
              p.text === f.text &&
              p.sender === f.sender &&
              Math.abs(new Date(`1970/01/01 ${p.timestamp}`).getTime() -
                       new Date(`1970/01/01 ${f.timestamp}`).getTime()) < 3000
            )
          );
          if (!exists) {
            combined.push(f);
            hasNew = true;
          }
        });

        if (!hasNew) {
          return prev;
        }

        return combined;
      });

      hasNewMessageRef.current = hasNew;

    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setConnectionStatus('disconnected');
        return null;
      }

      setConnectionStatus('connecting');
      await WebSocketService.connect(token);

      const subscription = WebSocketService.subscribe(
        `/user/queue/messages/${selectionId}`,
        (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);

            if (receivedMessage.senderType !== 'COACH') {
              return;
            }

            const formattedMessage = {
              id: receivedMessage.messageId || Date.now(),
              text: receivedMessage.content,
              sender: 'coach',
              timestamp: new Date().toLocaleTimeString(),
              senderName: selectedCoach?.fullName || 'Coach'
            };

            setMessages(prev => {
              const exists = prev.some(msg =>
                msg.id === formattedMessage.id ||
                (
                  msg.text === formattedMessage.text &&
                  msg.sender === formattedMessage.sender &&
                  Math.abs(new Date(`1970/01/01 ${msg.timestamp}`).getTime() -
                           new Date(`1970/01/01 ${formattedMessage.timestamp}`).getTime()) < 3000
                )
              );
              if (exists) {
                return prev;
              }
              hasNewMessageRef.current = true;
              return [...prev, formattedMessage];
            });

            if (!chatHistoryLoaded) {
              fetchChatHistory();
              setChatHistoryLoaded(true);
            }

          } catch (error) {
            // no log
          }
        }
      );

      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      return subscription;
    } catch (error) {
      setConnectionStatus('disconnected');
      retryConnect();
      return null;
    }
  };

  const calculateProgress = () => {
    if (!quitDate) return { days: 0, hours: 0, minutes: 0, money: 0 };

    const quit = new Date(quitDate);
    const now = new Date();
    const diff = now - quit;

    if (diff < 0) return { days: 0, hours: 0, minutes: 0, money: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const money = days * 50000;

    return { days, hours, minutes, money };
  };

  const getCompletedPhases = () => {
    const { days } = calculateProgress();
    const phases = [];
    
    // Thay đổi tạm thời để test: 1 phút = 1 ngày (uncomment dòng dưới để test)
    // const testDays = Math.floor((new Date() - new Date(quitDate)) / (1000 * 60)); // 1 phút = 1 ngày
    
    if (days >= 7) phases.push(1);  // Hoặc testDays >= 1 để test nhanh
    if (days >= 14) phases.push(2); // Hoặc testDays >= 2 để test nhanh
    if (days >= 21) phases.push(3); // Hoặc testDays >= 3 để test nhanh
    
    return phases;
  };

  const canShowRating = () => {
    const completedPhases = getCompletedPhases();
    const { days } = calculateProgress();
    
    // Debug info - có thể remove sau khi test xong
    console.log('Debug Rating:', {
      days,
      completedPhases,
      canShow: completedPhases.length > 0,
      quitDate
    });
    
    return completedPhases.length > 0;
  };

  const checkExistingReview = async () => {
    try {
      const coachId = selectedCoach?.coachId || selectedCoach?.userId || selectedCoach?.id;
      if (!coachId) return;
      
      const review = await coachReviewService.getReviewForCoach(coachId);
      setExistingReview(review);
    } catch (error) {
      console.error('Error checking existing review:', error);
      setExistingReview(null);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      if (existingReview) {
        // Update existing review
        const response = await coachReviewService.updateReview(existingReview.reviewId, reviewData);
        if (response?.message === 'Review updated successfully') {
          alert('Đánh giá đã được cập nhật thành công!');
          checkExistingReview();
        }
      } else {
        // Create new review
        const response = await coachReviewService.createReview(reviewData);
        if (response?.message === 'Review submitted successfully') {
          alert('Đánh giá đã được gửi thành công!');
          checkExistingReview();
        }
      }
      setShowRatingModal(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (selectedCoach && membershipStatus) {
      checkExistingReview();
    }
  }, [selectedCoach, membershipStatus]);

  const progress = calculateProgress();

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const currentUserId = user.userId || user.id;
    const currentCoachId = selectedCoach?.coachId || selectedCoach?.userId || selectedCoach?.id;

    if (!currentCoachId) {
      alert('Không thể xác định coach để gửi tin nhắn. Vui lòng thử lại.');
      return;
    }

    const messageData = {
      selectionId,
      content: newMessage.trim(),
      senderType: 'USER',
      userId: currentUserId,
      coachId: currentCoachId
    };

    const optimisticMessage = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      senderName: user.fullName || 'Bạn'
    };

    setMessages(prev => [...prev, optimisticMessage]);
    const originalMessage = newMessage;
    setNewMessage('');

    try {
      const response = await axiosInstance.post('/api/chat/send', messageData);
      if (response.data.status === 'success') {
        if (response.data.data?.selectionId) {
          const newSelectionId = response.data.data.selectionId;
          if (!selectionId || selectionId !== newSelectionId) {
            setSelectionId(newSelectionId);
            localStorage.setItem('selectionId', newSelectionId.toString());
          }
        }

        if (response.data.data?.messageId) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === optimisticMessage.id
                ? { ...msg, id: response.data.data.messageId }
                : msg
            )
          );
        }
      } else {
        throw new Error();
      }
    } catch {
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setNewMessage(originalMessage);
      alert('Không thể gửi tin nhắn lúc này. Vui lòng thử lại sau.');
    }
  };

  if (checkingMembership) {
    return (
      <>
        <Header />
        <div className="progress-bg">
          <div className="progress-container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang kiểm tra gói membership...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!membershipStatus) {
    return (
      <>
        <Header />
        <div className="progress-bg">
          <div className="progress-container">
            <div className="notify-card">
              <div className="notify-icon">🔒</div>
              <h2>Chưa có gói thành viên</h2>
              <p>Bạn cần mua gói membership để sử dụng các tính năng theo dõi tiến trình và nhận hỗ trợ từ coach.</p>
              <div className="notify-actions">
                <button className="btn-main" onClick={() => navigate('/payment')}>
                  Mua gói membership
                </button>
                <button className="btn-secondary" onClick={() => navigate('/home')}>
                  Về trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!selectedCoach) {
    return (
      <>
        <Header />
        <div className="progress-bg">
          <div className="progress-container">
            <div className="notify-card">
              <div className="notify-icon">👤</div>
              <h2>Chưa chọn coach</h2>
              <p>Bạn cần chọn coach để bắt đầu hành trình cùng chuyên gia đồng hành.</p>
              <div className="notify-actions">
                <button className="btn-main" onClick={() => navigate('/coach-payment')}>
                  Chọn Coach ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="progress-bg">
        <div className="progress-container">
          <div className="progress-header">
            <div className="coach-info">
            <div className="coach-avatar">
              {selectedCoach.imageUrl ? (
                <img
                  src={`data:image/jpeg;base64,${selectedCoach.imageUrl}`}
                  alt="avatar"
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%', border: '1.5px solid #fff', background: '#fff' }}
                />
              ) : (
                selectedCoach.fullName?.charAt(0)?.toUpperCase() || 'C'
              )}
            </div>
            <div>
              
              <h2>Hành trình cai thuốc cùng {selectedCoach.fullName}</h2>
              <p>Coach đã đồng hành: {selectedCoach.yearsOfExperience || 'N/A'} năm kinh nghiệm</p>
              {existingReview && (
                <div className="existing-review-info">
                  <span>Đã đánh giá: {Array.from({length: existingReview.rating}, (_, i) => '⭐').join('')}</span>
                </div>
              )}
            </div>
            </div>
            <div className="header-actions">
              <div className="quit-date-input">
                <label>Ngày bắt đầu cai thuốc:</label>
                <input type="date" value={quitDate} onChange={(e) => setQuitDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
              </div>
              
              {/* Button test - xóa sau khi test xong */}
              <button 
                className="test-btn"
                onClick={() => {
                  const testDate = new Date();
                  testDate.setDate(testDate.getDate() - 8); // 8 ngày trước
                  setQuitDate(testDate.toISOString().split('T')[0]);
                }}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                🧪 Test (8 ngày)
              </button>
              
              {canShowRating() && (
                <button 
                  className="rating-btn"
                  onClick={() => setShowRatingModal(true)}
                >
                  {existingReview ? '✏️ Sửa đánh giá' : '⭐ Đánh giá Coach'}
                </button>
              )}
            </div>
          </div>

          <div className="progress-stats">
            <div className="stat-card"><h3>{progress.days}</h3><p>Ngày không khói thuốc</p></div>
            
            
            {/* Debug card - xóa sau khi test xong */}
            <div className="stat-card debug-card" style={{border: '2px dashed #f39c12', backgroundColor: '#fff9e6'}}>
              <h3>{getCompletedPhases().length}</h3>
              <p>Giai đoạn hoàn thành</p>
              <small style={{fontSize: '0.8rem', color: '#666'}}>
                Rating: {canShowRating() ? 'Có thể' : 'Chưa thể'}
              </small>
            </div>
          </div>

          <div className="progress-tabs">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => handleTabChange('overview')}>📊 Tổng quan</button>
            <button className={activeTab === 'plan' ? 'active' : ''} onClick={() => handleTabChange('plan')}>📋 Kế hoạch</button>
            <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => handleTabChange('chat')}>💬 Chat với Coach</button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <h3>🎯 Mục tiêu của bạn</h3>
                <div className="goals-grid">
                  <div className="goal-item"><span className="goal-icon">🚭</span><div><h4>Hoàn toàn không hút thuốc</h4><p>30 ngày liên tục</p></div></div>
                  <div className="goal-item"><span className="goal-icon">💰</span><div><h4>Tiết kiệm 1,500,000₫</h4><p>Trong 30 ngày</p></div></div>
                  <div className="goal-item"><span className="goal-icon">❤️</span><div><h4>Cải thiện sức khỏe</h4><p>Phổi sạch hơn, hơi thở dễ dàng</p></div></div>
                </div>
              </div>
            )}

            {activeTab === 'plan' && (
              <div className="plan-content">
                <h3>📋 Kế hoạch cai thuốc 3 giai đoạn</h3>
                <div className="phases-container">
                  <div className={`phase-card ${getCompletedPhases().includes(1) ? 'completed' : progress.days >= 7 ? 'current' : 'upcoming'}`}>
                    <div className="phase-header">
                      <div className="phase-icon">
                        {getCompletedPhases().includes(1) ? '✅' : '🎯'}
                      </div>
                      <div className="phase-title">
                        <h4>Giai đoạn 1: Khởi đầu (0-7 ngày)</h4>
                        <p className="phase-status">
                          {getCompletedPhases().includes(1) ? 'Hoàn thành' : 
                           progress.days < 7 ? `Còn ${7 - progress.days} ngày` : 'Sẵn sàng hoàn thành'}
                        </p>
                      </div>
                    </div>
                    <div className="phase-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${Math.min((progress.days / 7) * 100, 100)}%`}}
                        ></div>
                      </div>
                      <span className="progress-text">{Math.min(progress.days, 7)}/7 ngày</span>
                    </div>
                    <ul className="phase-tasks">
                      <li className={progress.days >= 1 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 1 ? '✅' : '⏳'}</span>
                        Xác định lý do cai thuốc
                      </li>
                      <li className={progress.days >= 2 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 2 ? '✅' : '⏳'}</span>
                        Loại bỏ thuốc lá khỏi nhà
                      </li>
                      <li className={progress.days >= 4 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 4 ? '✅' : '⏳'}</span>
                        Thay đổi thói quen hàng ngày
                      </li>
                      <li className={progress.days >= 7 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 7 ? '✅' : '⏳'}</span>
                        Tìm hoạt động thay thế
                      </li>
                    </ul>
                  </div>

                  <div className={`phase-card ${getCompletedPhases().includes(2) ? 'completed' : progress.days >= 14 ? 'current' : progress.days >= 7 ? 'upcoming' : 'locked'}`}>
                    <div className="phase-header">
                      <div className="phase-icon">
                        {getCompletedPhases().includes(2) ? '✅' : progress.days >= 7 ? '🎯' : '🔒'}
                      </div>
                      <div className="phase-title">
                        <h4>Giai đoạn 2: Vượt qua cơn thèm (7-14 ngày)</h4>
                        <p className="phase-status">
                          {getCompletedPhases().includes(2) ? 'Hoàn thành' : 
                           progress.days < 7 ? 'Chưa mở khóa' :
                           progress.days < 14 ? `Còn ${14 - progress.days} ngày` : 'Sẵn sàng hoàn thành'}
                        </p>
                      </div>
                    </div>
                    <div className="phase-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: progress.days >= 7 ? `${Math.min(((progress.days - 7) / 7) * 100, 100)}%` : '0%'}}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {progress.days >= 7 ? Math.min(progress.days - 7, 7) : 0}/7 ngày
                      </span>
                    </div>
                    <ul className="phase-tasks">
                      <li className={progress.days >= 8 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 8 ? '✅' : '⏳'}</span>
                        Luyện tập thở sâu khi thèm thuốc
                      </li>
                      <li className={progress.days >= 10 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 10 ? '✅' : '⏳'}</span>
                        Uống nhiều nước, ăn trái cây
                      </li>
                      <li className={progress.days >= 12 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 12 ? '✅' : '⏳'}</span>
                        Tập thể dục nhẹ hàng ngày
                      </li>
                      <li className={progress.days >= 14 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 14 ? '✅' : '⏳'}</span>
                        Tránh môi trường có khói thuốc
                      </li>
                    </ul>
                  </div>

                  <div className={`phase-card ${getCompletedPhases().includes(3) ? 'completed' : progress.days >= 21 ? 'current' : progress.days >= 14 ? 'upcoming' : 'locked'}`}>
                    <div className="phase-header">
                      <div className="phase-icon">
                        {getCompletedPhases().includes(3) ? '✅' : progress.days >= 14 ? '🎯' : '🔒'}
                      </div>
                      <div className="phase-title">
                        <h4>Giai đoạn 3: Tạo thói quen mới (14-21 ngày)</h4>
                        <p className="phase-status">
                          {getCompletedPhases().includes(3) ? 'Hoàn thành' : 
                           progress.days < 14 ? 'Chưa mở khóa' :
                           progress.days < 21 ? `Còn ${21 - progress.days} ngày` : 'Sẵn sàng hoàn thành'}
                        </p>
                      </div>
                    </div>
                    <div className="phase-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: progress.days >= 14 ? `${Math.min(((progress.days - 14) / 7) * 100, 100)}%` : '0%'}}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {progress.days >= 14 ? Math.min(progress.days - 14, 7) : 0}/7 ngày
                      </span>
                    </div>
                    <ul className="phase-tasks">
                      <li className={progress.days >= 16 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 16 ? '✅' : '⏳'}</span>
                        Duy trì lối sống lành mạnh
                      </li>
                      <li className={progress.days >= 18 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 18 ? '✅' : '⏳'}</span>
                        Tham gia hoạt động xã hội
                      </li>
                      <li className={progress.days >= 20 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 20 ? '✅' : '⏳'}</span>
                        Theo dõi tiến trình hàng ngày
                      </li>
                      <li className={progress.days >= 21 ? 'completed' : ''}>
                        <span className="task-icon">{progress.days >= 21 ? '✅' : '⏳'}</span>
                        Tự thưởng khi đạt mục tiêu
                      </li>
                    </ul>
                  </div>

                  {getCompletedPhases().length > 0 && (
                    <div className="achievement-banner">
                      <div className="achievement-icon">🏆</div>
                      <div className="achievement-text">
                        <h4>Chúc mừng bạn!</h4>
                        <p>Bạn đã hoàn thành {getCompletedPhases().length} giai đoạn. Hãy đánh giá coach để chia sẻ trải nghiệm!</p>
                      </div>
                      <button 
                        className="achievement-btn"
                        onClick={() => setShowRatingModal(true)}
                      >
                        {existingReview ? 'Sửa đánh giá' : 'Đánh giá ngay'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="chat-content">
                <div className="chat-header">
                  <h3>💬 Trò chuyện với Coach {selectedCoach.fullName}</h3>
                </div>
                <div className="chat-container">
                  <div className="messages-list">
                    {messages.map(message => (
                      <div key={message.id} className={`message ${message.sender}`}>
                        <div className="message-content">
                          <div className="message-header">
                            <strong>{message.senderName}</strong>
                            <span className="timestamp">{message.timestamp}</span>
                          </div>
                          <p>{message.text}</p>
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && !loading && (
                      <div className="no-messages">
                        <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện với coach!</p>
                      </div>
                    )}
                    {loading && (
                      <div className="loading-state">
                        <p>Đang tải lịch sử chat...</p>
                      </div>
                    )}
                    <div ref={messagesEndRef}></div>
                  </div>
                  <div className="message-input">
                    <input
                      type="text"
                      placeholder={selectionId ? "Nhập tin nhắn cho coach..." : "Đang tải... vui lòng đợi"}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={loading || !selectionId}
                    />
                    <button onClick={handleSendMessage} disabled={!newMessage.trim() || loading || !selectionId}>
                      {loading ? 'Đang gửi...' : 'Gửi'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CoachRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        coach={selectedCoach}
        onSubmit={handleSubmitReview}
        existingReview={existingReview}
      />
    </>
  );
}

export default Progress;
