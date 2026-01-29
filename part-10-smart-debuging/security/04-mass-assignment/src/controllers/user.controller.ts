// User Controller - Passes unsanitized input to service
// EXERCISE: Find and fix the mass assignment vulnerability

import { UserService } from '../services/user.service';

interface Request {
  params: Record<string, string>;
  body: Record<string, unknown>;
  user?: { id: string };
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}

const userService = new UserService();

export class UserController {
  // VULNERABLE: Passes entire request body to service
  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // VULNERABLE: No field filtering
    // Attacker can send: { "name": "Hacker", "role": "admin", "isAdmin": true }
    const updates = req.body;

    const user = await userService.updateUser(userId, updates);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  }

  // VULNERABLE: Registration accepts any fields
  async register(req: Request, res: Response): Promise<void> {
    const userData = req.body;

    // No validation of which fields are allowed
    // Attacker can register with role: "admin"
    const user = await userService.createUser(userData);

    res.status(201).json({ user });
  }

  // VULNERABLE: Admin bulk update with no field validation
  async bulkUpdate(req: Request, res: Response): Promise<void> {
    const { userIds, updates } = req.body as {
      userIds: string[];
      updates: Record<string, unknown>;
    };

    // Passes raw updates to service
    const users = await userService.bulkUpdateUsers(userIds, updates);

    res.status(200).json({ users, updated: users.length });
  }
}

// What the fix should look like (for reference):
//
// const ALLOWED_UPDATE_FIELDS = ['name', 'bio', 'avatarUrl'];
//
// function sanitizeUpdates(body: Record<string, unknown>) {
//   const sanitized: Record<string, unknown> = {};
//   for (const field of ALLOWED_UPDATE_FIELDS) {
//     if (field in body) {
//       sanitized[field] = body[field];
//     }
//   }
//   return sanitized;
// }
