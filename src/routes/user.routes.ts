import { Router } from 'express';
import { deleteUserSession, getCurrentUser, getUserSessions, updatePassword, updateUserProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { getUpdatePasswordSchema, getUpdateUserSchema } from '../validation/user.schemas';
import { updatePasswordRateLimiter } from '../middleware/rateLimiters';

const router = Router();

// Fetch curent user
router.get('/me', authenticate, getCurrentUser);

// Update current user
router.patch('/me', authenticate, validateRequest(getUpdateUserSchema), updateUserProfile);

// Update password
router.put('/me/password', authenticate, updatePasswordRateLimiter, validateRequest(getUpdatePasswordSchema), updatePassword);

// Fetch user sessions
router.get('/me/sessions', authenticate, getUserSessions);

// Delete session by id
router.delete('/me/sessions/:sessionId', authenticate, deleteUserSession);

export default router;