import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../../axiosInstance';
import './Messages.css';

function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      
      // Auto-refresh conversations every 30 seconds
      const conversationInterval = setInterval(() => {
        fetchConversations();
      }, 30000);
      
      return () => clearInterval(conversationInterval);
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      // Auto-refresh messages every 10 seconds
      const messageInterval = setInterval(() => {
        fetchMessages(selectedConversation.selectionId);
      }, 10000);
      
      return () => clearInterval(messageInterval);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // API để lấy danh sách conversations của coach
      const response = await axiosInstance.get('/api/coach/conversations');
      
      if (response.data.status === 'success') {
        setConversations(response.data.data);
        // Auto-select first conversation if exists
        if (response.data.data.length > 0) {
          selectConversation(response.data.data[0]);
        }
      } else {
        console.warn('Failed to fetch conversations from API');
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      console.log('API not available, starting with empty conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.selectionId);
    // Mark conversation as read
    markAsRead(conversation.id);
  };

  const fetchMessages = async (selectionId) => {
    try {
      // API để lấy tin nhắn trong conversation
      const response = await axiosInstance.get(`/api/chat/${selectionId}`);
      
      if (response.data.status === 'success') {
        const formattedMessages = response.data.data.map(msg => ({
          id: msg.messageId,
          senderId: msg.senderType === 'USER' ? selectedConversation?.userId : user.id,
          senderType: msg.senderType,
          content: msg.content,
          timestamp: msg.sentAt,
          senderName: msg.senderType === 'USER' ? selectedConversation?.userFullName : user.fullName
        }));
        setMessages(formattedMessages);
      } else {
        console.warn('Failed to fetch messages from API');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      console.log('API not available, starting with empty messages');
      setMessages([]);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await axiosInstance.post(`/api/coach/conversations/${conversationId}/mark-read`);
      // Update unread count in local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    // Optimistic update - thêm tin nhắn vào UI ngay lập tức
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

    setSendingMessage(true);
    try {
      const messageData = {
        selectionId: selectedConversation.selectionId,
        content: originalMessage.trim(),
        senderType: 'COACH'
      };

      const response = await axiosInstance.post('/api/coach/messages', messageData);
      
      if (response.data.status === 'success') {
        // Cập nhật message với ID từ server
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id 
              ? { ...msg, id: response.data.data.messageId || optimisticMessage.id }
              : msg
          )
        );
        
        // Update last message in conversations list
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
      } else {
        throw new Error('API returned non-success status');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Rollback optimistic update
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
