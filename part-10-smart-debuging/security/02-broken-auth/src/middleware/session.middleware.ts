// Session Middleware - Contains security weaknesses
// EXERCISE: Find and fix the session handling issues

import { AuthService } from '../services/auth.service';

interface Request {
  headers: Record<string, string>;
  user?: { id: string };
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}

type NextFunction = () => void;

const authService = new AuthService();

// VULNERABLE: Weak session validation
export async function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers['authorization'];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  // VULNERABLE: No token format validation
  // Accepts any string as token without checking format

  const isValid = await authService.validateSession(token);

  if (!isValid) {
    res.status(401).json({ error: 'Invalid session' });
    return;
  }

  // VULNERABLE: Extracting user ID from token directly
  // Token format is "userId-timestamp" - easily guessable
  const userId = token.split('-')[0];
  req.user = { id: userId };

  next();
}

// VULNERABLE: No CSRF protection
export function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // TODO: Implement CSRF protection
  // Currently does nothing - all requests are accepted
  next();
}
