import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.subscriptions = new Map(); // destination -> subscription object
    this.callbacks = new Map(); // destination -> Set of callbacks
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
      this.callbacks.clear();
      
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
      // If no callbacks exist for this destination, create new subscription
      if (!this.callbacks.has(destination)) {
        this.callbacks.set(destination, new Set());
        
        const subscription = this.stompClient.subscribe(destination, (message) => {
          // Call all callbacks for this destination
          const callbackSet = this.callbacks.get(destination);
          if (callbackSet) {
            callbackSet.forEach(cb => {
              try {
                cb(message);
              } catch (error) {
                console.error('Error in callback:', error);
              }
            });
          }
        });
        
        this.subscriptions.set(destination, subscription);
        console.log('Created new subscription for:', destination);
      }
      
      // Add callback to the set
      this.callbacks.get(destination).add(callback);
      console.log('Added callback for:', destination, 'Total callbacks:', this.callbacks.get(destination).size);
      
      return {
        unsubscribe: () => this.removeCallback(destination, callback)
      };
    } catch (error) {
      console.error('Error subscribing to', destination, error);
      return null;
    }
  }

  removeCallback(destination, callback) {
    if (this.callbacks.has(destination)) {
      this.callbacks.get(destination).delete(callback);
      console.log('Removed callback for:', destination, 'Remaining callbacks:', this.callbacks.get(destination).size);
      
      // If no more callbacks, unsubscribe from the destination
      if (this.callbacks.get(destination).size === 0) {
        this.callbacks.delete(destination);
        
        if (this.subscriptions.has(destination)) {
          try {
            this.subscriptions.get(destination).unsubscribe();
            this.subscriptions.delete(destination);
            console.log('Unsubscribed from:', destination);
          } catch (error) {
            console.error('Error unsubscribing from', destination, error);
          }
        }
      }
    }
  }

  unsubscribe(destination) {
    if (this.callbacks.has(destination)) {
      // Remove all callbacks for this destination
      this.callbacks.delete(destination);
      
      if (this.subscriptions.has(destination)) {
        try {
          this.subscriptions.get(destination).unsubscribe();
          this.subscriptions.delete(destination);
          console.log('Unsubscribed from:', destination);
        } catch (error) {
          console.error('Error unsubscribing from', destination, error);
        }
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
