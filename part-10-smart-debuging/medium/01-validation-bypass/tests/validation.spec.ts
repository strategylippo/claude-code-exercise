import { describe, it, expect } from 'vitest';
import {
  validateTaskInput,
  validateUserInput,
  sanitizeInput,
} from '../src/validators/validator';

describe('Input Validation Security', () => {
  describe('validateTaskInput', () => {
    it('should accept valid task input', () => {
      const result = validateTaskInput({
        title: 'Valid Task Title',
        description: 'A description',
        priority: 3,
        tags: ['work', 'urgent'],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject array as title (type confusion)', () => {
      // BUG: This passes because arrays have .length property
      const result = validateTaskInput({
        title: ['a', 'b', 'c'],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Title must be a string');
    });

    it('should reject object as title', () => {
      const result = validateTaskInput({
        title: { text: 'sneaky' },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Title must be a string');
    });

    it('should reject array input (not object)', () => {
      const result = validateTaskInput(['title', 'description']);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Input must be a plain object');
    });

    it('should reject prototype pollution attempts', () => {
      const malicious = JSON.parse(
        '{"title": "Test", "__proto__": {"admin": true}}'
      );
      const result = validateTaskInput(malicious);

      // Should either reject or strip dangerous properties
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid property: __proto__');
    });

    it('should reject constructor pollution', () => {
      const result = validateTaskInput({
        title: 'Test',
        constructor: { prototype: { admin: true } },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid property: constructor');
    });

    it('should reject string priority (type coercion)', () => {
      // BUG: "3" < 1 is false, "3" > 5 is false (string comparison)
      const result = validateTaskInput({
        title: 'Valid Title',
        priority: '3', // String, not number!
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Priority must be a number');
    });

    it('should reject non-string tags', () => {
      const result = validateTaskInput({
        title: 'Valid Title',
        tags: [1, 2, 3], // Numbers, not strings!
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tags must be an array of strings');
    });

    it('should reject non-array tags', () => {
      const result = validateTaskInput({
        title: 'Valid Title',
        tags: 'single-tag', // String, not array!
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tags must be an array');
    });
  });

  describe('validateUserInput', () => {
    it('should accept valid user input', () => {
      const result = validateUserInput({
        email: 'user@example.com',
        password: 'securepassword123',
        role: 'user',
      });

      expect(result.valid).toBe(true);
    });

    it('should reject array as email', () => {
      // BUG: Arrays have .includes() method!
      const result = validateUserInput({
        email: ['user', '@', 'example.com'],
        password: 'securepassword123',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email must be a string');
    });

    it('should reject array as password', () => {
      const result = validateUserInput({
        email: 'user@example.com',
        password: ['p', 'a', 's', 's', 'w', 'o', 'r', 'd'],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be a string');
    });

    it('should reject prototype pollution in user input', () => {
      const malicious = JSON.parse(
        '{"email": "test@test.com", "password": "password123", "__proto__": {"isAdmin": true}}'
      );
      const result = validateUserInput(malicious);

      expect(result.valid).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should strip dangerous properties', () => {
      const input = {
        title: 'Safe',
        __proto__: { admin: true },
        constructor: { bad: true },
      };

      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toHaveProperty('__proto__');
      expect(sanitized).not.toHaveProperty('constructor');
      expect(sanitized.title).toBe('Safe');
    });

    it('should handle null prototype objects', () => {
      const input = Object.create(null);
      input.title = 'Test';

      const sanitized = sanitizeInput(input);

      expect(sanitized.title).toBe('Test');
    });
  });
});
