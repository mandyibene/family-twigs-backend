import 'express';

// Extends Request
declare global {
  namespace Express {
    interface Request {
      locale?: 'en' | 'fr';
      userId: string;
      validatedData?: unknown;
    }
  }
}