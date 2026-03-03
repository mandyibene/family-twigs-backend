import express from "express";
import type { FamilyTreeWithRelations } from './familyTree.types';
import type { TreeMembership } from '@prisma/client';

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