import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { getMessages } from '../utils/getMessages';
import { ENV } from '../config';

const isTest = ENV.NODE_ENV === 'test';

const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  code?: string;
  messageKey: keyof ReturnType<typeof getMessages>['errors'];
}) => {
  return rateLimit({
    windowMs: isTest ? 1000 : options.windowMs || 15 * 60 * 1000, // 1s in test, 15 min default
    max: isTest ? 2 : options.max || 5, // 2 attempts in test, 5 attempts default
    message: (req: Request) => {
      const t = getMessages(req.locale);
      return { // Body of the 429 Too Many Requests error
        error: {
          code: options.code || 'TOO_MANY_REQUESTS',
          message: t.errors[options.messageKey || 'internal'],
        }
      };
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTest && process.env.DISABLE_RATE_LIMIT === 'true', // Skip limiter
  });
};

export const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  code: 'TOO_MANY_REGISTER_ATTEMPTS',
  messageKey: 'tooManyRegister',
});

export const loginRateLimiter = createRateLimiter({
  code: 'TOO_MANY_LOGIN_ATTEMPTS',
  messageKey: 'tooManyLogin',
});

export const updatePasswordRateLimiter = createRateLimiter({
  code: 'TOO_MANY_UPDATE_PASSWORD_ATTEMPTS',
  messageKey: 'tooManyUpdatePassword',
});