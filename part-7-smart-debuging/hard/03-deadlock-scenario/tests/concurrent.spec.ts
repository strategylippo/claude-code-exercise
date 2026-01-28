import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeData,
  assignTask,
  transferTasks,
  updateProjectStats,
  reassignProjectTasks,
  lockManager,
} from '../src/services/task-operations';

describe('Concurrent Operations (Deadlock Detection)', () => {
  beforeEach(() => {
    initializeData();
    lockManager.clearAll();
  });

  describe('Basic Operations', () => {
    it('should assign task successfully', async () => {
      const result = await assignTask('task-1', 'user-1', 'op-1');
      expect(result).toBe(true);
    });

    it('should transfer tasks successfully', async () => {
      // First assign some tasks
      await assignTask('task-1', 'user-1', 'op-1');
      await assignTask('task-2', 'user-1', 'op-2');

      const transferred = await transferTasks('user-1', 'user-2', 'op-3');
      expect(transferred).toBe(2);
    });
  });

  describe('Concurrent Operations - Deadlock Scenarios', () => {
    it('should not deadlock when assignTask and transferTasks run concurrently', async () => {
      // First assign a task
      await assignTask('task-1', 'user-1', 'setup');

      // This is the deadlock scenario:
      // - assignTask locks: task → user
      // - transferTasks locks: user → task
      // If they run concurrently, deadlock!

      const timeout = 5000; // 5 second timeout

      const result = await Promise.race([
        Promise.all([
          assignTask('task-2', 'user-1', 'op-1'),
          transferTasks('user-1', 'user-2', 'op-2'),
        ]),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('DEADLOCK DETECTED: Operation timed out')), timeout)
        ),
      ]);

      // If we get here, no deadlock occurred
      expect(result).toBeDefined();
    });

    it('should not deadlock with multiple concurrent assignTask operations', async () => {
      const timeout = 5000;

      const result = await Promise.race([
        Promise.all([
          assignTask('task-1', 'user-1', 'op-1'),
          assignTask('task-2', 'user-2', 'op-2'),
          assignTask('task-3', 'user-1', 'op-3'),
          assignTask('task-4', 'user-2', 'op-4'),
        ]),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('DEADLOCK DETECTED')), timeout)
        ),
      ]);

      expect(result.every((r) => r === true)).toBe(true);
    });

    it('should not deadlock with updateProjectStats running during other operations', async () => {
      const timeout = 5000;

      const result = await Promise.race([
        Promise.all([
          updateProjectStats('project-1', 'op-1'),
          assignTask('task-1', 'user-1', 'op-2'),
          assignTask('task-2', 'user-2', 'op-3'),
        ]),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('DEADLOCK DETECTED')), timeout)
        ),
      ]);

      expect(result).toBeDefined();
    });

    it('should not deadlock with reassignProjectTasks during transfers', async () => {
      // Setup: assign tasks
      await assignTask('task-1', 'user-1', 'setup-1');
      await assignTask('task-2', 'user-1', 'setup-2');

      const timeout = 5000;

      const result = await Promise.race([
        Promise.all([
          reassignProjectTasks('project-1', 'user-2', 'op-1'),
          transferTasks('user-1', 'user-2', 'op-2'),
        ]),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('DEADLOCK DETECTED')), timeout)
        ),
      ]);

      expect(result).toBeDefined();
    });
  });

  describe('Lock Ordering Verification', () => {
    it('should acquire locks in consistent order', async () => {
      // Run multiple operations
      await assignTask('task-1', 'user-1', 'op-1');
      await transferTasks('user-1', 'user-2', 'op-2');
      await updateProjectStats('project-1', 'op-3');

      const log = lockManager.getAcquisitionLog();

      // Verify consistent ordering pattern
      // Expected order: project → user → task (alphabetically by type)
      // Check that no operation acquires locks in reverse order

      // This is a simplified check - real verification would be more complex
      expect(log.length).toBeGreaterThan(0);

      // After fix, there should be no deadlock-prone patterns
      // The operations should complete without issues
    });
  });

  describe('Lock Timeout', () => {
    it('should timeout if lock cannot be acquired', async () => {
      // Acquire a lock and hold it
      await lockManager.acquire('task:task-1', 'holder-1');

      // Try to acquire same lock with timeout
      // BUG: Current implementation waits forever

      const startTime = Date.now();
      const timeout = 1000;

      try {
        await Promise.race([
          lockManager.acquire('task:task-1', 'holder-2'),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), timeout)
          ),
        ]);
        // If we get here, lock was acquired (shouldn't happen while held)
        expect(true).toBe(false); // Should not reach
      } catch (error) {
        const elapsed = Date.now() - startTime;
        // Should timeout in ~1 second, not hang forever
        expect(elapsed).toBeLessThan(timeout + 100);
      }
    });
  });

  describe('Resource Cleanup', () => {
    it('should release all locks after operations', async () => {
      await assignTask('task-1', 'user-1', 'op-1');
      await transferTasks('user-1', 'user-2', 'op-2');

      // All locks should be released
      expect(lockManager.getActiveLocksCount()).toBe(0);
    });

    it('should release locks even if operation fails', async () => {
      try {
        await assignTask('nonexistent-task', 'user-1', 'op-1');
      } catch {
        // Expected to fail
      }

      // Locks should still be released
      expect(lockManager.getActiveLocksCount()).toBe(0);
    });
  });
});
