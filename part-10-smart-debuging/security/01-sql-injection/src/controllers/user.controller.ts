// User Controller - Endpoint handlers
// Works with the vulnerable UserRepository

import { UserRepository } from '../repositories/user.repository';

interface Request {
  query: Record<string, string>;
  params: Record<string, string>;
  body: Record<string, unknown>;
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}

export class UserController {
  private userRepo: UserRepository;

  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  // GET /api/users/search?email=...
  async searchUsers(req: Request, res: Response): Promise<void> {
    const { email } = req.query;

    if (!email) {
      res.status(400).json({ error: 'Email search term required' });
      return;
    }

    // Passes unsanitized input to vulnerable repository
    const users = await this.userRepo.searchUsers(email);
    res.status(200).json({ users });
  }

  // GET /api/users/:email
  async getUserByEmail(req: Request, res: Response): Promise<void> {
    const { email } = req.params;

    // Passes unsanitized input to vulnerable repository
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  }

  // DELETE /api/users/:email
  async deleteUser(req: Request, res: Response): Promise<void> {
    const { email } = req.params;

    // Passes unsanitized input to vulnerable repository
    const deleted = await this.userRepo.deleteByEmail(email);

    if (!deleted) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User deleted' });
  }
}
