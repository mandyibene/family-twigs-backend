import { z, ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { getMessages } from '../utils/getMessages';
import { cleanInputFields } from '../utils/string';

export const validateRequest = <T>(
  getSchema: (locale: 'en' | 'fr') => ZodType<T>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const t = getMessages(req.locale); // Localized messages
    
    const cleanBody = cleanInputFields(req.body);
    
    const schema = getSchema(req.locale || 'en');
    const result = schema.safeParse(cleanBody);

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

    // Store parsed data in request (to avoid re-validating)
    req.validatedData = result.data;
    next();
  };
};