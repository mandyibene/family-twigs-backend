import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getMessages } from '../utils/getMessages';
import { badRequest, notFound, sendError, sendSuccess, unauthorized } from '../utils/httpResponse';
import { UpdatePasswordInput, UpdateUserProfileInput } from '../types/user.types';

const prisma = new PrismaClient();

export const getCurrentUser = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const userId = req.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("Authenticated user not found in database");
    }

    return sendSuccess({ res, message: t.successes.userFetched, data: { user } });
  } catch (err) {
    return sendError({
      res,
      context: 'GET USER ERROR',
      log: err,
      message: t.errors.internal,
    });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const userId = req.userId;
  const data = req.validatedData as UpdateUserProfileInput; // Data validated by Zod

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
          context: 'UPDATE PROFILE',
          log: "Pseudo is already taken.",
          message: t.errors.pseudoTaken,
          code: 'PSEUDO_TAKEN',
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

    return sendSuccess({ 
      res, 
      message: t.successes.userFetched, 
      data: { user: updatedUser } 
    });
  } catch (err) {
    return sendError({
      res,
      context: 'UPDATE PROFILE',
      log: err,
      message: t.errors.internal,
    });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const userId = req.userId;
  const { currentPassword, newPassword } = req.validatedData as UpdatePasswordInput;

  try {
    const user = await prisma.user.findUnique({ 
      where: { id: userId } 
    });

    if (!user) {
      throw new Error("Authenticated user not found in database");
    }

    // Check current password
    const isMatching = await bcrypt.compare(currentPassword, user.password);
    if (!isMatching) {
      // return sendError({
      //   res,
      //   status: 401,
      //   code: 'INCORRECT_PASSWORD',
      //   context: 'UPDATE PASSWORD',
      //   message: t.errors.incorrectPassword,
      // });
      return unauthorized(res, "UPDATE PASSWORD", "Incorrect password.", t.errors.incorrectPassword, "INCORRECT_PASSWORD")
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
      context: 'UPDATE PASSWORD',
      log: err,
      message: t.errors.internal,
    });
  }
};

export const getUserSessions = async (req: Request, res: Response) => {
  const t = getMessages(req.locale);
  const userId = req.userId;

  try {
    const sessions : {
      id: string;
      refreshToken: string;
      userAgent: string | null;
      ip: string | null;
      createdAt: Date;
      expiresAt: Date;
      updatedAt: Date;
    }[] = await prisma.session.findMany({
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

    return sendSuccess({ 
      res, 
      message: t.successes.sessionsFetched, 
      data: { sessions: sessionsWithCurrentBoolean } 
    });
  } catch (err) {
    return sendError({
      res,
      context: 'GET USER SESSIONS',
      log: err,
      message: t.errors.internal,
    });
  }
};

export const deleteUserSession = async (req: Request, res: Response) => {
  const t = getMessages(req.locale);
  const userId = req.userId;

  const sessionId = req.params.sessionId as string;
  if (!sessionId) return badRequest(res, "DELETE USER SESSION", "Missing sessionId in req.params.", t.errors.noSessionId, "SESSION_ID_REQUIRED");

  try {
    const result = await prisma.session.deleteMany({ // deleteMany returns { count }
      where: { 
        id: sessionId,
        userId
      }
    });

    if (result.count === 0) {
      return notFound(res, "DELETE USER SESSION", "Session not found.", t.errors.notFound);
    }

    return sendSuccess({ res, message: t.successes.sessionDeleted });
  } catch (err) {
    return sendError({
      res,
      context: 'DELETE USER SESSION',
      log: err,
      message: t.errors.internal,
    });
  }
};