import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import axiosInstance from '../../axiosInstance';
import WebSocketService from '../services/websocketService';
import coachReviewService from '../services/coachReviewService';
import CoachRatingModal from '../components/CoachRatingModal';
import QuitPlanSummary from './QuitPlanSummary';
import PlanStages from './PlanStages';
import '../assets/CSS/Progress.css';

// Helper: lưu selectionId riêng cho từng user
const getSelectionStorageKey = (userId) => `selectionId_${userId}`;

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
  const [unreadCount, setUnreadCount] = useState(0);

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

  /**
   * FIXED HERE:
   * Load coach info từ selectionId
   */
  const loadCoachInfo = () => {
    const selectionIdFromState = location.state?.selectionId;
    if (selectionIdFromState) {
      setSelectionId(selectionIdFromState);
      const currentUserId = user.userId || user.id;
      localStorage.setItem(getSelectionStorageKey(currentUserId), selectionIdFromState.toString());
    } else {
      const currentUserId = user.userId || user.id;
      const savedSelectionId = localStorage.getItem(getSelectionStorageKey(currentUserId));
      if (savedSelectionId) {
        setSelectionId(parseInt(savedSelectionId));
      } else {
        // NEW: GỌI API để lấy selectionId
        fetchSelectionIdOfCurrentUser();
      }
    }
  };

  const fetchSelectionIdOfCurrentUser = async () => {
    try {
      const res = await axiosInstance.get("/api/membercoachselection/selection-id/me");
      if (res.data?.status === 'success') {
        if (res.data.data != null) {
          const currentUserId = user.userId || user.id;
          setSelectionId(res.data.data);
          localStorage.setItem(getSelectionStorageKey(currentUserId), res.data.data.toString());
        } else {
          await createDummyMessage();
        }
      }
    } catch (error) {
      console.error("Error fetching selectionId of current user:", error);
    }
  };

  // NEW: Load coach từ API backend
  useEffect(() => {
    if (selectionId) {
      fetchCoachBySelectionId(selectionId);
    }
  }, [selectionId]);

  const fetchCoachBySelectionId = async (selectionId) => {
    try {
      const res = await axiosInstance.get(`/api/coach/getCoachBySelectionId/${selectionId}`);
      if (res.data?.status === 'success' && res.data.data) {
        setSelectedCoach(res.data.data);
      } else {
        console.error('Không tìm thấy coach từ selectionId');
        setSelectedCoach(null);
      }
    } catch (error) {
      console.error('Lỗi khi gọi API getCoachBySelectionId:', error);
      setSelectedCoach(null);
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
    if (activeTab === 'chat') {
      setUnreadCount(0); // reset badge mỗi lần vào tab chat
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
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentNode;
    if (container && container.classList.contains('messages-list')) {
      container.scrollTop = container.scrollHeight;
    }
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
        localStorage.setItem(getSelectionStorageKey(currentUserId), realSelectionId.toString());
      } else {
        await createDummyMessage();
      }
    } catch {
      const fallbackId = Date.now();
      setSelectionId(fallbackId);
      const currentUserId = user.userId || user.id;
      localStorage.setItem(getSelectionStorageKey(currentUserId), fallbackId.toString());
    }
  };

  const createDummyMessage = async () => {
    try {
      const currentUserId = user.userId || user.id;
      const currentCoachId = selectedCoach?.coachId || selectedCoach?.userId || selectedCoach?.id;
      if (!currentUserId || !currentCoachId) return;

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
        localStorage.setItem(getSelectionStorageKey(currentUserId), newSelectionId.toString());
      }
    } catch {
      const fallbackId = Date.now();
      setSelectionId(fallbackId);
      const currentUserId = user.userId || user.id;
      localStorage.setItem(getSelectionStorageKey(currentUserId), fallbackId.toString());
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
          ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
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
                const exists = combined.some(p => p.id === f.id);
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
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
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

            handleWebSocketMessage(formattedMessage);

          } catch {
            // ignore parse error
          }
        }
      );

      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      return subscription;
    } catch {
      setConnectionStatus('disconnected');
      retryConnect();
      return null;
    }
  };

  // Đồng bộ logic unreadCount với Messages.jsx: chỉ tăng nếu không ở tab chat, nếu đang ở tab chat thì reset về 0
  const handleWebSocketMessage = (message) => {
    if (message.sender === 'coach') {
      if (activeTab === 'chat') {
        setUnreadCount(0); // reset badge ngay khi nhận tin nhắn nếu đang ở tab chat
      } else {
        setUnreadCount((prev) => prev + 1);
      }
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

    if (days >= 7) phases.push(1);
    if (days >= 14) phases.push(2);
    if (days >= 21) phases.push(3);

    return phases;
  };

  const canShowRating = () => {
    const completedPhases = getCompletedPhases();
    return completedPhases.length > 0;
  };

  const checkExistingReview = async () => {
    try {
      const coachId = selectedCoach?.coachId || selectedCoach?.userId || selectedCoach?.id;
      if (!coachId) return;

      const review = await coachReviewService.getReviewForCoach(coachId);
      setExistingReview(review);
    } catch {
      setExistingReview(null);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      if (existingReview) {
        const response = await coachReviewService.updateReview(existingReview.reviewId, reviewData);
        if (response?.message === 'Review updated successfully') {
          alert('Đánh giá đã được cập nhật thành công!');
          checkExistingReview();
        }
      } else {
        const response = await coachReviewService.createReview(reviewData);
        if (response?.message === 'Review submitted successfully') {
          alert('Đánh giá đã được gửi thành công!');
          checkExistingReview();
        }
      }
      setShowRatingModal(false);
    } catch (error) {
      alert('Lỗi khi gửi đánh giá. Vui lòng thử lại sau.');
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
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
            localStorage.setItem(getSelectionStorageKey(currentUserId), newSelectionId.toString());
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

  // Khi chuyển sang tab chat, reset số tin nhắn chưa đọc
  useEffect(() => {
    if (activeTab === 'chat') {
      setUnreadCount(0);
    }
  }, [activeTab]);

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
                    <span>Đã đánh giá: {Array.from({ length: existingReview.rating }, (_, i) => '⭐').join('')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="header-actions"> 
              <QuitPlanSummary />
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
            <div className="stat-card debug-card" style={{ border: '2px dashed #f39c12', backgroundColor: '#fff9e6' }}>
              <h3>{getCompletedPhases().length}</h3>
              <p>Giai đoạn hoàn thành</p>
              <small style={{ fontSize: '0.8rem', color: '#666' }}>
                Rating: {canShowRating() ? 'Có thể' : 'Chưa thể'}
              </small>
            </div>
          </div>

          <div className="progress-tabs">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => handleTabChange('overview')}>
              <span role="img" aria-label="Tổng quan">📊</span> Tổng quan
            </button>
            <button className={activeTab === 'plan' ? 'active' : ''} onClick={() => handleTabChange('plan')}>
              <span role="img" aria-label="Kế hoạch">📋</span> Kế hoạch
            </button>
            <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => handleTabChange('chat')} style={{ position: 'relative' }}>
              <span role="img" aria-label="Chat">💬</span> Chat với Coach
              {unreadCount > 0 && (
                <span className="unread-dot" style={{
                  position: 'absolute',
                  top: 6,
                  right: 10,
                  background: '#e74c3c',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '2px 7px',
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                }}>{unreadCount}</span>
              )}
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <h3>🎯 Mục tiêu của bạn</h3>
                {/* Hiển thị tổng quan kế hoạch cai thuốc từ QuitPlanSummary hoặc dữ liệu động */}
                <QuitPlanSummary />
              </div>
            )}

            {activeTab === 'plan' && (
              <div className="plan-content">
                <PlanStages />
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
                        <div className={`message-content ${message.sender === 'user' ? 'message-user' : 'message-coach'}`}>
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
