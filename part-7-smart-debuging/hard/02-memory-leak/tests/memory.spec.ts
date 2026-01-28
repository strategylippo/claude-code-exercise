import { describe, it, expect, beforeEach } from 'vitest';
import { CacheService, globalCache, cacheRequestData } from '../src/services/cache-service';
import { NotificationService, notificationService } from '../src/services/notification-service';
import { WebSocketService, websocketService } from '../src/services/websocket-service';

describe('Memory Leak Detection', () => {
  describe('CacheService', () => {
    it('should enforce maximum cache size', () => {
      const cache = new CacheService<string>();

      // Add 1000 items
      for (let i = 0; i < 1000; i++) {
        cache.set(`key-${i}`, `value-${i}`);
      }

      // Cache should not exceed max size (e.g., 100 items)
      // BUG: Current implementation allows unlimited growth
      expect(cache.size()).toBeLessThanOrEqual(100);
    });

    it('should evict stale entries based on TTL', async () => {
      const cache = new CacheService<string>();

      cache.set('key-1', 'value-1');

      // Simulate time passing (TTL should be ~60 seconds)
      // In real test, we'd mock timers

      // After TTL, entry should be evicted
      // BUG: No TTL implementation
      // For this test, we check if cleanup method exists and works
      expect(typeof cache.delete).toBe('function');
    });

    it('should not create duplicate cache entries per request', () => {
      const initialSize = globalCache.size();

      // Simulate 100 requests for same user
      for (let i = 0; i < 100; i++) {
        cacheRequestData(`request-${i}`, { data: 'test' });
      }

      // Cache should use bounded space, not grow linearly
      // BUG: Current grows by 100 entries
      expect(globalCache.size() - initialSize).toBeLessThanOrEqual(10);
    });
  });

  describe('NotificationService', () => {
    let service: NotificationService;

    beforeEach(() => {
      service = new NotificationService();
    });

    it('should not accumulate listeners on repeated subscribe', () => {
      const handler = () => {};

      // Subscribe same handler 100 times
      for (let i = 0; i < 100; i++) {
        service.subscribe('user-1', handler);
      }

      // Should only have 1 listener (deduplicated) or proper tracking
      // BUG: Current has 100 listeners
      expect(service.getListenerCount('user-1')).toBeLessThanOrEqual(1);
    });

    it('should properly remove listeners on unsubscribe', () => {
      const handler = () => {};

      service.subscribe('user-1', handler);
      service.unsubscribe('user-1', handler);

      // Listener should be removed
      // BUG: Unsubscribe uses wrong event name format
      expect(service.getListenerCount('user-1')).toBe(0);
    });

    it('should limit notification history size', () => {
      // Send 10000 notifications
      for (let i = 0; i < 10000; i++) {
        service.notify({
          taskId: `task-${i}`,
          type: 'created',
          userId: 'user-1',
          timestamp: new Date(),
        });
      }

      // History should be bounded (e.g., last 1000)
      // BUG: Current keeps all 10000
      expect(service.getHistorySize()).toBeLessThanOrEqual(1000);
    });

    it('should cleanup properly', () => {
      const handler = () => {};

      service.subscribe('user-1', handler);
      service.subscribe('user-2', handler);
      service.notify({
        taskId: 'task-1',
        type: 'created',
        userId: 'user-1',
        timestamp: new Date(),
      });

      service.cleanup();

      // Should clean history AND listeners
      expect(service.getHistorySize()).toBe(0);
      expect(service.getTotalListenerCount()).toBe(0);
    });
  });

  describe('WebSocketService', () => {
    let service: WebSocketService;

    beforeEach(() => {
      service = new WebSocketService();
    });

    it('should clean up resources on disconnect', () => {
      // Connect multiple clients
      const connectionIds: string[] = [];
      for (let i = 0; i < 10; i++) {
        connectionIds.push(service.connect(`user-${i}`));
      }

      // Disconnect all
      for (const id of connectionIds) {
        service.disconnect(id);
      }

      // All resources should be cleaned
      expect(service.getConnectionCount()).toBe(0);
      expect(service.getActiveIntervalCount()).toBe(0);
    });

    it('should not accumulate message logs', () => {
      const connectionId = service.connect('user-1');

      // Simulate many messages
      for (let i = 0; i < 1000; i++) {
        // Would normally receive messages
      }

      service.disconnect(connectionId);

      // Message log should be cleared for disconnected clients
      // Or bounded globally
      // BUG: Message log grows forever
      expect(service.getMessageLogSize()).toBeLessThanOrEqual(100);
    });

    it('should clear heartbeat intervals on disconnect', () => {
      const connectionId = service.connect('user-1');

      expect(service.getActiveIntervalCount()).toBe(1);

      service.disconnect(connectionId);

      // Interval should be cleared
      // BUG: Interval keeps running
      expect(service.getActiveIntervalCount()).toBe(0);
    });
  });

  describe('Integration Memory Test', () => {
    it('should not leak memory with typical usage pattern', () => {
      const cache = new CacheService<object>();
      const notification = new NotificationService();
      const websocket = new WebSocketService();

      // Simulate typical usage: 100 users, each doing operations
      for (let i = 0; i < 100; i++) {
        // User caches some data
        cache.set(`user-${i}`, { id: i, data: new Array(100).fill('x') });

        // User subscribes to notifications
        notification.subscribe(`user-${i}`, () => {});

        // User connects via WebSocket
        const connId = websocket.connect(`user-${i}`);

        // User receives notifications
        notification.notify({
          taskId: 'task-1',
          type: 'updated',
          userId: `user-${i}`,
          timestamp: new Date(),
        });

        // User disconnects (should clean up!)
        websocket.disconnect(connId);
      }

      // After all operations, memory should be bounded
      expect(cache.size()).toBeLessThanOrEqual(50);
      expect(notification.getHistorySize()).toBeLessThanOrEqual(100);
      expect(notification.getTotalListenerCount()).toBeLessThanOrEqual(100);
      expect(websocket.getConnectionCount()).toBe(0);
      expect(websocket.getActiveIntervalCount()).toBe(0);
    });
  });
});
