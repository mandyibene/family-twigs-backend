import { Router } from 'express';
import { loginUser, logoutAllSessions, logoutUser, refreshToken, registerUser } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { getLoginSchema, getRegisterSchema } from '../validation/auth.schemas';
import { loginRateLimiter, registerRateLimiter } from '../middleware/rateLimiters';

const router = Router();

// Register user
router.post('/register', registerRateLimiter, validateRequest(getRegisterSchema), registerUser);

// Login user
router.post('/login', loginRateLimiter, validateRequest(getLoginSchema), loginUser);

// Refresh access token
router.post('/refresh-token', refreshToken);

// Logout from current session
router.post('/logout', logoutUser);

// Logout from all sessions
router.post('/logout-all', logoutAllSessions);

export default router;