import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getErrors } from '../utils/getErrors';
import { sendError, unauthorized } from '../utils/sendError';

const prisma = new PrismaClient();

export const getCurrentUser = async (req: Request, res: Response) => {
  const t = getErrors(req.locale);
  const userId = (req as any).userId;

  if (!userId) {
    return unauthorized(res, t.errors.unauthorized);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError({
      res,
      status: 404,
      code: 'USER_NOT_FOUND',
      message: t.errors.userNotFound,
    });
    }

    return res.status(200).json({ user });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      log: err,
    });
  }
};