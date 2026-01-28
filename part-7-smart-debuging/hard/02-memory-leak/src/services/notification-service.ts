// Notification Service with memory leaks (EventEmitter issues)

import { EventEmitter } from 'events';

interface TaskNotification {
  taskId: string;
  type: 'created' | 'updated' | 'deleted' | 'assigned';
  userId: string;
  timestamp: Date;
}

type NotificationHandler = (notification: TaskNotification) => void;

// BUG: This class has multiple memory leak issues with EventEmitter
export class NotificationService {
  private emitter: EventEmitter;
  private handlers: Map<string, NotificationHandler[]> = new Map();

  // BUG 1: Storing notification history without limit
  private notificationHistory: TaskNotification[] = [];

  constructor() {
    this.emitter = new EventEmitter();
    // BUG 2: Setting high maxListeners hides the leak warning
    this.emitter.setMaxListeners(1000);
  }

  // BUG 3: Listeners are added but never removed
  subscribe(userId: string, handler: NotificationHandler): void {
    const eventName = `notification:${userId}`;

    // BUG 4: Same handler can be added multiple times
    this.emitter.on(eventName, handler);

    // BUG 5: Also storing in local map, doubling memory usage
    if (!this.handlers.has(userId)) {
      this.handlers.set(userId, []);
    }
    this.handlers.get(userId)!.push(handler);
  }

  // BUG 6: Unsubscribe exists but has a bug - wrong event name format
  unsubscribe(userId: string, handler: NotificationHandler): void {
    // BUG: Using different event name pattern than subscribe!
    this.emitter.removeListener(`user:${userId}`, handler);

    const handlers = this.handlers.get(userId);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  notify(notification: TaskNotification): void {
    // BUG 7: History grows forever
    this.notificationHistory.push(notification);

    const eventName = `notification:${notification.userId}`;
    this.emitter.emit(eventName, notification);
  }

  // BUG 8: This creates a closure that captures 'this', preventing GC
  createNotificationCallback(userId: string): () => void {
    const self = this;
    const largeData = new Array(10000).fill(userId); // Captures large array

    return function notifyUser() {
      // BUG: Closure captures 'self' and 'largeData'
      self.notify({
        taskId: 'task-1',
        type: 'updated',
        userId,
        timestamp: new Date(),
      });
      console.log(largeData.length); // Reference keeps largeData alive
    };
  }

  getHistorySize(): number {
    return this.notificationHistory.length;
  }

  getListenerCount(userId: string): number {
    return this.emitter.listenerCount(`notification:${userId}`);
  }

  getTotalListenerCount(): number {
    return this.emitter
      .eventNames()
      .reduce((sum, name) => sum + this.emitter.listenerCount(name), 0);
  }

  // BUG 9: This cleanup method exists but is incomplete
  cleanup(): void {
    // Only clears history, not listeners!
    this.notificationHistory = [];
  }
}

// Singleton with accumulated leaks
export const notificationService = new NotificationService();

// BUG 10: Global handlers that are never cleaned up
export function setupGlobalNotificationHandler(): void {
  // This creates a new listener every time it's called
  notificationService.subscribe('global', (notification) => {
    console.log('Global notification:', notification);
  });
}
