import { describe, it, expect, beforeEach } from 'vitest';
import { createTask, getTask, updateTask } from '../src/controllers/task.controller';
import { clearTasks } from '../src/services/task.service';

describe('Task Controller', () => {
  beforeEach(() => {
    clearTasks();
  });

  describe('createTask', () => {
    it('should create a task and return the task object', async () => {
      const result = await createTask({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
      });

      // This fails! result is a Promise, not a Task object
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Test Task');
      expect(result.description).toBe('Test Description');
      expect(result.priority).toBe('high');
      expect(result.status).toBe('todo');
    });

    it('should return task with correct structure', async () => {
      const result = await createTask({
        title: 'Another Task',
        description: 'Another Description',
      });

      // Verify it's an actual object, not a Promise
      expect(typeof result).toBe('object');
      expect(result).not.toBeInstanceOf(Promise);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error for empty title', async () => {
      await expect(
        createTask({ title: '', description: 'Test' })
      ).rejects.toThrow('Title is required');
    });
  });

  describe('updateTask', () => {
    it('should update task and return updated task object', async () => {
      // First create a task
      const created = await createTask({
        title: 'Original Title',
        description: 'Original Description',
      });

      // Then update it
      const updated = await updateTask(created.id, {
        title: 'Updated Title',
        status: 'in-progress',
      });

      // This fails! updated is a Promise, not a Task object
      expect(updated).toBeDefined();
      expect(updated).not.toBeNull();
      expect(updated!.id).toBe(created.id);
      expect(updated!.title).toBe('Updated Title');
      expect(updated!.status).toBe('in-progress');
    });
  });

  describe('getTask', () => {
    it('should retrieve a created task', async () => {
      const created = await createTask({
        title: 'Retrievable Task',
        description: 'Test',
      });

      const retrieved = await getTask(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.title).toBe('Retrievable Task');
    });
  });
});
