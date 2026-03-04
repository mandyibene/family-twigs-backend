import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getMessages } from '../utils/getMessages';
import { badRequest, notFound, sendError, sendSuccess } from '../utils/httpResponse';
import { DeleteTreeParams, FamilyTreeInput, UpdateTreeNameParams } from '../types/familyTree.types';
import { fullTreeInclude } from '../utils/prismaIncludes';

const prisma = new PrismaClient();

export const createFamilyTree = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const userId = req.userId;
  const { name } = req.validatedData as FamilyTreeInput;

  try {
    // Check for duplicated name
    const isTaken = await prisma.familyTree.findFirst({
      where: {
        name,
      },
    });

    if (isTaken) {
      return sendError({
        res,
        status: 409,
        context: 'CREATE TREE',
        log: 'Tree name is already taken',
        message: t.errors.treeNameTaken,
        code: 'TREE_NAME_TAKEN',
      });
    }

    const newTree = await prisma.familyTree.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'MANAGER',
          },
        },
      },
    });
    
    return sendSuccess({ 
      res, 
      status: 201, 
      message: t.successes.treeCreated, 
      data: { tree: newTree } 
    });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: 'CREATE TREE',
      log: err,
    });
  }
};

export const updateTreeName = async (req: Request<UpdateTreeNameParams>, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const { treeId } = req.params;
  const { name } = req.validatedData as FamilyTreeInput;

  try {
    // Check for duplicated name
    const isTaken = await prisma.familyTree.findFirst({
      where: {
        name,
        NOT: { id: treeId },
      },
    });

    if (isTaken) {
      return sendError({
        res,
        status: 409,
        context: 'UPDATE TREE NAME',
        log: 'Tree name is already taken',
        message: t.errors.treeNameTaken,
        code: 'TREE_NAME_TAKEN',
      });
    }

    const updatedTree = await prisma.familyTree.update({
      where: { id: treeId },
      data: { name },
      include: fullTreeInclude,
    });

    return sendSuccess({ 
      res, 
      message: t.successes.treeUpdated, 
      data: { tree: updatedTree } 
    });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: 'UPDATE TREE NAME',
      log: err,
    });
  }
};

export const getUserTrees = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const userId = req.userId;

  try {
    const trees = await prisma.familyTree.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: fullTreeInclude,
    });

    return sendSuccess({ 
      res, 
      status: 200, 
      message: t.successes.treesFetched, 
      data: { trees } 
    });
  } catch (err) {
    return sendError({
      res,
      context: 'GET USER TREES',
      log: err,
      message: t.errors.internal,
    });
  }
};

export const getOwnedTrees = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const userId = req.userId;

  try {
    const trees = await prisma.familyTree.findMany({
      where: {
        ownerId: userId,
      },
      include: fullTreeInclude,
    });

    return sendSuccess({ 
      res, 
      status: 200, 
      message: t.successes.treesFetched, 
      data: { trees } 
    });
  } catch (err) {
    return sendError({
      res,
      context: 'GET OWNED TREES',
      log: err,
      message: t.errors.internal,
    });
  }
};

export const getTreeById = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const userId = req.userId;
  
  const treeId = req.params.treeId as string;
  if (!treeId) return badRequest(res, "GET TREE BY ID", "Missing treeId in req.params.", t.errors.noTreeId, "TREE_ID_REQUIRED");

  try {
    const tree = await prisma.familyTree.findFirst({
      where: {
        id: treeId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: fullTreeInclude,
    });

    if (!tree) {
      return notFound(res, "GET TREE BY ID", "Tree not found.", t.errors.treeNotFound, "TREE_NOT_FOUND");
    }
    
    return sendSuccess({ 
      res, 
      status: 200, 
      message: t.successes.treeFetched, 
      data: { tree }
    });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: 'GET TREE BY ID',
      log: err,
    });
  }
};

export const deleteTree = async (req: Request<DeleteTreeParams>, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const userId = req.userId;
  const { treeId } = req.params;

  try {
    const result = await prisma.familyTree.deleteMany({ 
      where: { 
        id: treeId,
        ownerId: userId // Already checked by requireTreeOwner middleware but there is no harm
      } 
    });

    if (result.count === 0) {
      return notFound(res, "DELETE TREE", "Tree not found.", t.errors.notFound);
    }

    return sendSuccess({ res, message: t.successes.treeDeleted });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: 'DELETE TREE',
      log: err,
    });
  }
};