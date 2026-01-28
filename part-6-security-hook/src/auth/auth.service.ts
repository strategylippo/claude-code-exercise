// Auth Service - Sample file for hook demonstration
// When this file is edited, the security hook will trigger

import { hashPassword, verifyPassword } from '../utils/crypto';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  passwordHash: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<string | null> {
    const { email, password } = credentials;

    // TODO: Implement actual user lookup
    const user = await this.findUserByEmail(email);

    if (!user) {
      return null;
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return null;
    }

    return this.generateToken(user);
  }

  async register(email: string, password: string): Promise<User> {
    const passwordHash = await hashPassword(password);

    // TODO: Save to database
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      passwordHash,
    };

    return user;
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    // TODO: Implement database lookup
    return null;
  }

  private generateToken(user: User): string {
    // TODO: Implement JWT generation
    return `token-${user.id}`;
  }
}
