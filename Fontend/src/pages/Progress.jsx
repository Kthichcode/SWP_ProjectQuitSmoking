import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import axiosInstance from '../../axiosInstance';
import WebSocketService from '../services/websocketService';
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

  const messagesEndRef = useRef(null);

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
    if (selectionId && activeTab === 'chat' && !chatHistoryLoaded) {
      fetchChatHistory();
      connectWebSocket();
      setChatHistoryLoaded(true);

      return () => {
        WebSocketService.unsubscribe(`/user/queue/messages/${selectionId}`);
      };
    }
  }, [selectionId, activeTab, chatHistoryLoaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'chat') {
      setChatHistoryLoaded(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        if (prev.length === formatted.length) {
          const changed = formatted.some(
            (msg, i) => msg.id !== prev[i].id || msg.text !== prev[i].text
          );
          return changed ? formatted : prev;
        }
        return formatted;
      });

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
        return;
      }
      setConnectionStatus('connecting');
      await WebSocketService.connect(token);

      const subscription = WebSocketService.subscribe(`/user/queue/messages/${selectionId}`, (message) => {
        try {
          const receivedMessage = JSON.parse(message.body);
          const formattedMessage = {
            id: receivedMessage.messageId || Date.now(),
            text: receivedMessage.content,
            sender: receivedMessage.senderType === 'MEMBER' ? 'user' : (receivedMessage.senderType === 'COACH' ? 'coach' : receivedMessage.senderType?.toLowerCase()),
            timestamp: new Date().toLocaleTimeString(),
            senderName: (receivedMessage.senderType === 'MEMBER' || receivedMessage.senderType === 'USER') ? user.fullName : selectedCoach?.fullName
          };

          setMessages(prev => {
            const exists = prev.some(msg => msg.id === formattedMessage.id || (msg.text === formattedMessage.text && msg.sender === formattedMessage.sender));
            return exists ? prev : [...prev, formattedMessage];
          });

        } catch {}
      });

      setConnectionStatus(subscription ? 'connected' : 'disconnected');
    } catch {
      setConnectionStatus('disconnected');
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

        if (WebSocketService.isConnectedToServer()) {
          WebSocketService.sendMessage('/app/chat.send', {
            ...messageData,
            messageId: response.data.data?.messageId,
            selectionId: response.data.data?.selectionId || selectionId
          });
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
            <div className="error-container">
              <div className="error-message">
                <h3>🔒 Cần có gói membership để theo dõi tiến trình</h3>
                <p>Bạn cần mua gói membership trước khi sử dụng tính năng này.</p>
                <div style={{ marginTop: '20px' }}>
                  <button className="btn-select-coach-redirect" onClick={() => navigate('/payment')} style={{ marginRight: '10px' }}>
                    Mua gói membership ngay
                  </button>
                  <button className="btn-select-coach-redirect" onClick={() => navigate('/home')} style={{ background: '#6c757d' }}>
                    Về trang chủ
                  </button>
                </div>
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
            <div className="no-coach-message">
              <h3>🔍 Chưa chọn coach</h3>
              <p>Bạn cần chọn coach trước khi sử dụng tính năng này.</p>
              <button className="btn-select-coach-redirect" onClick={() => navigate('/coach-payment')}>
                Chọn Coach ngay
              </button>
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
                {selectedCoach.fullName?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div>
                <h2>Hành trình cai thuốc cùng {selectedCoach.fullName}</h2>
                <p>Coach đã đồng hành: {selectedCoach.yearsOfExperience || 'N/A'} năm kinh nghiệm</p>
              </div>
            </div>
            <div className="quit-date-input">
              <label>Ngày bắt đầu cai thuốc:</label>
              <input type="date" value={quitDate} onChange={(e) => setQuitDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div className="progress-stats">
            <div className="stat-card"><h3>{progress.days}</h3><p>Ngày không khói thuốc</p></div>
            <div className="stat-card"><h3>{progress.hours}</h3><p>Giờ sạch phổi</p></div>
            <div className="stat-card"><h3>{progress.minutes}</h3><p>Phút tích cực</p></div>
            <div className="stat-card highlight"><h3>{progress.money.toLocaleString()}₫</h3><p>Tiền đã tiết kiệm</p></div>
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
                <h3>📋 Kế hoạch cai thuốc 30 ngày</h3>
                <div className="plan-timeline">
                  <div className="plan-week"><h4>Tuần 1: Chuẩn bị tinh thần</h4><ul><li>✅ Xác định lý do cai thuốc</li><li>✅ Loại bỏ thuốc lá khỏi nhà</li><li>⏳ Thay đổi thói quen hàng ngày</li><li>⏳ Tìm hoạt động thay thế</li></ul></div>
                  <div className="plan-week"><h4>Tuần 2: Vượt qua cơn thèm</h4><ul><li>⏳ Luyện tập thở sâu</li><li>⏳ Uống nhiều nước</li><li>⏳ Tập thể dục nhẹ</li><li>⏳ Tránh môi trường có khói thuốc</li></ul></div>
                  <div className="plan-week"><h4>Tuần 3-4: Tạo thói quen mới</h4><ul><li>⏳ Duy trì lối sống lành mạnh</li><li>⏳ Tham gia hoạt động xã hội</li><li>⏳ Theo dõi tiến trình hàng ngày</li><li>⏳ Tự thưởng khi đạt mục tiêu</li></ul></div>
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
    </>
  );
}

export default Progress;
