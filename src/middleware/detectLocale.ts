import { Request, Response, NextFunction } from 'express';

// Extend Request type to include the `locale` field
declare global {
  namespace Express {
    interface Request {
      locale?: 'en' | 'fr';
    }
  }
}

/**
 * Middleware to detect and set the user's locale (language preference), used for responses.
 *
 * - Attempts to read the locale from the `Accept-Language`.
 * - Falls back to the `locale` cookie if the header is not available.
 * - Defaults `'en'` if no valid locale is found.
 * - Only supports `'en'` (English) and `'fr'` (French). Any other values default to `'en'`.
 * - Sets the detected locale on `req.locale` for use in subsequent middleware/controllers.
 *
 * @param req - Express request object (extended with `locale`).
 * @param _res - Express response object (unused).
 * @param next - Callback to pass control to the next middleware.
 */
export const detectLocale = (req: Request, _res: Response, next: NextFunction) => {
  const fromHeader = req.headers['accept-language']?.toString().slice(0, 2);
  const fromCookie = req.cookies?.locale?.slice(0, 2);

  const supportedLocales = ['en', 'fr'];
  const locale = fromHeader || fromCookie || 'en';

  req.locale = supportedLocales.includes(locale) ? (locale as 'en' | 'fr') : 'en';

  next();
};