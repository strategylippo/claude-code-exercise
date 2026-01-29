// Auth Service - Contains Broken Authentication Vulnerabilities
// EXERCISE: Find and fix the authentication weaknesses

import { createHash } from 'crypto';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  failedAttempts: number;
  lastLoginAttempt: Date | null;
}

interface Session {
  token: string;
  userId: string;
  createdAt: Date;
}

// Mock user store
const users: Map<string, User> = new Map();
const sessions: Map<string, Session> = new Map();

export class AuthService {
  // VULNERABLE: No password complexity requirements
  async register(email: string, password: string): Promise<User> {
    // No password validation - accepts any password
    if (password.length < 1) {
      throw new Error('Password required');
    }

    // VULNERABLE: Using MD5 for password hashing (weak)
    const passwordHash = createHash('md5').update(password).digest('hex');

    const user: User = {
      id: `user-${Date.now()}`,
      email,
      passwordHash,
      failedAttempts: 0,
      lastLoginAttempt: null,
    };

    users.set(email, user);
    return user;
  }

  // VULNERABLE: No rate limiting, no account lockout
  async login(email: string, password: string): Promise<string | null> {
    const user = users.get(email);

    if (!user) {
      return null;
    }

    // No check for failed attempts or lockout
    const passwordHash = createHash('md5').update(password).digest('hex');

    if (passwordHash !== user.passwordHash) {
      // Increment failed attempts but never use it
      user.failedAttempts++;
      user.lastLoginAttempt = new Date();
      return null;
    }

    // Reset on successful login
    user.failedAttempts = 0;
    user.lastLoginAttempt = new Date();

    // VULNERABLE: Weak session token generation
    const token = this.generateSessionToken(user);
    return token;
  }

  // VULNERABLE: Predictable session tokens
  private generateSessionToken(user: User): string {
    // Using predictable values - timestamp and user ID
    const token = `${user.id}-${Date.now()}`;

    const session: Session = {
      token,
      userId: user.id,
      createdAt: new Date(),
      // VULNERABLE: No expiration time
    };

    sessions.set(token, session);
    return token;
  }

  // VULNERABLE: Sessions never expire
  async validateSession(token: string): Promise<boolean> {
    const session = sessions.get(token);

    if (!session) {
      return false;
    }

    // No expiration check - sessions are valid forever
    return true;
  }

  async logout(token: string): Promise<void> {
    sessions.delete(token);
  }
}
