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

      const conversationInterval = setInterval(() => {
        fetchConversations();
      }, 30000);

      return () => clearInterval(conversationInterval);
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.selectionId);
      connectWebSocket(selectedConversation.selectionId);
      return () => {
        WebSocketService.unsubscribe(`/user/queue/messages/${selectedConversation.selectionId}`);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  const connectWebSocket = async (selectionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found for WebSocket');
        return;
      }

      await WebSocketService.connect(token);

      WebSocketService.subscribe(
        `/user/queue/messages/${selectionId}`,
        (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);
            console.log('📥 COACH RECEIVED WS MESSAGE:', receivedMessage);

            const formattedMessage = {
              id: receivedMessage.messageId || Date.now(),
              senderId: receivedMessage.senderType === 'MEMBER' 
                ? selectedConversation?.userId 
                : user.id,
              senderType: receivedMessage.senderType,
              content: receivedMessage.content,
              timestamp: new Date().toISOString(),
              senderName: receivedMessage.senderType === 'MEMBER'
                ? selectedConversation?.userFullName
                : (user.fullName || 'Coach')
            };

            setMessages(prev => {
              const exists = prev.some(msg => msg.id === formattedMessage.id || (msg.content === formattedMessage.content && msg.senderType === formattedMessage.senderType));
              if (!exists) {
                const newMessages = [...prev, formattedMessage];
                setTimeout(() => scrollToBottom(), 50);
                return newMessages;
              }
              return prev;
            });

          } catch (err) {
            console.error('Error parsing WebSocket message on coach side:', err);
          }
        }
      );

      console.log('Coach subscribed to WebSocket topic:', `/user/queue/messages/${selectionId}`);
    } catch (e) {
      console.error('Error connecting coach WebSocket:', e);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const currentCoachId = user.userId || user.id;
      if (!currentCoachId) {
        setConversations([]);
        return;
      }

      const response = await axiosInstance.get(`/api/users/coaches/${currentCoachId}/selections`);

      if (response.data.status === 'success' && response.data.data) {
        const formattedConversations = response.data.data.map(selection => ({
          id: selection.selectionId,
          selectionId: selection.selectionId,
          userId: selection.member?.userId || selection.member?.id,
          userFullName: selection.member?.fullName || selection.member?.user?.fullName || 'Unknown User',
          userOnline: false,
          lastMessage: 'Bắt đầu cuộc trò chuyện...',
          lastMessageTime: new Date(selection.selectedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          unreadCount: 0
        }));

        setConversations(formattedConversations);
        if (formattedConversations.length > 0) {
          selectConversation(formattedConversations[0]);
        }
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.selectionId);
    markAsReadLocally(conversation.id);
  };

  const fetchMessages = async (selectionId) => {
    try {
      const response = await axiosInstance.get(`/api/chat/history/${selectionId}`);

      if (response.data.status === 'success' && response.data.data) {
        const formattedMessages = response.data.data.map(msg => ({
          id: msg.messageId,
          senderId: msg.senderType === 'MEMBER' ? selectedConversation?.userId : user.id,
          senderType: msg.senderType,
          content: msg.content,
          timestamp: msg.sentAt,
          senderName: msg.senderType === 'MEMBER'
            ? selectedConversation?.userFullName
            : (user.fullName || 'Coach')
        }));

        setMessages((prev) => {
          if (prev.length === formattedMessages.length) {
            const changed = formattedMessages.some(
              (m, i) => m.id !== prev[i]?.id || m.content !== prev[i]?.content
            );
            return changed ? formattedMessages : prev;
          }
          return formattedMessages;
        });
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const markAsReadLocally = (conversationId) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    const currentUserId = selectedConversation.userId;
    const currentCoachId = user.userId || user.id;

    const messageData = {
      selectionId: selectedConversation.selectionId,
      content: newMessage.trim(),
      senderType: 'COACH',
      userId: currentUserId,
      coachId: currentCoachId
    };

    const optimisticMessage = {
      id: Date.now(),
      senderId: user.id,
      senderType: 'COACH',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      senderName: user.fullName || 'Coach'
    };

    setMessages(prev => [...prev, optimisticMessage]);
    const originalMessage = newMessage;
    setNewMessage('');
    
    // Scroll to bottom after adding optimistic message
    setTimeout(() => scrollToBottom(), 50);

    setSendingMessage(true);
    try {
      const response = await axiosInstance.post('/api/chat/send', messageData);

      if (response.data.status === 'success') {
        if (response.data.data?.messageId) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === optimisticMessage.id 
                ? { ...msg, id: response.data.data.messageId }
                : msg
            )
          );
        }

        setConversations(prev =>
          prev.map(conv =>
            conv.selectionId === selectedConversation.selectionId
              ? { 
                  ...conv, 
                  lastMessage: originalMessage.trim(), 
                  lastMessageTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  unreadCount: 0 
                }
              : conv
          )
        );

        if (WebSocketService.isConnectedToServer()) {
          WebSocketService.sendMessage('/app/chat.send', {
            ...messageData,
            messageId: response.data.data?.messageId,
            selectionId: response.data.data?.selectionId || selectedConversation.selectionId
          });
        }
      } else {
        throw new Error('API returned non-success status');
      }
    } catch (error) {
      console.error('Error sending coach message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setNewMessage(originalMessage);
      alert('Không thể gửi tin nhắn lúc này. Vui lòng thử lại.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase() || 'U';
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
          <div className="total-unread">
            {conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0)} tin nhắn chưa đọc
          </div>
        </div>
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>Chưa có cuộc trò chuyện nào</p>
            <small style={{ color: '#666', fontSize: '0.9em' }}>
              Cuộc trò chuyện sẽ xuất hiện khi users chọn bạn làm coach và bắt đầu nhắn tin
            </small>
          </div>
        ) : (
          conversations.map((conv) => (
            <div 
              key={conv.id} 
              onClick={() => selectConversation(conv)} 
              className={`messages-list-item ${selectedConversation?.id === conv.id ? 'selected' : ''}`}
            >
              <div className="messages-avatar">
                {getInitials(conv.userFullName)}
              </div>
              <div className="conversation-info">
                <div className="conversation-name">
                  {conv.userFullName}
                  {conv.userOnline && <span className="online-indicator">●</span>}
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
                  <span className={`status ${selectedConversation.userOnline ? 'online' : 'offline'}`}>
                    {selectedConversation.userOnline ? '● Đang online' : '○ Offline'}
                  </span>
                </div>
              </div>
            </div>

            <div className="messages-chat-body">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                  <small style={{ color: '#666', fontSize: '0.9em' }}>
                    Tin nhắn với {selectedConversation.userFullName} sẽ hiển thị ở đây
                  </small>
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`message ${message.senderType === 'COACH' ? 'coach' : 'user'}`}
                  >
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
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
                onKeyPress={handleKeyPress}
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
