import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireTreeOwner, requireTreeRole } from '../middleware/roles';
import { validateRequest } from '../middleware/validateRequest';
import { createFamilyTree, getUserTrees, getTreeById, getOwnedTrees, updateTreeName, deleteTree } from '../controllers/familyTree.controller';
import { getCreateTreeSchema, getUpdateTreeSchema } from '../validation/familyTree.schemas';

const router = Router();

// Create a new tree
router.post('/', authenticate, validateRequest(getCreateTreeSchema), createFamilyTree);

// Update tree name
router.put('/:treeId', authenticate, requireTreeOwner(), validateRequest(getUpdateTreeSchema), updateTreeName);

// Fetch trees user is a member of
router.get('/', authenticate, getUserTrees);

// Fetch trees owned by the user
router.get('/owned', authenticate, getOwnedTrees);

// Fetch tree by id
router.get('/:treeId', authenticate, requireTreeRole(true), getTreeById);

// Delete tree by id
router.delete('/:treeId', authenticate, requireTreeOwner(), deleteTree);

export default router;