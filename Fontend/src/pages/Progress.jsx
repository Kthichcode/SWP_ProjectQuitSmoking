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
import DailyDeclarationForm from '../components/DailyDeclarationForm';
import '../assets/CSS/Progress.css';

import DailyLogsHistory from './DailyLogsHistory';

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
  const [stages, setStages] = useState([]);
  const [expandedStage, setExpandedStage] = useState(null);
  const [loadingCoach, setLoadingCoach] = useState(true);
  const [retryingStage, setRetryingStage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const areAllStagesCompleted = () => {
    if (stages.length < 3) return false;
    return stages.every(stage => (stage.progressPercentage ?? 0) === 100 || stage.status === 'completed');
  };
  const getStageStatusLabel = (status) => {
  switch (status) {
    case 'completed':
      return 'Hoàn thành';
    case 'active':
      return 'Đang thực hiện';
    case 'inactive':
      return 'Đang tạm dừng';
    case 'pending':
      return 'Đang chờ';
    case null:
    case undefined:
      return 'Chưa bắt đầu';
    case 'cancelled':
      return 'Thất bại';
    default:
      return 'Chưa bắt đầu';
  }
};

const getStageDotColor = (status) => {
  switch (status) {
    case 'completed':
      return '#2ecc40';     
    case 'active':
      return '#3498db';     
    case 'inactive':
      return '#f1c40f';   
    case 'cancelled':
      return '#e74c3c';    
    default:
      return '#bdc3c7';     
  }
};
  useEffect(() => {
    if (activeTab !== 'overview') return;
    const fetchStages = async () => {
      try {
        const res = await axiosInstance.get('/api/quitplan/stages/my');
        if (Array.isArray(res.data)) {
          setStages(res.data);
        } else if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
          setStages(res.data.data);
        } else {
          setStages([]);
        }
      } catch {
        setStages([]);
      }
    };
    fetchStages();
  }, [activeTab]);

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

  useEffect(() => {
    if (!checkingMembership && !membershipStatus) {
      navigate('/payment', { replace: true });
    }
  }, [checkingMembership, membershipStatus, navigate]);

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
        // Không có selectionId, fetch từ API
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
          // Chưa chọn coach, set loading = false để hiện modal chưa chọn coach
          setLoadingCoach(false);
        }
      } else {
        // API response không thành công, có thể chưa chọn coach
        setLoadingCoach(false);
      }
    } catch (error) {
      console.error("Error fetching selectionId of current user:", error);
      // Có lỗi khi gọi API, có thể chưa chọn coach
      setLoadingCoach(false);
    }
  };
  useEffect(() => {
    if (selectionId) {
      fetchCoachBySelectionId(selectionId);
    }
  }, [selectionId]);

  const fetchCoachBySelectionId = async (selectionId) => {
    try {
      setLoadingCoach(true);
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
    } finally {
      setLoadingCoach(false);
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
      setUnreadCount(0); 
      scrollToBottom();
      hasNewMessageRef.current = false;
    }
  }, [messages, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'chat') {
      setChatHistoryLoaded(false);
    } else if (tab === 'chat' && selectionId) {
      // Mark messages as read when switching to chat tab
      markConversationAsRead(selectionId);
    }
  };

  const markConversationAsRead = async (selectionId) => {
    try {
      await axiosInstance.put(`/api/chat/mark-read/${selectionId}`);
      console.log(`Marked messages as read for selection ${selectionId}`);
    } catch (e) {
      console.error('Error marking messages as read:', e);
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

      const formatted = messagesData.map(msg => {
        let senderType = msg.senderType || 'MEMBER';
        let senderName;
        if (senderType === 'MEMBER') {
          senderName = user.fullName || 'Bạn';
        } else if (senderType === 'COACH') {
          senderName = selectedCoach?.fullName || 'Coach';
        } else {
          senderName = senderType;
        }
        return {
          id: msg.messageId || msg.id || Date.now(),
          content: msg.content || msg.message || '',
          senderType,
          timestamp: msg.sentAt || new Date().toISOString(),
          senderName
        };
      });

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

            // User side chỉ nhận tin nhắn từ COACH
            if (receivedMessage.senderType !== 'COACH') {
              return;
            }

            const formattedMessage = {
              id: receivedMessage.messageId || Date.now(),
              content: receivedMessage.content,
              senderType: receivedMessage.senderType,
              timestamp: receivedMessage.sentAt || new Date().toISOString(),
              senderName: selectedCoach?.fullName || 'Coach'
            };

            setMessages(prev => {
              const exists = prev.some(msg =>
                msg.id === formattedMessage.id ||
                (
                  msg.content === formattedMessage.content &&
                  msg.senderType === formattedMessage.senderType &&
                  Math.abs(new Date(msg.timestamp).getTime() - new Date(formattedMessage.timestamp).getTime()) < 3000
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
    if (message.senderType === 'COACH') {
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

  // Cho phép rating nếu có ít nhất một giai đoạn hoàn thành
  const canShowRating = () => {
    if (!stages || stages.length === 0) return false;
    return stages.some(stage => (stage.progressPercentage ?? 0) === 100 || stage.status === 'completed');
  };

  const showNotification = (message, type = 'info', duration = 4000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  const handleRetryStage = async (stageId) => {
    try {
      setRetryingStage(stageId);
      const response = await axiosInstance.post(`/api/quitplan/quit-plan-stages/${stageId}/retry-request`);
      
      console.log('Retry response:', response.data);
      
      // Check multiple possible success indicators
      if (response.data?.status === 'success' || 
          response.status === 200 || 
          response.data?.message?.includes('được gửi đến huấn luyện viên') ||
          response.data?.message?.includes('sent to coach')) {
        
        // Refresh stages data
        const res = await axiosInstance.get('/api/quitplan/stages/my');
        if (Array.isArray(res.data)) {
          setStages(res.data);
        } else if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
          setStages(res.data.data);
        }
        
        // Use the actual message from API or fallback message
        const successMessage = response.data?.message || 'Yêu cầu làm lại đã được gửi thành công!';
        showNotification(successMessage, 'success', 5000);
      } else {
        console.error('Unexpected response structure:', response.data);
        showNotification('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      console.error('Error retrying stage:', error);
      console.error('Error response:', error.response?.data);
      showNotification('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.', 'error');
    } finally {
      setRetryingStage(null);
    }
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

  // Thông báo UI cho kết quả rating
  const [ratingMessage, setRatingMessage] = useState('');
  const [ratingType, setRatingType] = useState('success'); // 'success' | 'error'

  const handleSubmitReview = async (reviewData) => {
    try {
      if (existingReview) {
        const response = await coachReviewService.updateReview(existingReview.reviewId, reviewData);
        if (response?.message === 'Review updated successfully') {
          setRatingMessage('Đánh giá đã được cập nhật thành công!');
          setRatingType('success');
          checkExistingReview();
        }
      } else {
        const response = await coachReviewService.createReview(reviewData);
        if (response?.message === 'Review submitted successfully') {
          setRatingMessage('Đánh giá đã được gửi thành công!');
          setRatingType('success');
          checkExistingReview();
        }
      }
      setTimeout(() => {
        setRatingMessage('');
        setShowRatingModal(false);
      }, 1800);
    } catch (error) {
      if (error?.response?.status === 500 && error?.response?.data?.message?.includes('already reviewed')) {
        setRatingMessage('Bạn đã đánh giá coach này trước đó.');
        setRatingType('error');
        setTimeout(() => {
          setRatingMessage('');
          setShowRatingModal(false);
        }, 2200);
      } else {
        setRatingMessage('Lỗi khi gửi đánh giá. Vui lòng thử lại sau.');
        setRatingType('error');
        setTimeout(() => {
          setRatingMessage('');
          setShowRatingModal(false);
        }, 2200);
      }
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
      showNotification('Không thể xác định coach để gửi tin nhắn. Vui lòng thử lại.', 'error');
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
      content: newMessage.trim(),
      senderType: 'MEMBER',
      timestamp: new Date().toISOString(),
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
      showNotification('Không thể gửi tin nhắn lúc này. Vui lòng thử lại sau.', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      setUnreadCount(0);
    }
  }, [activeTab]);

  // Kiểm tra và hiển thị thông báo chúc mừng khi hoàn thành cả 3 giai đoạn
  useEffect(() => {
    if (stages.length >= 3 && areAllStagesCompleted()) {
      const hasShownCongrats = localStorage.getItem(`congratulations_shown_${user?.userId || user?.id}`);
      if (!hasShownCongrats) {
        setShowCongratulations(true);
        localStorage.setItem(`congratulations_shown_${user?.userId || user?.id}`, 'true');
      }
    }
  }, [stages, user]);

  

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
                  <button className="btn-main" onClick={() => window.location.href = '/payment'}>
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

  

  if (loadingCoach) {
    return (
      <>
        <Header />
        <div className="progress-bg">
          <div className="progress-container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p style={{ color: '#666', fontSize: '16px', marginTop: '16px' }}>Đang tải thông tin coach...</p>
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
                    style={{ width: 135, height: 135, objectFit: 'cover', borderRadius: '50%', border: '2.5px solid #fff', background: '#fff', boxShadow: '0 2px 12px rgba(44,62,80,0.10)' }}
                  />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eaf6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#667eea', fontWeight: 700 }}>
                    {selectedCoach.fullName?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
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

          

          <div className="progress-tabs">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => handleTabChange('overview')}>
              <span role="img" aria-label="Tổng quan">📊</span> Tổng quan
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
                              
                <div style={{ marginTop: 0 }}>
                  <h3 style={{ marginBottom: 24 }}>Các giai đoạn thực hiện</h3>
                  {stages.length === 0 && (
                    <div style={{ color: '#888', margin: '16px 0' }}>Chưa có dữ liệu tiến trình.</div>
                  )}
                  <div className="timeline-stages">
                    {stages.map((stage, idx) => {
                      // Icon trạng thái
                      let icon, iconColor;
                      if (stage.status === 'completed') {
                        icon = '✔️'; iconColor = '#2ecc40';
                      } else if (stage.status === 'active') {
                        icon = '🔥'; iconColor = '#3498db';
                      } else if (stage.status === 'inactive') {
                        icon = '⏸️'; iconColor = '#f1c40f';
                      } else if (stage.status === 'cancelled') {
                        icon = '❌'; iconColor = '#e74c3c';
                      } else {
                        icon = '⏳'; iconColor = '#bdc3c7';
                      }
                      const progressPercent = stage.progressPercentage ?? 0;
                      return (
                        <div key={stage.stageId} className="timeline-stage-card" style={{
                          position: 'relative',
                          border: 'none',
                          borderRadius: 16,
                          marginBottom: 32,
                          background: expandedStage === stage.stageId ? 'linear-gradient(90deg,#eaf6ff 60%,#f6fcfa 100%)' : '#fff',
                          boxShadow: expandedStage === stage.stageId ? '0 4px 16px rgba(44,62,80,0.10)' : '0 2px 8px rgba(0,0,0,0.03)',
                          transition: 'box-shadow 0.2s',
                          cursor: 'pointer',
                          opacity: stage.status === 'pending' ? 0.7 : 1,
                          borderLeft: `8px solid ${iconColor}`
                        }}
                        onClick={() => setExpandedStage(expandedStage === stage.stageId ? null : stage.stageId)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px 10px 24px' }}>
                            <span style={{ fontSize: 32, marginRight: 18, color: iconColor }}>{icon}</span>
                            <div style={{ flex: 1 }}>
                              <strong style={{ fontSize: 18, color: '#222' }}>Giai đoạn {stage.stageNumber}: </strong>
                              <span style={{ marginLeft: 10, color: iconColor, fontWeight: 500 }}>{getStageStatusLabel(stage.status)}</span>
                              <div style={{ marginTop: 8, width: '100%' }}>
                                <div style={{
                                  height: 10,
                                  borderRadius: 5,
                                  background: '#e0e0e0',
                                  overflow: 'hidden',
                                  position: 'relative',
                                }}>
                                  <div style={{
                                    width: `${progressPercent}%`,
                                    height: '100%',
                                    background: `linear-gradient(90deg,${iconColor} 60%,#fff 100%)`,
                                    transition: 'width 0.6s',
                                    boxShadow: progressPercent === 100 ? '0 0 8px #2ecc40' : undefined
                                  }}></div>
                                </div>
                                <span style={{ fontSize: 13, color: '#666', marginLeft: 2 }}>{progressPercent}% hoàn thành</span>
                              </div>
                            </div>
                            <span style={{ marginLeft: 18, fontSize: 22 }}>{expandedStage === stage.stageId ? '▼' : '▶'}</span>
                          </div>
                          {expandedStage === stage.stageId && (
                            <div style={{ padding: '18px 32px 18px 64px', background: '#f6fcfa', borderTop: `2px solid ${iconColor}` }}>
                              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 12 }}>
                                <div>
                                  <span style={{ fontWeight: 500 }}>Ngày bắt đầu:</span> {stage.startDate}
                                </div>
                                <div>
                                  <span style={{ fontWeight: 500 }}>Ngày kết thúc:</span> {stage.endDate}
                                </div>
                                <div>
                                  <span style={{ fontWeight: 500 }}>Mục tiêu số điếu:</span> {stage.targetCigaretteCount} điếu/ngày
                                </div>
                                <div>
                                  <span style={{ fontWeight: 500 }}>Hoàn thành:</span> {progressPercent}%
                                </div>
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <span style={{ fontWeight: 500 }}>Lời khuyên của Coach:</span>
                                <div style={{ background: '#eaf6ff', padding: 10, borderRadius: 6, marginTop: 4, fontStyle: 'italic', color: '#2d5fa7' }}>{stage.advice}</div>
                              </div>
                              {stage.status === 'cancelled' && (
                                <div style={{ marginTop: 16, textAlign: 'center' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRetryStage(stage.stageId);
                                    }}
                                    disabled={retryingStage === stage.stageId}
                                    style={{
                                      background: retryingStage === stage.stageId ? '#ccc' : '#ff9800',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: 8,
                                      padding: '10px 20px',
                                      fontSize: 14,
                                      fontWeight: 600,
                                      cursor: retryingStage === stage.stageId ? 'not-allowed' : 'pointer',
                                      transition: 'background 0.2s',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (retryingStage !== stage.stageId) {
                                        e.target.style.background = '#f57c00';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (retryingStage !== stage.stageId) {
                                        e.target.style.background = '#ff9800';
                                      }
                                    }}
                                  >
                                    {retryingStage === stage.stageId ? '🔄 Đang gửi...' : '🔄 Gửi yêu cầu làm lại'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                
                {/* Chỉ hiển thị form khai báo khi đã có kế hoạch từ coach */}
                {stages.length > 0 ? (
                  <DailyDeclarationForm />
                ) : (
                  <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '12px',
                    padding: '20px',
                    margin: '24px 0',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
                    <h4 style={{ color: '#856404', margin: '0 0 8px 0' }}>Chờ coach tạo kế hoạch</h4>
                    <p style={{ color: '#856404', margin: 0 }}>
                      Coach đang chuẩn bị kế hoạch cai thuốc phù hợp cho bạn. 
                      Bạn sẽ có thể khai báo hằng ngày khi kế hoạch đã sẵn sàng.
                    </p>
                  </div>
                )}

                
                {/* Chỉ hiển thị lịch sử khai báo khi đã có kế hoạch */}
                {stages.length > 0 && <DailyLogsHistory />}
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
                      <div key={message.id} className={`message ${message.senderType === 'MEMBER' ? 'user' : 'coach'}`}>
                        <div className={`message-content ${message.senderType === 'MEMBER' ? 'message-user' : 'message-coach'}`}>
                          <div className="message-header">
                            <strong>{message.senderName}</strong>
                            <span className="timestamp">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </div>
                          <p>{message.content}</p>
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
        ratingMessage={ratingMessage}
        ratingType={ratingType}
      />

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 10000,
          minWidth: 300,
          maxWidth: 500,
          background: notification.type === 'success' ? 'linear-gradient(135deg, #4caf50, #45a049)' : 
                     notification.type === 'error' ? 'linear-gradient(135deg, #f44336, #d32f2f)' : 
                     'linear-gradient(135deg, #2196f3, #1976d2)',
          color: '#fff',
          padding: '16px 20px',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          animation: 'slideInRight 0.3s ease-out',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12
        }}>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {notification.type === 'success' ? 'Thành công!' : 
               notification.type === 'error' ? 'Lỗi!' : 
               'Thông báo'}
            </div>
            <div style={{ 
              fontSize: 14, 
              lineHeight: 1.4, 
              whiteSpace: 'pre-line',
              opacity: 0.95 
            }}>
              {notification.message}
            </div>
          </div>
          <button 
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 18,
              cursor: 'pointer',
              padding: 4,
              opacity: 0.8,
              borderRadius: 4
            }}
            onMouseEnter={(e) => e.target.style.opacity = 1}
            onMouseLeave={(e) => e.target.style.opacity = 0.8}
          >
            ×
          </button>
        </div>
      )}

      {/* Modal chúc mừng khi hoàn thành cả 3 giai đoạn */}
      {showCongratulations && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div style={{
            background: 'white',
            color: '#333',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            animation: 'congratsAppear 0.5s ease-out'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '28px' }}>Chúc mừng!</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '16px', lineHeight: 1.5 }}>
              Bạn đã hoàn thành cả 3 giai đoạn cai thuốc!<br/>
              Đây là một thành tựu tuyệt vời! 🏆
            </p>
            <button
              onClick={() => setShowCongratulations(false)}
              style={{
                background: '#fff',
                color: 'blue',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              Cảm ơn!
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes congratsAppear {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

export default Progress;
