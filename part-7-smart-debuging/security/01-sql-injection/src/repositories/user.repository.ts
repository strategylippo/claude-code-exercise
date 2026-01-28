// User Repository - Contains SQL Injection Vulnerability
// EXERCISE: Find and fix the SQL injection vulnerability

import { Database } from '../database';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export class UserRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // VULNERABLE: This method is susceptible to SQL injection
  async findByEmail(email: string): Promise<User | null> {
    // Directly interpolating user input into SQL query
    const query = `SELECT * FROM users WHERE email = '${email}'`;

    const result = await this.db.query(query);
    return result[0] || null;
  }

  // VULNERABLE: Search endpoint with SQL injection
  async searchUsers(searchTerm: string): Promise<User[]> {
    // User input directly concatenated into query
    const query = `SELECT id, email, name, role FROM users WHERE email LIKE '%${searchTerm}%' OR name LIKE '%${searchTerm}%'`;

    return await this.db.query(query);
  }

  // This method is safe - for reference
  async findById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = ?';
    const result = await this.db.query(query, [id]);
    return result[0] || null;
  }

  // VULNERABLE: Delete with SQL injection
  async deleteByEmail(email: string): Promise<boolean> {
    const query = `DELETE FROM users WHERE email = '${email}'`;
    const result = await this.db.execute(query);
    return result.affectedRows > 0;
  }
}
