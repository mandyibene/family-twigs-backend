import { Router } from 'express';
import { getCurrentUser } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/me', authenticate, getCurrentUser);

export default router;