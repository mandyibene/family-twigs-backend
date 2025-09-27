import { Router } from 'express';
import { loginUser, logoutUser, refreshToken, registerUser } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { getLoginSchema, getRegisterSchema } from '../validation/auth.schemas';

const router = Router();

router.post('/register', validateRequest(getRegisterSchema), registerUser);
router.post('/login', validateRequest(getLoginSchema), loginUser);
router.post('/refresh-token', refreshToken);
router.post('/logout', logoutUser);

export default router;