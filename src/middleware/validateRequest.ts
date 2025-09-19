import { z, ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { getErrors } from '../utils/getErrors';

export const validateRequest = <T>(
  getSchema: (locale: 'en' | 'fr') => ZodType<T>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Request extended with locale field in detectLocale middleware
    const schema = getSchema(req.locale || 'en');

    const result = schema.safeParse(req.body);

    // Localized messages for errors
    const t = getErrors(req.locale);

    if (!result.success) {
      const details = z.treeifyError(result.error);
      
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: t.errors.invalidInput
        },
        details: details,
      });
    }

    // Store parsed data on request (to avoid re-validating)
    (req as any).validatedData = result.data;
    next();
  };
};