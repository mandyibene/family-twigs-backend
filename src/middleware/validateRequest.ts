import { z, ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { getMessages } from '../utils/getMessages';
import { cleanInputFields } from '../utils/string';

export const validateRequest = <T>(
  getSchema: (locale: 'en' | 'fr') => ZodType<T>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Request extended with locale field in detectLocale middleware
    const schema = getSchema(req.locale || 'en');

    const cleanBody = cleanInputFields(req.body);
    const result = schema.safeParse(cleanBody);

    const t = getMessages(req.locale); // Localized messages

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
    req.validatedData = result.data;
    next();
  };
};