// User Controller - Exposes sensitive data in responses
// EXERCISE: Find and fix the data exposure issues

import { UserService } from '../services/user.service';

interface Request {
  params: Record<string, string>;
  query: Record<string, string>;
  user?: { id: string; role: string };
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}

const userService = new UserService();

export class UserController {
  // VULNERABLE: Returns full user object including sensitive fields
  async getUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const user = await userService.getUserById(id);

      if (!user) {
        // VULNERABLE: Reveals that user doesn't exist
        res.status(404).json({
          error: 'User not found',
          requestedId: id,  // Leaking request details
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // VULNERABLE: Returning entire user object
      res.status(200).json({ user });
    } catch (error) {
      // VULNERABLE: Exposing internal error details
      res.status(500).json({
        error: 'Database error',
        details: (error as Error).message,
        stack: (error as Error).stack,  // Leaking stack trace
      });
    }
  }

  // VULNERABLE: Admin endpoint returns all sensitive data
  async listUsers(req: Request, res: Response): Promise<void> {
    const users = await userService.getAllUsers();

    // Returns all users with all fields
    res.status(200).json({
      users,
      count: users.length,
      // VULNERABLE: Exposing internal metadata
      databaseTable: 'users',
      serverTime: new Date().toISOString(),
    });
  }

  // VULNERABLE: Search exposes full user objects
  async searchUsers(req: Request, res: Response): Promise<void> {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ error: 'Search query required' });
      return;
    }

    const users = await userService.searchUsers(q);

    // Returns full user objects to anyone who searches
    res.status(200).json({ users, query: q });
  }

  // VULNERABLE: Public profile returns everything
  async getPublicProfile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const user = await userService.getPublicProfile(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Should only return name and maybe email
    // Instead returns SSN, password hash, etc.
    res.status(200).json({ profile: user });
  }
}
