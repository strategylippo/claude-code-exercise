// User Service - Returns full user objects with sensitive data
// EXERCISE: Find and fix the excessive data exposure

interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;        // SENSITIVE
  ssn: string;                 // SENSITIVE
  creditCardLast4: string;
  internalNotes: string;       // SENSITIVE - admin only
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  role: 'admin' | 'user';
  failedLoginAttempts: number; // SENSITIVE
  lastLoginIp: string;         // SENSITIVE
  twoFactorSecret: string;     // SENSITIVE
}

// Mock database
const users: Map<string, User> = new Map([
  ['user-1', {
    id: 'user-1',
    email: 'john@example.com',
    name: 'John Doe',
    passwordHash: '$2b$10$abc123...',
    ssn: '123-45-6789',
    creditCardLast4: '4242',
    internalNotes: 'VIP customer - special pricing',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
    deletedAt: null,
    role: 'user',
    failedLoginAttempts: 0,
    lastLoginIp: '192.168.1.1',
    twoFactorSecret: 'JBSWY3DPEHPK3PXP',
  }]
]);

export class UserService {
  // VULNERABLE: Returns complete user object with all sensitive fields
  async getUserById(id: string): Promise<User | null> {
    return users.get(id) || null;
  }

  // VULNERABLE: Returns all users with all sensitive fields
  async getAllUsers(): Promise<User[]> {
    return Array.from(users.values());
  }

  // VULNERABLE: Search returns full user objects
  async searchUsers(query: string): Promise<User[]> {
    return Array.from(users.values())
      .filter(user =>
        user.email.includes(query) || user.name.includes(query)
      );
  }

  // VULNERABLE: Even "public" profile returns too much
  async getPublicProfile(id: string): Promise<User | null> {
    // Returns everything, despite being "public"
    return users.get(id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(id);
    if (!user) return null;

    Object.assign(user, updates);
    user.updatedAt = new Date();

    return user; // VULNERABLE: Returns full updated user
  }
}
