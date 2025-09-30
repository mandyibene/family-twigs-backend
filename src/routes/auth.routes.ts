import { Router } from 'express';
import { loginUser, logoutAllSessions, logoutUser, refreshToken, registerUser } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { getLoginSchema, getRegisterSchema } from '../validation/auth.schemas';
import { loginRateLimiter, registerRateLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post('/register', registerRateLimiter, validateRequest(getRegisterSchema), registerUser);
router.post('/login', loginRateLimiter, validateRequest(getLoginSchema), loginUser);
router.post('/refresh-token', refreshToken);
router.post('/logout', logoutUser);
router.post('/logout-all', logoutAllSessions);

export default router;