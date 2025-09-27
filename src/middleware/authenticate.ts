import { Request, Response, NextFunction } from 'express';
import { JWT } from '../config';
import { getErrors } from '../utils/getErrors';
import { unauthorized } from '../utils/sendError';
import { verifyJwt } from '../utils/verifyJwt';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const t = getErrors(req.locale);

  // Extract Bearer <token> from headers
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, t.errors.unauthorized);
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) return unauthorized(res, t.errors.unauthorized);

  try {
    // Verify JWT
    const payload = verifyJwt<{ userId: string }>(token, JWT.ACCESS_SECRET);

    if (!payload) return unauthorized(res, t.errors.unauthorized);

    // Add req.userId to use in protected controllers
    req.userId = payload.userId;
    next();
  } catch (err) {
    return unauthorized(res, t.errors.unauthorized);
  }
};
