// Auth Middleware - Only handles authentication, NOT authorization
// EXERCISE: This middleware authenticates but doesn't authorize

interface Request {
  headers: Record<string, string>;
  user?: { id: string; role: string };
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}

type NextFunction = () => void;

// Mock token store
const tokens: Map<string, { userId: string; role: string }> = new Map([
  ['token-user-1', { userId: 'user-1', role: 'user' }],
  ['token-user-2', { userId: 'user-2', role: 'user' }],
  ['token-admin', { userId: 'admin-1', role: 'admin' }],
]);

// This middleware correctly authenticates users
// But it does NOT handle authorization (access control)
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  const tokenData = tokens.get(token);

  if (!tokenData) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  // Authentication successful - we know WHO the user is
  req.user = {
    id: tokenData.userId,
    role: tokenData.role,
  };

  // NOTE: This middleware does NOT check WHAT the user can access
  // That's the authorization gap - controllers must check permissions
  next();
}

// Role-based middleware (but still doesn't check resource ownership)
export function requireRole(allowedRoles: string[]) {
  return function (req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden - insufficient role' });
      return;
    }

    // This checks role, but still doesn't check resource ownership
    // A 'user' role can still access other users' resources
    next();
  };
}

// MISSING: Resource ownership middleware
// This is what should exist but doesn't:
//
// export function requireOwnership(resourceGetter: (req: Request) => Resource | null) {
//   return function (req: Request, res: Response, next: NextFunction): void {
//     const resource = resourceGetter(req);
//
//     if (!resource) {
//       res.status(404).json({ error: 'Resource not found' });
//       return;
//     }
//
//     if (resource.ownerId !== req.user?.id && req.user?.role !== 'admin') {
//       res.status(403).json({ error: 'Forbidden - not your resource' });
//       return;
//     }
//
//     next();
//   };
// }
