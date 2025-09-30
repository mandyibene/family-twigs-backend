import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getMessages } from '../utils/getMessages';
import { sendError, sendSuccess, unauthorized } from '../utils/httpResponse';

const prisma = new PrismaClient();

export const getCurrentUser = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  
  const userId = (req as any).userId;
  if (!userId) return unauthorized(res, t.errors.unauthorized);

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
      context: 'GET USER ERROR',
    });
    }

    return sendSuccess({ res, message: t.successes.userFetched, data: { user } });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: 'GET USER ERROR',
      log: err,
    });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  
  const userId = (req as any).userId;
  if (!userId) return unauthorized(res, t.errors.unauthorized);

  const data = (req as any).validatedData;

  try {
    // Check if pseudo is taken
    if (data.pseudo) {
      const isTaken = await prisma.user.findFirst({
        where: {
          pseudo: data.pseudo,
          NOT: { id: userId },
        },
      });

      if (isTaken) {
        return sendError({
          res,
          status: 409,
          code: 'PSEUDO_TAKEN',
          message: t.errors.pseudoTaken,
          context: 'UPDATE PROFILE ERROR',
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        pseudo: true,
        lang: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return sendSuccess({ res, message: t.successes.userFetched, data: { user: updatedUser } });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: 'UPDATE PROFILE ERROR',
      log: err,
    });
  }
};

export const updatePassword = async (req: Request, res: Response) => {

  // Data validated by Zod
  const { currentPassword, newPassword } = (req as any).validatedData;

  const t = getMessages(req.locale); // Localized messages

  const userId = (req as any).userId;
  if (!userId) return unauthorized(res, t.errors.unauthorized);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return sendError({
        res,
        status: 404,
        code: 'USER_NOT_FOUND',
        message: t.errors.userNotFound,
      });
    }

    // Check current password
    const isMatching = await bcrypt.compare(currentPassword, user.password);
    if (!isMatching) {
      return sendError({
        res,
        status: 401,
        code: 'INCORRECT_PASSWORD',
        message: t.errors.incorrectPassword,
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return sendSuccess({ res, message: t.successes.passwordUpdated });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      log: err,
    });
  }
};

export const getUserSessions = async (req: Request, res: Response) => {
  const t = getMessages(req.locale);
  
  const userId = (req as any).userId;
  if (!userId) return unauthorized(res, t.errors.unauthorized);

  try {
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        refreshToken: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        expiresAt: true,
        updatedAt: true,
      },
    });
    
    // Mark current session
    const currentRefreshToken = req.cookies?.refreshToken;
    const sessionsWithCurrentBoolean = sessions.map(session => {
      // Separate refreshToken from other properties, we don't need it in the response
      let {refreshToken, ...s} = session;
      // Add boolean isCurrent
      return {
        ...s,
        isCurrent: currentRefreshToken === session.refreshToken
      }
    })

    return sendSuccess({ res, message: t.successes.sessionsFetched, data: { sessionsWithCurrentBoolean } });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      context: 'GET SESSIONS ERROR',
      message: t.errors.internal,
      log: err,
    });
  }
};
