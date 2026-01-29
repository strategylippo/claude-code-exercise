// Validator with security vulnerabilities

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// These interfaces document the expected input structure
// The buggy validator doesn't properly check these types
/* eslint-disable @typescript-eslint/no-unused-vars */
interface TaskInput {
  title: string;
  description?: string;
  priority?: number;
  tags?: string[];
}

interface UserInput {
  email: string;
  password: string;
  role?: string;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// BUG: This validation can be bypassed in multiple ways
export function validateTaskInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  // BUG 1: No check if input is actually an object
  // Arrays and null also pass typeof === 'object'
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Input must be an object'] };
  }

  const data = input as Record<string, unknown>;

  // BUG 2: No prototype pollution protection
  // Attacker can send { "__proto__": { "admin": true } }
  const title = data.title;
  const description = data.description;
  const priority = data.priority;
  const tags = data.tags;

  // BUG 3: Only checks truthiness, not actual type
  // Arrays pass this check: ["a","b"].length > 0 is true
  if (!title || (title as string).length === 0) {
    errors.push('Title is required');
  } else if ((title as string).length < 3) {
    // BUG 4: Array.length works here too, bypassing string length check
    errors.push('Title must be at least 3 characters');
  } else if ((title as string).length > 100) {
    errors.push('Title must be at most 100 characters');
  }

  // BUG 5: No type check for description
  if (description && (description as string).length > 500) {
    errors.push('Description must be at most 500 characters');
  }

  // BUG 6: Loose comparison allows string "1" to pass as number
  if (priority !== undefined) {
    if (priority < 1 || priority > 5) {
      errors.push('Priority must be between 1 and 5');
    }
  }

  // BUG 7: No validation that tags is actually an array of strings
  if (tags) {
    if (tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateUserInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Input must be an object'] };
  }

  const data = input as Record<string, unknown>;

  // BUG: No prototype pollution protection
  const email = data.email;
  const password = data.password;
  const role = data.role;

  // BUG: Doesn't check if email is actually a string
  if (!email) {
    errors.push('Email is required');
  } else if (!(email as string).includes('@')) {
    // BUG: Arrays can have .includes() method too!
    errors.push('Invalid email format');
  }

  // BUG: Doesn't check if password is actually a string
  if (!password) {
    errors.push('Password is required');
  } else if ((password as string).length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  // BUG: No whitelist validation for role
  if (role && !['user', 'admin', 'moderator'].includes(role as string)) {
    errors.push('Invalid role');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Helper to sanitize input (also buggy)
export function sanitizeInput(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object') {
    return {};
  }

  // BUG: Directly spreading allows prototype pollution
  return { ...input as Record<string, unknown> };
}
