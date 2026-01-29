import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  registerUser,
  getUser,
  clearData,
} from '../src/controllers/api.controller';

describe('API Status Codes', () => {
  beforeEach(() => {
    clearData();
  });

  describe('Task Endpoints', () => {
    it('should return 201 when creating a task', () => {
      const response = createTask('Test Task', 'Description');

      // This fails! Returns 200 instead of 201
      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe('Test Task');
    });

    it('should return 400 for invalid input when creating task', () => {
      const response = createTask('', 'Description');

      // This fails! Returns 404 instead of 400
      expect(response.statusCode).toBe(400);
    });

    it('should return 404 when task not found', () => {
      const response = getTask('nonexistent-id');

      // This fails! Returns 400 instead of 404
      expect(response.statusCode).toBe(404);
    });

    it('should return 200 when getting existing task', () => {
      const created = createTask('Test', 'Desc');
      const response = getTask(created.body.id);

      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe('Test');
    });

    it('should return 404 when updating non-existent task', () => {
      const response = updateTask('nonexistent', { title: 'New Title' });

      // This fails! Returns 400 instead of 404
      expect(response.statusCode).toBe(404);
    });

    it('should return 404 when deleting non-existent task', () => {
      const response = deleteTask('nonexistent');

      // This fails! Returns 400 instead of 404
      expect(response.statusCode).toBe(404);
    });
  });

  describe('User Endpoints', () => {
    it('should return 201 when registering a user', () => {
      const response = registerUser('test@example.com', 'Test User');

      // This fails! Returns 200 instead of 201
      expect(response.statusCode).toBe(201);
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 400 for invalid email', () => {
      const response = registerUser('invalid-email', 'Test User');

      // This fails! Returns 404 instead of 400
      expect(response.statusCode).toBe(400);
    });

    it('should return 409 for duplicate email', () => {
      registerUser('test@example.com', 'First User');
      const response = registerUser('test@example.com', 'Second User');

      // This fails! Returns 400 instead of 409
      expect(response.statusCode).toBe(409);
    });

    it('should return 409 for duplicate email (case insensitive)', () => {
      registerUser('test@example.com', 'First User');
      const response = registerUser('TEST@EXAMPLE.COM', 'Second User');

      expect(response.statusCode).toBe(409);
    });

    it('should return 404 when user not found', () => {
      const response = getUser('nonexistent-id');

      // This fails! Returns 400 instead of 404
      expect(response.statusCode).toBe(404);
    });
  });
});
