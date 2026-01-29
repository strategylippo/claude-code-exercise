import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

// POST /auth/register - Register a new user
router.post(
  '/register',
  validate({ body: registerSchema }),
  authController.register
);

// POST /auth/login - Login user
router.post(
  '/login',
  validate({ body: loginSchema }),
  authController.login
);

// GET /auth/me - Get current user
router.get('/me', authenticate, authController.me);

export default router;
