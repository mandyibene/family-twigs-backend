import { Request, Response, NextFunction } from 'express';

// Extend Request type to include the `locale` field
declare global {
  namespace Express {
    interface Request {
      locale?: 'en' | 'fr';
    }
  }
}

export const detectLocale = (req: Request, res: Response, next: NextFunction) => {
  const fromHeader = req.headers['accept-language']?.toString().slice(0, 2);
  const fromCookie = req.cookies?.locale?.slice(0, 2);

  const supportedLocales = ['en', 'fr'];
  const locale = fromHeader || fromCookie || 'en';

  req.locale = supportedLocales.includes(locale) ? (locale as 'en' | 'fr') : 'en';

  next();
};