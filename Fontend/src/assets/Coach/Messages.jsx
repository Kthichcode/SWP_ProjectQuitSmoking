import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../../axiosInstance';
import WebSocketService from '../../services/websocketService';
import './Messages.css';

function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (!selectedConversation) return;

    const initWebSocket = async () => {
      const subscription = await connectWebSocket(selectedConversation.selectionId);
      return subscription;
    };

    const subscriptionPromise = initWebSocket();

    return () => {
      subscriptionPromise.then(subscription => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });
    };
  }, [selectedConversation?.selectionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  };

  const connectWebSocket = async (selectionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return null;
      }

      console.log('Connecting to WebSocket for Messages.jsx, selectionId:', selectionId);
      await WebSocketService.connect(token);

      const subscription = WebSocketService.subscribe(
        `/user/queue/messages/${selectionId}`,
        (message) => {
          console.log('Messages.jsx received WebSocket message:', message);
          try {
            const receivedMessage = JSON.parse(message.body);
            console.log('Parsed message:', receivedMessage);
            
            // Bỏ qua tin nhắn do chính mình gửi (tránh duplicate với optimistic message)
            if (receivedMessage.senderType === 'COACH') {
              console.log('Skipping own COACH message in Messages.jsx');
              return;
            }
            
            const formattedMessage = {
              id: receivedMessage.messageId || Date.now(),
              senderId:
                receivedMessage.senderType === 'MEMBER'
                  ? selectedConversation?.userId
                  : user.id,
              senderType: receivedMessage.senderType,
              content: receivedMessage.content,
              timestamp: receivedMessage.sentAt || new Date().toISOString(),
              senderName:
                receivedMessage.senderType === 'MEMBER'
                  ? selectedConversation?.userFullName
                  : user.fullName || 'Coach',
            };

            console.log('Adding formatted message:', formattedMessage);
            setMessages((prev) => {
              console.log('Current messages before adding:', prev.length);
              // Kiểm tra duplicate theo ID và content
              const exists = prev.some((m) => 
                m.id === formattedMessage.id || 
                (m.content === formattedMessage.content && 
                 m.senderType === formattedMessage.senderType &&
                 Math.abs(new Date(m.timestamp).getTime() - new Date(formattedMessage.timestamp).getTime()) < 3000)
              );
              console.log('Message exists by ID or content:', exists);
              if (exists) {
                console.log('Message already exists, skipping');
                return prev;
              }
              console.log('Adding new message to state');
              return [...prev, formattedMessage];
            });
          } catch (err) {
            console.error('Lỗi parse WebSocket message:', err);
          }
        }
      );

      console.log('WebSocket subscription created for Messages.jsx:', subscription);
      return subscription;
    } catch (e) {
      console.error('Lỗi connectWebSocket:', e);
      return null;
    }
  };

  const fetchConversations = async () => {
    try {
      const currentCoachId = user.userId || user.id;
      if (!currentCoachId) {
        setConversations([]);
        return;
      }

      const res = await axiosInstance.get(
        `/api/users/coaches/${currentCoachId}/selections`
      );

      if (res.data.status === 'success' && res.data.data) {
        const formatted = res.data.data.map((sel) => ({
          id: sel.selectionId,
          selectionId: sel.selectionId,
          userId: sel.member?.userId || sel.member?.id,
          userFullName:
            sel.member?.fullName ||
            sel.member?.user?.fullName ||
            'Người dùng',
          userOnline: false,
          lastMessage: 'Bắt đầu cuộc trò chuyện...',
          lastMessageTime: new Date(sel.selectedAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          unreadCount: 0,
        }));

        setConversations(formatted);

        if (formatted.length > 0 && !selectedConversation) {
          selectConversation(formatted[0]);
        }
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách hội thoại:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    if (selectedConversation?.id === conversation.id) return;

    setSelectedConversation(conversation);
    await fetchMessages(conversation.selectionId);
    markAsReadLocally(conversation.id);
  };

  const fetchMessages = async (selectionId) => {
    try {
      const res = await axiosInstance.get(`/api/chat/history/${selectionId}`);
      const history = res.data?.data || [];

      const formatted = history.map((msg) => ({
        id: msg.messageId,
        senderId:
          msg.senderType === 'MEMBER'
            ? selectedConversation?.userId
            : user.id,
        senderType: msg.senderType,
        content: msg.content,
        timestamp: msg.sentAt,
        senderName:
          msg.senderType === 'MEMBER'
            ? selectedConversation?.userFullName
            : user.fullName || 'Coach',
        isOptimistic: false,
      }));

      // Bảo tồn các optimistic messages (tin nhắn đang gửi)
      setMessages((prev) => {
        const optimisticMessages = prev.filter(msg => msg.isOptimistic);
        return [...formatted, ...optimisticMessages];
      });
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err);
      setMessages([]);
    }
  };

  const markAsReadLocally = (conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    const messageContent = newMessage.trim();
    const messageTimestamp = new Date().toISOString();
    const optimisticId = `optimistic-${Date.now()}-${Math.random()}`;

    const optimisticMessage = {
      id: optimisticId,
      senderId: user.id,
      senderType: 'COACH',
      content: messageContent,
      timestamp: messageTimestamp,
      senderName: user.fullName || 'Coach',
      isOptimistic: true, // Đánh dấu tin nhắn tạm thời
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    setSendingMessage(true);

    try {
      const payload = {
        selectionId: selectedConversation.selectionId,
        content: messageContent,
        senderType: 'COACH',
        userId: selectedConversation.userId,
        coachId: user.userId || user.id,
      };

      const res = await axiosInstance.post('/api/chat/send', payload);

      if (res.data.status === 'success') {
        console.log('Message sent successfully, server response:', res.data);
        // Cập nhật tin nhắn optimistic thành tin nhắn thật
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticId
              ? { 
                  ...msg, 
                  id: res.data.data.messageId || optimisticId,
                  isOptimistic: false,
                  timestamp: res.data.data.sentAt || messageTimestamp,
                  // Đánh dấu đây là tin nhắn từ server để tránh duplicate
                  fromServer: true
                }
              : msg
          )
        );

        // Server sẽ tự động broadcast tin nhắn qua WebSocket
        // Không cần gửi manual nữa
      } else {
        throw new Error('Gửi tin nhắn thất bại');
      }
    } catch (e) {
      console.error('Lỗi gửi tin nhắn:', e);
      // Xóa tin nhắn optimistic khi gửi thất bại
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticId)
      );
      setNewMessage(messageContent); // Khôi phục nội dung tin nhắn
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name) => {
    return name?.split(' ').map((w) => w[0]).join('').toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="messages-container">
        <div className="loading-state">
          <p>Đang tải cuộc trò chuyện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-list">
        <div className="messages-list-header">
          <h4>Cuộc trò chuyện ({conversations.length})</h4>
        </div>
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>Chưa có cuộc trò chuyện nào</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`messages-list-item ${
                selectedConversation?.id === conv.id ? 'selected' : ''
              }`}
            >
              <div className="messages-avatar">
                {getInitials(conv.userFullName)}
              </div>
              <div className="conversation-info">
                <div className="conversation-name">
                  {conv.userFullName}
                  <span
                    className={`status ${
                      conv.userOnline ? 'online' : 'offline'
                    }`}
                  >
                    {conv.userOnline ? ' ●' : ' ○'}
                  </span>
                </div>
                <div className="last-message">
                  {conv.lastMessage?.slice(0, 40)}...
                </div>
                <div className="last-time">{conv.lastMessageTime}</div>
              </div>
              {conv.unreadCount > 0 && (
                <span className="unread-badge">{conv.unreadCount}</span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="messages-chat">
        {selectedConversation ? (
          <>
            <div className="messages-chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {getInitials(selectedConversation.userFullName)}
                </div>
                <div>
                  <h4>{selectedConversation.userFullName}</h4>
                  <span
                    className={`status ${
                      selectedConversation.userOnline ? 'online' : 'offline'
                    }`}
                  >
                    {selectedConversation.userOnline
                      ? '● Đang online'
                      : '○ Offline'}
                  </span>
                </div>
              </div>
            </div>

            <div className="messages-chat-body">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${
                      message.senderType === 'COACH'
                        ? 'coach-right'
                        : 'member-left'
                    } ${message.isOptimistic ? 'optimistic' : ''}`}
                  >
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                        {message.isOptimistic && (
                          <span className="sending-indicator"> ⏳</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="messages-chat-footer">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sendingMessage}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
              >
                {sendingMessage ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <p>Chọn một cuộc trò chuyện để bắt đầu chat</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
