import { Request, Response, NextFunction } from 'express';
import { JWT } from '../config';
import { getMessages } from '../utils/getMessages';
import { unauthorized } from '../utils/httpResponse';
import { verifyJwt } from '../utils/verifyJwt';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * Middleware to authenticate requests using a JWT access token.
 *
 * - Extracts the `Authorization` header (expects format: `Bearer <token>`).
 * - Verifies the JWT using the access token secret.
 * - On success, attaches `userId` from the token payload to `req.userId`.
 * - On failure (missing/invalid/expired token), responds with 401 Unauthorized and localized error message.
 *
 * @param req - Express request object (extended with `locale`).
 * @param res - Express response object.
 * @param next - Callback to pass control to the next middleware.
 *
 * @returns 401 response if authentication fails, otherwise calls `next()`.
 */
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const t = getMessages(req.locale); // Localized messages
  const authHeader = req.headers.authorization; // Extract Bearer <token> from headers
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, t.errors.unauthorized);
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) return unauthorized(res, t.errors.unauthorized);

  try {
    const payload = verifyJwt<{ userId: string }>(token, JWT.ACCESS_SECRET); // Verify JWT

    if (!payload) return unauthorized(res, t.errors.unauthorized);

    req.userId = payload.userId; // Extends req with `userId` key to use in protected controllers
    next();
  } catch (err) {
    return unauthorized(res, t.errors.unauthorized);
  }
};
