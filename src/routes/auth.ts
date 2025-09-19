import { Router } from 'express';
import { loginUser, logoutUser, refreshToken, registerUser } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { getLoginSchema, getRegisterSchema } from '../validation/authSchemas';

const router = Router();

router.post('/register', validateRequest(getRegisterSchema), registerUser);
router.post('/login', validateRequest(getLoginSchema), loginUser);
router.post('/refresh-token', refreshToken);
router.post('/logout', logoutUser);

export default router;