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
  const t = getMessages(req.locale); // Localized messages

  // Data validated by Zod
  const { email, password, firstName, lastName } = req.validatedData as RegisterUserInput;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return sendError({
        res,
        status: 409,
        context: 'REGISTER ERROR',
        log: "User already exists in db.",
        message: t.errors.userExists,
        code: 'USER_ALREADY_EXISTS',
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
    return sendSuccess({ 
      res, 
      status: 201, 
      message: t.successes.register, 
      data: { accessToken } 
    });

  } catch (err) {
    return sendError({
      res,
      context: 'REGISTER ERROR',
      log: err,
      message: t.errors.internal,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages

  // Data validated by Zod
  const { email, password } = req.validatedData as LoginUserInput;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError({
        res,
        status: 401,
        context: 'LOGIN ERROR',
        log: "User doesn't exist in db.",
        message: t.errors.invalidCredentials,
        code: 'INVALID_CREDENTIALS',
      });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError({
        res,
        status: 401,
        context: 'LOGIN ERROR',
        log: "Password is incorrect.",
        message: t.errors.invalidCredentials,
        code: 'INVALID_CREDENTIALS',
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
    return sendSuccess({ 
      res, 
      message: t.successes.login, 
      data: { accessToken } 
    });

  } catch (err) {
    return sendError({
      res,
      context: 'LOGIN ERROR',
      log: err,
      message: t.errors.internal,
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages

  // Get refresh token from cookies
  const token = req.cookies?.refreshToken;
  if (!token) {
    return unauthorized(res, "REFRESH TOKEN", "There is no token.", t.errors.unauthorized);
  }

  try {
    const payload = jwt.verify(token, JWT.REFRESH_SECRET) as { userId: string };

    // Check if session exists and hasn't expired
    const session = await prisma.session.findUnique({
      where: { refreshToken: token },
    })
    if (!session || session.expiresAt < new Date()) {
      return unauthorized(res, "REFRESH TOKEN", "No matching session, token is invalid.", t.errors.unauthorized);
    }

    // Check if user still exists in db for security
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return unauthorized(res, "REFRESH TOKEN", "User is not in db.", t.errors.unauthorized);
    }

    // Invalidate old session
    await prisma.session.delete({ where: { id: session.id } });

    const newAccessToken = generateAccessToken(payload.userId);
    const newRefreshToken = generateRefreshToken(payload.userId);

    // Create a new session
    await createSession(user.id, newRefreshToken);

    // Set new refresh token cookie
    setRefreshToken(res, newRefreshToken);

    return sendSuccess({ 
      res, 
      message: t.successes.refresh, 
      data: { accessToken: newAccessToken } 
    });
  } catch (err) {
    if (
      err instanceof TokenExpiredError ||
      err instanceof JsonWebTokenError
    ) {
      return unauthorized(res, "REFRESH TOKEN", "Token is invalid.", t.errors.unauthorized);
    }

    return sendError({
      res,
      context: 'REFRESH TOKEN',
      log: err,
      message: t.errors.internal,
    });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages

  // Get refresh token from cookies
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      // Attempt to remove session from db (even if token is invalid or expired)
      await prisma.session.deleteMany({
        where: { refreshToken: token },
      });
    } catch (err) {
      // Ignore because we're going to clear the the refresh token cookie anyway
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

  try {
    if(token) {
      try {
        // Decode and verify the refresh token
        const payload = jwt.verify(token, JWT.REFRESH_SECRET) as { userId: string };
  
        // Delete all sessions for that user
        await prisma.session.deleteMany({
          where: { userId: payload.userId },
        });
      } catch (error) {
        // Ignore because we're going to clear the the refresh token cookie anyway
      }  
    }

    // Clear the refresh token cookie whatever happens
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return sendSuccess({ res, message: t.successes.logout });
  } catch (err) {
    return sendError({
      res,
      context: 'LOGOUT ALL SESSIONS',
      log: err,
      message: t.errors.internal,
    });
  }
};