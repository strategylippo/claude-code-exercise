import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const userController = {
  async findAll(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.findAll();

      res.json({
        status: 'success',
        data: users,
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  },
};
