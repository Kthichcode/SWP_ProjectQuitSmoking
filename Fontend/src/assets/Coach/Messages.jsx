import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [forceUpdate, setForceUpdate] = useState(0); // Thêm force update trigger

  const messagesEndRef = useRef(null);
  const globalSubscriptionRef = useRef(null);
  const inputRef = useRef(null);
  const selectedConversationRef = useRef(null);
  // Ref để lưu các messageId đã xử lý, tránh double count
  const processedMessageIdsRef = useRef(new Set());

  // Cập nhật ref mỗi khi selectedConversation thay đổi
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    if (user) {
      fetchConversations();

      const connectGlobalWS = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        await WebSocketService.connect(token);
        const globalSub = WebSocketService.subscribe(
          `/user/queue/messages/global`,
          (message) => {
            try {
              const receivedMessage = JSON.parse(message.body);
              console.log('🌍 Global subscription received:', receivedMessage);
              handleIncomingGlobalMessage(receivedMessage);
            } catch (error) {
              console.error('❌ Error parsing global message:', error);
            }
          }
        );

        globalSubscriptionRef.current = globalSub;
        console.log('Global WebSocket subscription created.');
      };

      connectGlobalWS();
    }

    return () => {
      if (globalSubscriptionRef.current) {
        globalSubscriptionRef.current.unsubscribe();
        console.log('Global WebSocket unsubscribed.');
      }
    };
  }, [user]);

  useEffect(() => {
    if (!selectedConversation) return;

    const initWebSocket = async () => {
      const subscription = await connectWebSocket(selectedConversation.selectionId);
      return subscription;
    };

    const subscriptionPromise = initWebSocket();

    return () => {
      subscriptionPromise.then((subscription) => {
        if (subscription) {
          subscription.unsubscribe();
          console.log(`Unsubscribed WS for selection ${selectedConversation.selectionId}`);
        }
      });
    };
  }, [selectedConversation?.selectionId]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input after sending or switching conversation
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedConversation, sendingMessage]);

  // Debug: Log conversations changes
  useEffect(() => {
    console.log('Conversations state changed:', conversations);
  }, [conversations]);

  // Debug: Log selected conversation changes
  useEffect(() => {
    console.log('Selected conversation changed:', selectedConversation);
  }, [selectedConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
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
          console.log('📨 Messages.jsx received WebSocket message:', message);
          try {
            const receivedMessage = JSON.parse(message.body);
            console.log('📝 Parsed message:', receivedMessage);

            if (receivedMessage.senderType === 'COACH') {
              console.log('❌ Skipping own COACH message in Messages.jsx');
              return;
            }

            // Chỉ xử lý tin nhắn thuộc cuộc trò chuyện hiện tại
            if (receivedMessage.selectionId !== selectionId) {
              console.log('⚠️ Message not for current conversation, ignoring in specific handler');
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

            setMessages((prev) => {
              const exists = prev.some(
                (m) =>
                  m.id === formattedMessage.id ||
                  (m.content === formattedMessage.content &&
                    m.senderType === formattedMessage.senderType &&
                    Math.abs(new Date(m.timestamp).getTime() - new Date(formattedMessage.timestamp).getTime()) < 3000)
              );
              if (exists) {
                console.log('⚠️ Message already exists, skipping');
                return prev;
              }
              console.log('✅ Adding new message to current conversation');
              return [...prev, formattedMessage];
            });

            // Specific handler chỉ cập nhật lastMessage, KHÔNG tăng unreadCount
            setConversations((prevConvs) =>
              prevConvs.map((conv) => {
                if (conv.selectionId === receivedMessage.selectionId) {
                  return {
                    ...conv,
                    lastMessage: receivedMessage.content,
                    lastMessageTime: receivedMessage.sentAt || new Date().toISOString(),
                    lastMessageTimestamp: new Date(receivedMessage.sentAt || new Date().toISOString()).getTime(),
                  };
                }
                return conv;
              })
            );
          } catch (err) {
            console.error('❌ Lỗi parse WebSocket message:', err);
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

  const handleIncomingGlobalMessage = (receivedMessage) => {
    console.log('🌍 Global message received:', receivedMessage);
    if (receivedMessage.senderType === 'COACH') {
      console.log('❌ Skipping COACH message in global handler');
      return;
    }
    // Kiểm tra messageId đã xử lý chưa
    const msgId = receivedMessage.messageId || (receivedMessage.content + receivedMessage.sentAt);
    if (processedMessageIdsRef.current.has(msgId)) {
      console.log('⚠️ Message already processed, skip unreadCount:', msgId);
      return;
    }
    processedMessageIdsRef.current.add(msgId);
    // Giới hạn size tránh memory leak
    if (processedMessageIdsRef.current.size > 200) {
      const arr = Array.from(processedMessageIdsRef.current);
      arr.slice(0, 100).forEach(id => processedMessageIdsRef.current.delete(id));
    }
    // Sử dụng ref để lấy selectedConversation hiện tại
    const currentSelectedConversation = selectedConversationRef.current;
    const isCurrentConversation = currentSelectedConversation?.selectionId === receivedMessage.selectionId;
    setConversations((prevConvs) => {
      return prevConvs.map((conv) => {
        if (conv.selectionId === receivedMessage.selectionId) {
          const newUnreadCount = isCurrentConversation ? 0 : (conv.unreadCount || 0) + 1;
          return {
            ...conv,
            lastMessage: receivedMessage.content,
            lastMessageTime: receivedMessage.sentAt || new Date().toISOString(),
            lastMessageTimestamp: new Date(receivedMessage.sentAt || new Date().toISOString()).getTime(),
            unreadCount: newUnreadCount,
          };
        }
        return conv;
      });
    });

    // QUAN TRỌNG: Nếu đang ở conversation hiện tại, fetch lại lịch sử để đồng bộ
    if (isCurrentConversation && currentSelectedConversation) {
      console.log('🔄 Refreshing messages for current conversation');
      fetchMessages(
        currentSelectedConversation.selectionId,
        currentSelectedConversation.userId,
        currentSelectedConversation.userFullName
      );
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
        const formatted = await Promise.all(res.data.data.map(async (sel) => {
          let lastMsg = 'Bắt đầu cuộc trò chuyện...';
          let lastMsgTime = sel.selectedAt || new Date().toISOString();
          let lastMsgTimestamp = new Date(sel.selectedAt).getTime();
          
          // Ưu tiên lấy lastMessage từ API nếu có
          if (sel.lastMessage && sel.lastMessage.content) {
            lastMsg = sel.lastMessage.content;
            lastMsgTime = sel.lastMessage.sentAt || new Date().toISOString();
            lastMsgTimestamp = new Date(sel.lastMessage.sentAt).getTime();
          } else {
            // Nếu API không trả về lastMessage, fetch thủ công tin nhắn cuối cùng
            try {
              const resMsg = await axiosInstance.get(`/api/chat/history/${sel.selectionId}`);
              const history = resMsg.data?.data || [];
              if (history.length > 0) {
                const last = history[history.length - 1];
                lastMsg = last.content;
                lastMsgTime = last.sentAt || new Date().toISOString();
                lastMsgTimestamp = new Date(last.sentAt).getTime();
              }
            } catch (e) {
              // Nếu lỗi thì giữ nguyên mặc định
            }
          }
          
          return {
            id: sel.selectionId,
            selectionId: sel.selectionId,
            userId: sel.member?.userId || sel.member?.id,
            userName: sel.member?.username || sel.member?.user?.username || '',
            userFullName:
              sel.member?.fullName ||
              sel.member?.user?.fullName ||
              'Người dùng',
            userOnline: false,
            lastMessage: lastMsg,
            lastMessageTime: lastMsgTime, // Lưu timestamp đầy đủ
            lastMessageTimestamp: lastMsgTimestamp, // Thêm timestamp số để sort
            unreadCount: sel.unreadCount || 0,
          };
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

  const markConversationAsRead = async (selectionId) => {
    try {
      await axiosInstance.put(`/api/chat/mark-read/${selectionId}`);
      console.log(`Marked messages as read for selection ${selectionId}`);
    } catch (e) {
      console.error('Lỗi mark messages as read:', e);
    }
  };

  const selectConversation = async (conversation) => {
    if (selectedConversation?.id === conversation.id) return;

    setSelectedConversation(conversation);
    // Truyền userId, userFullName trực tiếp để tránh race condition
    await fetchMessages(conversation.selectionId, conversation.userId, conversation.userFullName);
    await markConversationAsRead(conversation.selectionId);
    markAsReadLocally(conversation.id);
  };

  const fetchMessages = async (selectionId, userId, userFullName) => {
    try {
      const res = await axiosInstance.get(`/api/chat/history/${selectionId}`);
      const history = res.data?.data || [];

      const formatted = history.map((msg) => ({
        id: msg.messageId,
        senderId:
          msg.senderType === 'MEMBER'
            ? userId || selectedConversation?.userId
            : user.id,
        senderType: msg.senderType,
        content: msg.content,
        timestamp: msg.sentAt,
        senderName:
          msg.senderType === 'MEMBER'
            ? userFullName || selectedConversation?.userFullName
            : user.fullName || 'Coach',
        isOptimistic: false,
      }));

      setMessages((prev) => {
        const optimisticMessages = prev.filter((msg) => msg.isOptimistic);
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
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    setSendingMessage(true);

    // Focus input after sending
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);

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
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticId
              ? {
                  ...msg,
                  id: res.data.data.messageId || optimisticId,
                  isOptimistic: false,
                  timestamp: res.data.data.sentAt || messageTimestamp,
                  fromServer: true,
                }
              : msg
          )
        );
        setConversations((prevConvs) =>
          prevConvs.map((conv) =>
            conv.selectionId === selectedConversation.selectionId
              ? {
                  ...conv,
                  lastMessage: messageContent,
                  lastMessageTime: res.data.data.sentAt || messageTimestamp,
                  lastMessageTimestamp: new Date(res.data.data.sentAt || messageTimestamp).getTime(),
                  unreadCount: 0,
                }
              : conv
          )
        );
      } else {
        throw new Error('Gửi tin nhắn thất bại');
      }
    } catch (e) {
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticId)
      );
      setNewMessage(messageContent);
    } finally {
      setSendingMessage(false);
      // Ensure input stays focused even if error
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Nếu là trong vòng 1 phút
    if (diffMinutes < 1) {
      return 'Vừa xong';
    }
    
    // Nếu là trong vòng 1 giờ
    if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    }
    
    // Nếu là trong vòng 24 giờ
    if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    }
    
    // Nếu là hôm qua
    if (diffDays === 1) {
      return 'Hôm qua';
    }
    
    // Nếu là trong tuần này
    if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    }
    
    // Nếu là cùng năm
    const isCurrentYear = date.getFullYear() === now.getFullYear();
    if (isCurrentYear) {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });
    }
    
    // Nếu là năm khác
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  // Sắp xếp hội thoại: Ưu tiên tin nhắn chưa đọc → Thời gian mới nhất
  const sortedConversations = [...conversations].sort((a, b) => {
    // Ưu tiên tin nhắn chưa đọc lên đầu
    const aHasUnread = a.unreadCount > 0;
    const bHasUnread = b.unreadCount > 0;
    
    if (aHasUnread && !bHasUnread) return -1;
    if (!aHasUnread && bHasUnread) return 1;
    
    // Nếu cả hai đều có hoặc không có tin nhắn chưa đọc, sắp xếp theo thời gian mới nhất
    const aTimestamp = a.lastMessageTimestamp || new Date(a.lastMessageTime).getTime() || 0;
    const bTimestamp = b.lastMessageTimestamp || new Date(b.lastMessageTime).getTime() || 0;
    
    return bTimestamp - aTimestamp;
  });

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
          sortedConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`messages-list-item ${
                selectedConversation?.id === conv.id ? 'selected' : ''
              }`}
              style={{
                background: selectedConversation?.id === conv.id 
                  ? '#e3f2fd' 
                  : conv.unreadCount > 0 
                    ? '#fff3e0' 
                    : '#fff',
                fontWeight: conv.unreadCount > 0 && selectedConversation?.id !== conv.id ? 600 : 400,
                borderLeft: conv.unreadCount > 0 && selectedConversation?.id !== conv.id 
                  ? '4px solid #2196f3' 
                  : '4px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div className="conversation-info">
                <div 
                  className="conversation-name"
                  style={{
                    fontWeight: conv.unreadCount > 0 && selectedConversation?.id !== conv.id ? 700 : 500,
                    color: conv.unreadCount > 0 && selectedConversation?.id !== conv.id ? '#1976d2' : '#333',
                  }}
                >
                  {conv.userName || conv.userFullName}
                </div>
                <div 
                  className="last-message"
                  style={{
                    fontWeight: conv.unreadCount > 0 && selectedConversation?.id !== conv.id ? 600 : 400,
                    color: conv.unreadCount > 0 && selectedConversation?.id !== conv.id ? '#424242' : '#666',
                  }}
                >
                  {conv.lastMessage?.slice(0, 40)}
                  {conv.lastMessage && conv.lastMessage.length > 40 && '...'}
                </div>
                <div 
                  className="last-time"
                  style={{
                    color: conv.unreadCount > 0 && selectedConversation?.id !== conv.id ? '#1976d2' : '#888',
                    fontSize: 12,
                    fontWeight: conv.unreadCount > 0 && selectedConversation?.id !== conv.id ? 600 : 400,
                  }}
                >
                  {formatTime(conv.lastMessageTime)}
                </div>
              </div>
              {/* Hiển thị số tin nhắn chưa đọc */}
              {conv.unreadCount > 0 && selectedConversation?.id !== conv.id && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span 
                    className="unread-count"
                    style={{
                      background: '#2196f3',
                      color: '#fff',
                      borderRadius: '50%',
                      minWidth: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '0 6px',
                    }}
                  >
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                </div>
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
                  {getInitials(selectedConversation?.userName || selectedConversation?.userFullName)}
                </div>
                <div>
                  <h4>{selectedConversation?.userName || selectedConversation?.userFullName}</h4>
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
                      <div className="message-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <strong style={{ fontSize: 14, color: message.senderType === 'COACH' ? 'white' : '#15803d', fontWeight: 700, borderRadius: 4 }}>
                          {message.senderType === 'MEMBER'
                            ? (selectedConversation?.userName || selectedConversation?.userFullName)
                            : (user.userName || user.fullName || 'Bạn')}
                        </strong>
                        <span className="timestamp" style={{ fontSize: 12, opacity: 0.7, marginLeft: 8 }}>
                          {formatTime(message.timestamp)}
                          {message.isOptimistic && (
                            <span className="sending-indicator"> ⏳</span>
                          )}
                        </span>
                      </div>
                      <div className="message-text" style={{ margin: 0, lineHeight: 1.5 }}>
                        {message.content}
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
                ref={inputRef}
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sendingMessage}
                autoFocus
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
