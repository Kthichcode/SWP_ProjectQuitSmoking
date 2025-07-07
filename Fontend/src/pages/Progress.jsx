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
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting', 'connected', 'disconnected'
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Kiểm tra membership trước khi cho phép sử dụng tính năng
    checkUserMembership();
  }, [user, navigate]);

  const checkUserMembership = async () => {
    try {
      setCheckingMembership(true);
      const currentUserId = user.userId || user.id;
      console.log('Checking membership for Progress page:', currentUserId);
      
      // Sử dụng API check membership
      const response = await axiosInstance.get(`/api/user-memberships/check-active/${currentUserId}`);
      
      console.log('Progress - Membership response:', response.data);
      
      // Check response structure từ UserMembershipController (Boolean response)
      if (response.data && response.data.status === 'success' && response.data.data === true) {
        // User có membership active
        const membershipData = {
          status: 'ACTIVE',
          hasActiveMembership: true
        };
        
        setMembershipStatus(membershipData);
        // Nếu có membership active, tiếp tục load coach info
        loadCoachInfo();
      } else {
        console.log('No active membership found for user:', currentUserId);
        setMembershipStatus(null);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
      
      if (error.response?.status === 404) {
        console.log('No membership found for user:', user.userId || user.id);
        setMembershipStatus(null);
      } else {
        // Cho tất cả các lỗi khác, không cho phép sử dụng tính năng
        console.log('Error occurred, not allowing Progress access for safety...');
        setMembershipStatus(null);
      }
    } finally {
      setCheckingMembership(false);
    }
  };

  const loadCoachInfo = () => {
    // Lấy thông tin coach từ state hoặc localStorage
    const coach = location.state?.selectedCoach;
    const selectionIdFromState = location.state?.selectionId;
    
    if (coach) {
      setSelectedCoach(coach);
      // Lưu vào localStorage để không mất khi refresh
      localStorage.setItem('selectedCoach', JSON.stringify(coach));
      
      if (selectionIdFromState) {
        setSelectionId(selectionIdFromState);
        localStorage.setItem('selectionId', selectionIdFromState.toString());
      }
    } else {
      // Thử lấy từ localStorage
      const savedCoach = localStorage.getItem('selectedCoach');
      const savedSelectionId = localStorage.getItem('selectionId');
      
      if (savedCoach) {
        setSelectedCoach(JSON.parse(savedCoach));
      }
      if (savedSelectionId) {
        setSelectionId(parseInt(savedSelectionId));
      }
    }
  };

  useEffect(() => {
    // Lấy selectionId khi đã có selectedCoach (nếu chưa có từ state/localStorage)
    if (selectedCoach && !selectionId) {
      fetchSelectionId();
    }
  }, [selectedCoach, selectionId]);

  useEffect(() => {
    if (selectionId && activeTab === 'chat') {
      fetchChatHistory();
      // Kết nối WebSocket
      connectWebSocket();
    }
    
    return () => {
      if (activeTab !== 'chat') {
        WebSocketService.unsubscribe(`/user/queue/messages/${selectionId}`);
      }
    };
  }, [selectionId, activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSelectionId = async () => {
    try {
      console.log('Fetching selectionId for coach:', selectedCoach?.userId);
      
      // API để lấy selectionId dựa trên user và coach
      const response = await axiosInstance.get(`/api/users/members/selection-with-coach/${selectedCoach?.userId}`);
      
      console.log('Selection response:', response.data);
      
      if (response.data && response.data.selectionId) {
        setSelectionId(response.data.selectionId);
        localStorage.setItem('selectionId', response.data.selectionId.toString());
        console.log('Got selectionId:', response.data.selectionId);
      } else {
        console.warn('API response missing selectionId, using fallback');
        setSelectionId(Date.now()); // Fallback với timestamp
      }
    } catch (error) {
      console.error('Error fetching selectionId:', error);
      
      if (error.response?.status === 500) {
        console.warn('Backend error 500, this endpoint might not be implemented yet');
      }
      
      console.log('Using fallback selectionId due to API error');
      // Fallback với mock selectionId dựa trên thời gian
      const fallbackId = Date.now();
      setSelectionId(fallbackId);
      localStorage.setItem('selectionId', fallbackId.toString());
    }
  };

  const fetchChatHistory = async () => {
    if (!selectionId) return;
    
    try {
      setLoading(true);
      console.log('Fetching chat history for selectionId:', selectionId);
      
      const response = await axiosInstance.get(`/api/chat/${selectionId}`);
      
      console.log('Chat history response:', response.data);
      
      // Xử lý response linh hoạt cho các format khác nhau
      let messagesData = [];
      
      if (response.data.status === 'success' && response.data.data) {
        messagesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        messagesData = response.data;
      } else if (response.data && Array.isArray(response.data.messages)) {
        messagesData = response.data.messages;
      }
      
      const formattedMessages = messagesData.map(msg => ({
        id: msg.messageId || msg.id || Date.now(),
        text: msg.content || msg.message || '',
        sender: (msg.senderType || msg.sender || 'user').toLowerCase(),
        timestamp: msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
        senderName: (msg.senderType === 'USER' || msg.sender === 'user') ? user.fullName : selectedCoach?.fullName
      }));
      
      setMessages(formattedMessages);
      console.log('Loaded', formattedMessages.length, 'messages');
      
    } catch (error) {
      console.error('Error fetching chat history:', error);
      
      if (error.response?.status === 500) {
        console.warn('Backend error 500, chat history endpoint might not be implemented yet');
      } else if (error.response?.status === 404) {
        console.log('No chat history found, starting fresh');
      }
      
      console.log('Starting with empty chat history due to API error');
      setMessages([]); // Khởi tạo với mảng rỗng
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping WebSocket connection');
        setConnectionStatus('disconnected');
        return;
      }
      
      setConnectionStatus('connecting');
      console.log('Attempting to connect WebSocket...');
      
      await WebSocketService.connect(token);
      
      // Subscribe to messages for this selection
      const subscription = WebSocketService.subscribe(`/user/queue/messages/${selectionId}`, (message) => {
        try {
          const receivedMessage = JSON.parse(message.body);
          const formattedMessage = {
            id: receivedMessage.messageId || Date.now(),
            text: receivedMessage.content,
            sender: receivedMessage.senderType.toLowerCase(),
            timestamp: new Date().toLocaleTimeString(),
            senderName: receivedMessage.senderType === 'USER' ? user.fullName : selectedCoach?.fullName
          };
          setMessages(prev => [...prev, formattedMessage]);
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
        }
      });
      
      if (subscription) {
        setConnectionStatus('connected');
        console.log('WebSocket connected and subscribed successfully');
      } else {
        setConnectionStatus('disconnected');
        console.warn('Failed to subscribe to WebSocket channel');
      }
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      console.log('Chat will work in REST API mode only');
      setConnectionStatus('disconnected');
      
      // Không hiển thị lỗi cho user, chỉ log
      // Ứng dụng vẫn hoạt động bình thường với REST API
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
    const money = days * 50000; // Giả sử tiết kiệm 50k/ngày
    
    return { days, hours, minutes, money };
  };

  const progress = calculateProgress();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectionId) return;
    
    const messageData = {
      selectionId: selectionId,
      content: newMessage.trim(),
      senderType: 'USER'
    };

    // Optimistic update - thêm tin nhắn vào UI ngay lập tức
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
      // Thử gửi qua WebSocket trước
      if (WebSocketService.isConnectedToServer()) {
        const success = WebSocketService.sendMessage('/app/chat.send', messageData);
        
        if (success) {
          console.log('Message sent via WebSocket');
          return;
        } else {
          console.warn('WebSocket send failed, trying REST API');
        }
      }
      
      // Fallback: gửi qua REST API
      console.log('Sending message via REST API...');
      const response = await axiosInstance.post('/api/chat/send', messageData);
      
      if (response.data.status === 'success') {
        console.log('Message sent via REST API successfully');
        // Cập nhật ID từ server nếu có
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
        throw new Error('API returned non-success status');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Rollback optimistic update
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setNewMessage(originalMessage);
      
      // Hiển thị thông báo lỗi user-friendly
      alert('Không thể gửi tin nhắn lúc này. Backend có thể chưa sẵn sàng. Vui lòng thử lại sau.');
    }
  };

  // Loading state khi đang kiểm tra membership
  if (checkingMembership) {
    return (
      <>
        <Header />
        <div className="progress-bg">
          <div className="progress-container">
            <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
              <div className="loading-spinner"></div>
              <p>Đang kiểm tra gói membership...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Không có membership active
  if (!membershipStatus) {
    return (
      <>
        <Header />
        <div className="progress-bg">
          <div className="progress-container">
            <div className="error-container">
              <div className="error-message" style={{ textAlign: 'center', padding: '50px' }}>
                <h3>🔒 Cần có gói membership để theo dõi tiến trình</h3>
                <p>Bạn cần mua gói membership trước khi có thể sử dụng tính năng theo dõi tiến trình cai thuốc</p>
                <div style={{ marginTop: '20px' }}>
                  <button 
                    className="btn-select-coach-redirect" 
                    onClick={() => navigate('/payment')}
                    style={{ marginRight: '10px' }}
                  >
                    Mua gói membership ngay
                  </button>
                  <button 
                    className="btn-select-coach-redirect" 
                    onClick={() => navigate('/home')}
                    style={{ background: '#6c757d' }}
                  >
                    Về trang chủ
                  </button>
                </div>
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  fontSize: '0.9em',
                  color: '#6c757d'
                }}>
                  <p><strong>Với gói membership, bạn sẽ được:</strong></p>
                  <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                    <li>📊 Theo dõi tiến trình cai thuốc chi tiết</li>
                    <li>🎯 Kế hoạch cai thuốc cá nhân hóa</li>
                    <li>💬 Chat trực tiếp với coach chuyên nghiệp</li>
                    <li>📈 Báo cáo và thống kê chi tiết</li>
                  </ul>
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
          {/* Header với thông tin coach */}
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
              <input 
                type="date" 
                value={quitDate}
                onChange={(e) => setQuitDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Thống kê tiến trình */}
          <div className="progress-stats">
            <div className="stat-card">
              <h3>{progress.days}</h3>
              <p>Ngày không khói thuốc</p>
            </div>
            <div className="stat-card">
              <h3>{progress.hours}</h3>
              <p>Giờ sạch phổi</p>
            </div>
            <div className="stat-card">
              <h3>{progress.minutes}</h3>
              <p>Phút tích cực</p>
            </div>
            <div className="stat-card highlight">
              <h3>{progress.money.toLocaleString()}₫</h3>
              <p>Tiền đã tiết kiệm</p>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="progress-tabs">
            <button 
              className={activeTab === 'overview' ? 'active' : ''} 
              onClick={() => setActiveTab('overview')}
            >
              📊 Tổng quan
            </button>
            <button 
              className={activeTab === 'plan' ? 'active' : ''} 
              onClick={() => setActiveTab('plan')}
            >
              📋 Kế hoạch
            </button>
            <button 
              className={activeTab === 'chat' ? 'active' : ''} 
              onClick={() => setActiveTab('chat')}
            >
              💬 Chat với Coach
            </button>
          </div>

          {/* Tab content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <h3>🎯 Mục tiêu của bạn</h3>
                <div className="goals-grid">
                  <div className="goal-item">
                    <span className="goal-icon">🚭</span>
                    <div>
                      <h4>Hoàn toàn không hút thuốc</h4>
                      <p>30 ngày liên tiục</p>
                    </div>
                  </div>
                  <div className="goal-item">
                    <span className="goal-icon">💰</span>
                    <div>
                      <h4>Tiết kiệm 1,500,000₫</h4>
                      <p>Trong 30 ngày</p>
                    </div>
                  </div>
                  <div className="goal-item">
                    <span className="goal-icon">❤️</span>
                    <div>
                      <h4>Cải thiện sức khỏe</h4>
                      <p>Phổi sạch hơn, hơi thở dễ dàng</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'plan' && (
              <div className="plan-content">
                <h3>📋 Kế hoạch cai thuốc 30 ngày</h3>
                <div className="plan-timeline">
                  <div className="plan-week">
                    <h4>Tuần 1: Chuẩn bị tinh thần</h4>
                    <ul>
                      <li>✅ Xác định lý do cai thuốc</li>
                      <li>✅ Loại bỏ thuốc lá khỏi nhà</li>
                      <li>⏳ Thay đổi thói quen hàng ngày</li>
                      <li>⏳ Tìm hoạt động thay thế</li>
                    </ul>
                  </div>
                  <div className="plan-week">
                    <h4>Tuần 2: Vượt qua cơn thèm</h4>
                    <ul>
                      <li>⏳ Luyện tập thở sâu</li>
                      <li>⏳ Uống nhiều nước</li>
                      <li>⏳ Tập thể dục nhẹ</li>
                      <li>⏳ Tránh môi trường có khói thuốc</li>
                    </ul>
                  </div>
                  <div className="plan-week">
                    <h4>Tuần 3-4: Tạo thói quen mới</h4>
                    <ul>
                      <li>⏳ Duy trì lối sống lành mạnh</li>
                      <li>⏳ Tham gia hoạt động xã hội</li>
                      <li>⏳ Theo dõi tiến trình hàng ngày</li>
                      <li>⏳ Tự thưởng khi đạt mục tiêu</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="chat-content">
                <div className="chat-header">
                  <h3>💬 Trò chuyện với Coach {selectedCoach.fullName}</h3>
                  
                  {/* Debug info và status */}
                  <div className="chat-status" style={{ 
                    fontSize: '0.8em', 
                    marginBottom: '10px',
                    padding: '8px',
                    background: '#f8f9fa',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Status:</strong> 
                      <span style={{ 
                        color: connectionStatus === 'connected' ? '#28a745' : 
                               connectionStatus === 'connecting' ? '#ffc107' : '#dc3545',
                        marginLeft: '5px'
                      }}>
                        {connectionStatus === 'connected' && '🟢 Real-time chat kết nối'}
                        {connectionStatus === 'connecting' && '� Đang kết nối...'}
                        {connectionStatus === 'disconnected' && '🔴 Chế độ REST API'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
                      SelectionId: {selectionId || 'chưa có'} | Messages: {messages.length}
                    </div>
                  </div>
                </div>

                <div className="chat-container">
                  <div className="messages-list">
                    {loading ? (
                      <div className="loading-state">
                        <p>Đang tải lịch sử chat...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="no-messages">
                        <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện với coach!</p>
                        <small style={{ color: '#6c757d', marginTop: '5px', display: 'block' }}>
                          💡 Tin nhắn sẽ được lưu và đồng bộ khi backend sẵn sàng
                        </small>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div key={message.id} className={`message ${message.sender}`}>
                          <div className="message-content">
                            <div className="message-header">
                              <strong>{message.senderName}</strong>
                              <span className="timestamp">{message.timestamp}</span>
                            </div>
                            <p>{message.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
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
                    <button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim() || loading || !selectionId}
                    >
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
