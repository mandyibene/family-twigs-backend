import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireTreeOwner, requireTreeRole } from '../middleware/roles';
import { validateRequest } from '../middleware/validateRequest';
import { createPerson, deletePerson, getPeople, getPersonById, updatePerson } from '../controllers/people.controller';
import { getCreatePersonSchema, getUpdatePersonSchema } from '../validation/people.schemas';

const router = Router();

// Add new person to a tree
router.post('/:treeId/people', authenticate, requireTreeRole(false, "EDITOR"), validateRequest(getCreatePersonSchema), createPerson);

// Update person
router.put('/:treeId/people/:personId', authenticate, requireTreeOwner(), validateRequest(getUpdatePersonSchema), updatePerson);

// Update user linked to person
router.put('/:treeId/people/:personId', authenticate, requireTreeOwner(), validateRequest(getUpdatePersonSchema), updatePerson);

// Fetch people in tree
router.get('/:treeId/people/', authenticate, requireTreeRole(false), getPeople);

// Fetch person by id
router.get('/:treeId/people/:personId', authenticate, requireTreeRole(false), getPersonById);

// Delete tree by id
router.delete('/:treeId/people/:personId', authenticate, requireTreeRole(false, "EDITOR"), deletePerson);

export default router;