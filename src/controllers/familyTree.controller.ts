import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getMessages } from '../utils/getMessages';
import { sendError, sendSuccess } from '../utils/httpResponse';
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
        code: 'TREE_NAME_TAKEN',
        message: t.errors.treeNameTaken,
        context: 'CREATE TREE',
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
        code: 'TREE_NAME_TAKEN',
        message: t.errors.treeNameTaken,
        context: 'UPDATE TREE NAME',
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
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: 'GET USER TREES',
      log: err,
    });
  }
};

export const getOwnedTrees = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const userId = req.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedTrees: {
          include: fullTreeInclude,
        },
      },
    });

    return sendSuccess({ 
      res, 
      status: 200, 
      message: t.successes.treesFetched, 
      data: { trees: user?.ownedTrees ?? [] } 
    });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: 'GET OWNED TREES',
      log: err,
    });
  }
};

export const getTreeById = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  
  return sendSuccess({ 
    res, status: 200, 
    message: t.successes.treeFetched, 
    data: { tree: req.tree } 
  });
};

export const deleteTree = async (req: Request<DeleteTreeParams>, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const { treeId } = req.params;

  try {
    await prisma.familyTree.delete({ where: { id: treeId } });

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