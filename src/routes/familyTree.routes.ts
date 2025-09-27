import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { createFamilyTree, getUserTrees, getTreeById, getOwnedTrees } from '../controllers/familyTree.controller';
import { getCreateTreeSchema } from '../validation/familyTree.schemas';

const router = Router();

router.post('/', authenticate, validateRequest(getCreateTreeSchema), createFamilyTree); // Create a new tree
router.get('/', authenticate, getUserTrees); // Trees user is a member of
router.get('/owned', authenticate, getOwnedTrees); // Trees owned by the user
router.get('/:id', authenticate, getTreeById); // Specific tree

export default router;