import { Router } from 'express';
import { deleteUserSession, getCurrentUser, getUserSessions, updatePassword, updateUserProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { getUpdatePasswordSchema, getUpdateUserSchema } from '../validation/user.schemas';
import { updatePasswordRateLimiter } from '../middleware/rateLimiters';

const router = Router();

router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, validateRequest(getUpdateUserSchema), updateUserProfile);
router.put('/me/password', authenticate, updatePasswordRateLimiter, validateRequest(getUpdatePasswordSchema), updatePassword);
router.get('/me/sessions', authenticate, getUserSessions);
router.delete('/me/sessions/:sessionId', authenticate, deleteUserSession);

export default router;