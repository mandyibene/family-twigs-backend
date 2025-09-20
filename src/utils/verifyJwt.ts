import jwt from 'jsonwebtoken';

// <T> : generic placeholder for the expected payload shape
// decoded as T : casts the verified JWT to that shape
// T | null : return same shape back or null
export const verifyJwt = <T>(token: string, secret: string): T | null => {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'object' && decoded !== null) {
      return decoded as T;
    }
    return null;
  } catch {
    return null;
  }
};