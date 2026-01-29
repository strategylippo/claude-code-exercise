// User Service - Contains Mass Assignment Vulnerability
// EXERCISE: Find and fix the mass assignment issues

interface User {
  id: string;
  email: string;
  name: string;
  bio: string;
  avatarUrl: string;
  // Protected fields - should NOT be modifiable by users
  role: 'admin' | 'moderator' | 'user';
  isVerified: boolean;
  isAdmin: boolean;
  credits: number;
  subscription: 'free' | 'pro' | 'enterprise';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mock database
const users: Map<string, User> = new Map([
  ['user-1', {
    id: 'user-1',
    email: 'regular@example.com',
    name: 'Regular User',
    bio: 'Just a regular user',
    avatarUrl: '/avatars/default.png',
    role: 'user',
    isVerified: false,
    isAdmin: false,
    credits: 0,
    subscription: 'free',
    permissions: ['read'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }]
]);

export class UserService {
  async getUser(id: string): Promise<User | null> {
    return users.get(id) || null;
  }

  // VULNERABLE: Accepts any fields from the update object
  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(id);
    if (!user) return null;

    // VULNERABLE: Blindly applies all updates including protected fields
    // Attacker can send: { "role": "admin", "isAdmin": true }
    Object.assign(user, updates);
    user.updatedAt = new Date();

    return user;
  }

  // VULNERABLE: Create also accepts any fields
  async createUser(userData: Partial<User>): Promise<User> {
    const user: User = {
      id: `user-${Date.now()}`,
      email: '',
      name: '',
      bio: '',
      avatarUrl: '/avatars/default.png',
      role: 'user',
      isVerified: false,
      isAdmin: false,
      credits: 0,
      subscription: 'free',
      permissions: ['read'],
      createdAt: new Date(),
      updatedAt: new Date(),
      // VULNERABLE: Spreads all user-provided data
      ...userData,
    };

    users.set(user.id, user);
    return user;
  }

  // VULNERABLE: Bulk update with mass assignment
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<User>
  ): Promise<User[]> {
    const updatedUsers: User[] = [];

    for (const id of userIds) {
      const user = users.get(id);
      if (user) {
        // VULNERABLE: Same issue as updateUser
        Object.assign(user, updates);
        user.updatedAt = new Date();
        updatedUsers.push(user);
      }
    }

    return updatedUsers;
  }
}
