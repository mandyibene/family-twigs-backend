import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT } from '../config';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens';
import { setRefreshToken } from '../utils/setRefreshToken';
import { getMessages } from '../utils/getMessages';
import { sendError, sendSuccess, unauthorized } from '../utils/httpResponse';
import { createSession } from '../utils/session';
import { LoginUserInput, RegisterUserInput } from '../types/auth.types';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {

  // Data validated by Zod
  const { email, password, firstName, lastName } = req.validatedData as RegisterUserInput;

  const t = getMessages(req.locale); // Localized messages

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return sendError({
        res,
        status: 409,
        code: 'USER_ALREADY_EXISTS',
        context: 'REGISTER ERROR',
        message: t.errors.userExists,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    // Store session in db
    await createSession(newUser.id, refreshToken);

    // Set refresh token as an httpOnly cookie
    setRefreshToken(res, refreshToken);

    // Return access token in response
    // return res.status(201).json({ accessToken });
    return sendSuccess({ res, status: 201, message: t.successes.register, data: { accessToken } });

  } catch (err) {
    return sendError({
      res,
      context: 'REGISTER ERROR',
      message: t.errors.internal,
      log: err,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  
  // Data validated by Zod
  const { email, password } = req.validatedData as LoginUserInput;
  
  const t = getMessages(req.locale); // Localized messages

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError({
        res,
        status: 401,
        code: 'INVALID_CREDENTIALS',
        context: 'LOGIN ERROR',
        message: t.errors.invalidCredentials,
      });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError({
        res,
        status: 401,
        code: 'INVALID_CREDENTIALS',
        context: 'LOGIN ERROR',
        message: t.errors.invalidCredentials,
      });
    }
    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store session in db
    await createSession(user.id, refreshToken);

    // Set refresh token as an httpOnly cookie
    setRefreshToken(res, refreshToken);

    // Return access token in response
    // return res.status(200).json({ accessToken });
    return sendSuccess({ res, message: t.successes.login, data: { accessToken } });

  } catch (err) {
    return sendError({
      res,
      context: 'LOGIN ERROR',
      message: t.errors.internal,
      log: err,
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages

  // Get refresh token from cookies
  const token = req.cookies?.refreshToken;
  if (!token) {
    return unauthorized(res, t.errors.unauthorized);
  }

  try {
    const payload = jwt.verify(token, JWT.REFRESH_SECRET) as { userId: string };

    // Check if session exists and hasn't expired
    const session = await prisma.session.findUnique({
      where: { refreshToken: token },
    })
    if (!session || session.expiresAt < new Date()) {
      return unauthorized(res, t.errors.unauthorized);
    }

    // Check if user still exists in db for security
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return unauthorized(res, t.errors.unauthorized);
    }

    // Invalidate old session
    await prisma.session.delete({ where: { id: session.id } });

    const newAccessToken = generateAccessToken(payload.userId);
    const newRefreshToken = generateRefreshToken(payload.userId);

    // Create a new session
    await createSession(user.id, newRefreshToken);

    // Set new refresh token cookie
    setRefreshToken(res, newRefreshToken);

    // return res.json({ accessToken: newAccessToken });
    return sendSuccess({ res, message: t.successes.refresh, data: { accessToken: newAccessToken } });
  } catch (err) {
    return unauthorized(res, t.errors.unauthorized);
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages

  // Get refresh token from cookies
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      // Attempt to remove session from db (even if token is expired)
      await prisma.session.deleteMany({
        where: { refreshToken: token },
      });
    } catch (err) {
      return sendError({
        res,
        code: 'INTERNAL_SERVER_ERROR',
        context: 'LOGOUT ERROR',
        message: t.errors.internal,
        log: err,
      });
    }
  }

  // Clear the refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return sendSuccess({ res, message: t.successes.logout });
};

export const logoutAllSessions = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages

  const token = req.cookies?.refreshToken;
  if (!token) {
    return unauthorized(res, t.errors.unauthorized);
  }

  try {
    // Decode and verify the refresh token
    const payload = jwt.verify(token, JWT.REFRESH_SECRET) as { userId: string };

    // Delete all sessions for that user
    await prisma.session.deleteMany({
      where: {
        userId: payload.userId,
      },
    });

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return sendSuccess({ res, message: t.successes.logout });
  } catch (err) {
    if (
      err instanceof TokenExpiredError ||
      err instanceof JsonWebTokenError
    ) {
      return unauthorized(res, t.errors.unauthorized);
    }

    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      context: 'LOGOUT ALL SESSIONS ERROR',
      message: t.errors.internal,
      log: err,
    });
  }
};