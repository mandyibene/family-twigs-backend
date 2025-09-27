import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getErrors } from '../utils/getErrors';
import { sendError, unauthorized } from '../utils/sendError';

const prisma = new PrismaClient();

export const createFamilyTree = async (req: Request, res: Response) => {
  const t = getErrors(req.locale);
  const userId = (req as any).userId;
  const { name } = (req as any).validatedData;

  if (!userId) return unauthorized(res, t.errors.unauthorized);

  try {
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
    return res.status(201).json({ tree: newTree });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      log: err,
    });
  }
};

export const getUserTrees = async (req: Request, res: Response) => {
  const t = getErrors(req.locale);
  const userId = (req as any).userId;

  if (!userId) return unauthorized(res, t.errors.unauthorized);

  try {
    const trees = await prisma.familyTree.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: true,
      },
    });
    return res.status(200).json({ trees });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      log: err,
    });
  }
};

export const getOwnedTrees = async (req: Request, res: Response) => {
  const t = getErrors(req.locale);
  const userId = (req as any).userId;

  if (!userId) return unauthorized(res, t.errors.unauthorized);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedTrees: {
          include: {
            members: true,
            people: true,
          },
        },
      },
    });

    return res.status(200).json({ trees: user?.ownedTrees ?? [] });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      log: err,
    });
  }
};

export const getTreeById = async (req: Request, res: Response) => {
  const t = getErrors(req.locale);
  const userId = (req as any).userId;
  const { id } = req.params;

  if (!userId) return unauthorized(res, t.errors.unauthorized);

  if (!id) {
    return sendError({
      res,
      status: 400,
      code: 'INVALID_ID',
      message: 'Tree id is required',
    });
  }

  try {
    const tree = await prisma.familyTree.findFirst({
      where: {
        id,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        people: true,
        members: { include: { user: true } },
        owner: true,
      },
    });

    if (!tree) {
      return sendError({
        res,
        status: 404,
        code: 'TREE_NOT_FOUND',
        message: t.errors.treeNotFound,
      });
    }

    return res.status(200).json({ tree });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      log: err,
    });
  }
};
