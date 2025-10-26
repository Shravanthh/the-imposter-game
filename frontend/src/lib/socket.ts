import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;

  connect(url: string = 'http://localhost:3001'): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }
    
    this.socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
      forceNew: true // Force new connection to prevent duplicates
    });
    
    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners(); // Remove all listeners
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketManager = new SocketManager();