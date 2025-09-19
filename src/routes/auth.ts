import { Router } from 'express';
import { registerUser } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { getRegisterSchema } from '../validation/authSchemas';

const router = Router();

// router.post('/register', registerUser);
router.post('/register', validateRequest(getRegisterSchema), registerUser);

export default router;