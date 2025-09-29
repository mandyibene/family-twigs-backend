import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT } from '../config';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens';
import { setRefreshToken } from '../utils/setRefreshToken';
import { getMessages } from '../utils/getMessages';
import { sendError, unauthorized } from '../utils/sendError';
import { sendSuccess } from '../utils/sendSuccess';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {

  // Data validated by Zod
  const { email, password, firstName, lastName } = (req as any).validatedData;

  const t = getMessages(req.locale); // Localized messages

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return sendError({
        res,
        status: 409,
        code: 'USER_ALREADY_EXISTS',
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

    // Set refresh token as an httpOnly cookie
    setRefreshToken(res, refreshToken);

    // Return access token in response
    return res.status(201).json({ accessToken });

  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: '[REGISTER ERROR]',
      log: err,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  
  // Data validated by Zod
  const { email, password } = (req as any).validatedData;
  
  const t = getMessages(req.locale); // Localized messages

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError({
        res,
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: t.errors.invalidCredentials,
        context: '[LOGIN ERROR]',
      });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError({
        res,
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: t.errors.invalidCredentials,
        context: '[LOGIN ERROR]',
      });
    }
    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set refresh token as an httpOnly cookie
    setRefreshToken(res, refreshToken);

    // Return access token in response
    return res.status(200).json({ accessToken });

  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: '[LOGIN ERROR]',
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

    // Check if user still exists in DB for security
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return unauthorized(res, t.errors.unauthorized);
    }

    const newAccessToken = generateAccessToken(payload.userId);
    const newRefreshToken = generateRefreshToken(payload.userId);

    // Set new refresh token cookie
    setRefreshToken(res, newRefreshToken);

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return unauthorized(res, t.errors.unauthorized);
  }
};

export const logoutUser = (req: Request, res: Response) => {
  const t = getMessages(req.locale); // Localized messages

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return sendSuccess({ res, message: t.successes.logout });
};