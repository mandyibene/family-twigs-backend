import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireTreeOwner, requireTreeRole } from '../middleware/roles';
import { validateRequest } from '../middleware/validateRequest';
import { createPerson } from '../controllers/people.controller';
import { getCreatePersonSchema } from '../validation/people.schemas';

const router = Router();

// Add new person to a tree
router.post('/:treeId/people', authenticate, requireTreeRole(false, "EDITOR"), validateRequest(getCreatePersonSchema), createPerson);

export default router;