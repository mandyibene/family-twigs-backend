import 'express';
import { FamilyTreeWithRelations } from './familyTree.types';
import { TreeMembership } from '@prisma/client';

// Extends Request
declare global {
  namespace Express {
    interface Request {
      locale?: 'en' | 'fr';
      validatedData?: unknown;
      userId: string;
      tree: FamilyTreeWithRelations;
      treeMembership?: TreeMembership & { tree?: FamilyTreeWithRelations };
    }
  }
}