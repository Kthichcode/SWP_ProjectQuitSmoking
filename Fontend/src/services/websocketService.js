import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    if (this.isConnected) {
      return Promise.resolve(this.stompClient);
    }

    return new Promise((resolve, reject) => {
      try {
        // Use Client instead of Stomp.over
        this.stompClient = new Client({
          webSocketFactory: () => new SockJS('http://localhost:5175/ws'),
          connectHeaders: {
            Authorization: `Bearer ${token}`
          },
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          heartbeatIncoming: 20000,
          heartbeatOutgoing: 20000,
          reconnectDelay: 5000,
          maxReconnectAttempts: this.maxReconnectAttempts,
          
          onConnect: () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('WebSocket connected successfully');
            resolve(this.stompClient);
          },
          
          onStompError: (frame) => {
            console.error('STOMP error:', frame);
            this.isConnected = false;
            reject(new Error('STOMP error: ' + frame.headers.message));
          },
          
          onWebSocketError: (error) => {
            console.error('WebSocket error:', error);
            this.isConnected = false;
          },
          
          onDisconnect: () => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
          }
        });

        // Activate the client
        this.stompClient.activate();
        
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.stompClient) {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      
      this.stompClient.deactivate();
      this.isConnected = false;
      this.stompClient = null;
      console.log('WebSocket disconnected');
    }
  }

  subscribe(destination, callback) {
    if (!this.isConnected || !this.stompClient) {
      console.error('WebSocket not connected');
      return null;
    }

    try {
      const subscription = this.stompClient.subscribe(destination, callback);
      this.subscriptions.set(destination, subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to', destination, error);
      return null;
    }
  }

  unsubscribe(destination) {
    if (this.subscriptions.has(destination)) {
      try {
        this.subscriptions.get(destination).unsubscribe();
        this.subscriptions.delete(destination);
      } catch (error) {
        console.error('Error unsubscribing from', destination, error);
      }
    }
  }

  sendMessage(destination, message) {
    if (!this.isConnected || !this.stompClient) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(message)
      });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  isConnectedToServer() {
    return this.isConnected;
  }
}

export default new WebSocketService();
