// WebSocket Service with memory leaks

interface WebSocketConnection {
  id: string;
  userId: string;
  connectedAt: Date;
  lastPing: Date;
  messageCount: number;
}

type MessageHandler = (data: unknown) => void;

// BUG: Simulated WebSocket that leaks memory
class MockWebSocket {
  private handlers: Map<string, MessageHandler[]> = new Map();
  private isOpen: boolean = true;

  on(event: string, handler: MessageHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  // BUG: Off doesn't actually remove handler correctly
  off(event: string, handler: MessageHandler): void {
    // BUG: This comparison by reference often fails
    const handlers = this.handlers.get(event);
    if (handlers) {
      // This doesn't work if handler is a new function instance
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  send(data: string): void {
    if (this.isOpen) {
      console.log('WS Send:', data);
    }
  }

  close(): void {
    this.isOpen = false;
    // BUG: Doesn't clear handlers!
  }

  getHandlerCount(event: string): number {
    return this.handlers.get(event)?.length || 0;
  }
}

export class WebSocketService {
  // BUG 1: Connections stored but never fully cleaned up
  private connections: Map<string, WebSocketConnection> = new Map();
  private sockets: Map<string, MockWebSocket> = new Map();

  // BUG 2: Message handlers accumulate per connection
  private messageHandlers: Map<string, MessageHandler[]> = new Map();

  // BUG 3: Stores all messages for "debugging" - never cleared
  private messageLog: Array<{ connectionId: string; message: unknown; timestamp: Date }> = [];

  connect(userId: string): string {
    const connectionId = `conn-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const connection: WebSocketConnection = {
      id: connectionId,
      userId,
      connectedAt: new Date(),
      lastPing: new Date(),
      messageCount: 0,
    };

    this.connections.set(connectionId, connection);

    const socket = new MockWebSocket();
    this.sockets.set(connectionId, socket);

    // BUG 4: Adding handlers that capture connectionId in closure
    socket.on('message', (data) => {
      this.handleMessage(connectionId, data);
    });

    socket.on('ping', () => {
      this.handlePing(connectionId);
    });

    // BUG 5: Creates interval that's never cleared
    this.startHeartbeat(connectionId);

    return connectionId;
  }

  // BUG 6: Interval stored in closure, never cleared
  private heartbeatIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  private startHeartbeat(connectionId: string): void {
    // BUG: If connection is removed, interval keeps running
    const interval = setInterval(() => {
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.lastPing = new Date();
      }
      // BUG: No check if connection still exists
    }, 30000);

    this.heartbeatIntervals.set(connectionId, interval);
  }

  private handleMessage(connectionId: string, data: unknown): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.messageCount++;
    }

    // BUG 7: Message log grows forever
    this.messageLog.push({
      connectionId,
      message: data,
      timestamp: new Date(),
    });

    // Call registered handlers
    const handlers = this.messageHandlers.get(connectionId) || [];
    for (const handler of handlers) {
      handler(data);
    }
  }

  private handlePing(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastPing = new Date();
    }
  }

  // BUG 8: Handlers can be registered but not properly unregistered
  onMessage(connectionId: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(connectionId)) {
      this.messageHandlers.set(connectionId, []);
    }
    this.messageHandlers.get(connectionId)!.push(handler);
  }

  // BUG 9: Disconnect doesn't clean up everything
  disconnect(connectionId: string): void {
    const socket = this.sockets.get(connectionId);
    if (socket) {
      socket.close();
      this.sockets.delete(connectionId);
    }

    this.connections.delete(connectionId);

    // BUG: Doesn't clear message handlers!
    // BUG: Doesn't clear heartbeat interval!
    // BUG: Doesn't clear message log entries for this connection!
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  getMessageLogSize(): number {
    return this.messageLog.length;
  }

  getActiveIntervalCount(): number {
    return this.heartbeatIntervals.size;
  }
}

export const websocketService = new WebSocketService();
