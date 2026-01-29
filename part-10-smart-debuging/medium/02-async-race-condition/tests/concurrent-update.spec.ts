import { describe, it, expect, beforeEach } from 'vitest';
import { TaskUpdater, BatchTaskUpdater, TaskApi } from '../src/services/task-updater';

describe('Concurrent Task Updates', () => {
  describe('TaskUpdater', () => {
    let updater: TaskUpdater;

    beforeEach(() => {
      updater = new TaskUpdater();
      updater.getApi().reset();
    });

    it('should handle single update correctly', async () => {
      await updater.loadTask('task-1');
      const result = await updater.updateTask('task-1', { title: 'New Title' });

      expect(result.success).toBe(true);
      expect(result.task?.title).toBe('New Title');
      expect(updater.getCurrentTask()?.title).toBe('New Title');
    });

    it('should preserve the LAST sent update when multiple updates are concurrent', async () => {
      await updater.loadTask('task-1');

      // Send three rapid updates - the LAST one should win
      const update1 = updater.updateTask('task-1', { title: 'Title A' });
      const update2 = updater.updateTask('task-1', { title: 'Title B' });
      const update3 = updater.updateTask('task-1', { title: 'Title C' });

      // Wait for all to complete
      await Promise.all([update1, update2, update3]);

      // BUG: Due to race condition, currentTask might not be "Title C"
      // The test expects the LAST SENT update to be the final state
      expect(updater.getCurrentTask()?.title).toBe('Title C');
    });

    it('should ignore stale responses', async () => {
      await updater.loadTask('task-1');

      // Simulate rapid updates
      const promises: Promise<unknown>[] = [];
      const titles = ['Title 1', 'Title 2', 'Title 3', 'Title 4', 'Title 5'];

      for (const title of titles) {
        promises.push(updater.updateTask('task-1', { title }));
      }

      await Promise.all(promises);

      // The last title sent should be the current state
      expect(updater.getCurrentTask()?.title).toBe('Title 5');
    });

    it('should track update order correctly', async () => {
      await updater.loadTask('task-1');

      // This tests that we can determine which update was sent last
      const result1 = updater.updateTask('task-1', { title: 'First' });
      const result2 = updater.updateTask('task-1', { title: 'Second' });

      const [r1, r2] = await Promise.all([result1, result2]);

      // Both should succeed
      expect(r1.success).toBe(true);
      expect(r2.success).toBe(true);

      // But final state should be "Second"
      expect(updater.getCurrentTask()?.title).toBe('Second');
    });
  });

  describe('BatchTaskUpdater', () => {
    let batchUpdater: BatchTaskUpdater;

    beforeEach(() => {
      batchUpdater = new BatchTaskUpdater();
      batchUpdater.getApi().reset();
    });

    it('should merge queued updates for same task', () => {
      batchUpdater.queueUpdate('task-1', { title: 'Title A' });
      batchUpdater.queueUpdate('task-1', { description: 'Desc B' });

      // After flush, task should have BOTH title and description updated
      // BUG: Current implementation replaces instead of merges
    });

    it('should not duplicate updates on concurrent flush', async () => {
      batchUpdater.queueUpdate('task-1', { title: 'New Title' });

      // Call flush twice rapidly
      const flush1 = batchUpdater.flush();
      const flush2 = batchUpdater.flush();

      const [results1, results2] = await Promise.all([flush1, flush2]);

      // First flush should process the update
      expect(results1.length).toBe(1);

      // Second flush should be empty (update already processed)
      expect(results2.length).toBe(0);
    });

    it('should handle concurrent flushes safely', async () => {
      // Queue multiple updates
      batchUpdater.queueUpdate('task-1', { title: 'Concurrent Title' });

      // Rapidly flush multiple times
      const flushPromises = [
        batchUpdater.flush(),
        batchUpdater.flush(),
        batchUpdater.flush(),
      ];

      const results = await Promise.all(flushPromises);

      // Total updates processed should be exactly 1
      const totalUpdates = results.reduce((sum, r) => sum + r.length, 0);
      expect(totalUpdates).toBe(1);
    });
  });

  describe('Race Condition Scenarios', () => {
    it('should handle update-while-loading race', async () => {
      const updater = new TaskUpdater();

      // Start loading and updating simultaneously
      const loadPromise = updater.loadTask('task-1');
      const updatePromise = updater.updateTask('task-1', { title: 'Racing Update' });

      await Promise.all([loadPromise, updatePromise]);

      // State should be consistent
      const currentTask = updater.getCurrentTask();
      expect(currentTask).toBeDefined();
      expect(currentTask?.title).toBe('Racing Update');
    });

    it('should handle many concurrent updates correctly', async () => {
      const updater = new TaskUpdater();
      await updater.loadTask('task-1');

      // Send 10 concurrent updates
      const updates = Array.from({ length: 10 }, (_, i) =>
        updater.updateTask('task-1', { title: `Title ${i}` })
      );

      await Promise.all(updates);

      // Final state should be the last update
      expect(updater.getCurrentTask()?.title).toBe('Title 9');
    });
  });
});
