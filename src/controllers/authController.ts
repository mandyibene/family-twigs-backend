import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getErrors } from '../utils/getErrors';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerUser = async (req: Request, res: Response) => {

  // Data validated by Zod
  const { email, password } = (req as any).validatedData;

  // Localized messages for errors
  const t = getErrors(req.locale);

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
      error: {
        code: 'USER_ALREADY_EXISTS',
        message: t.errors.userExists,
      },
    });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Return token
    return res.status(201).json({ token });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    // return res.status(500).json({ error: 'Internal server error.' });
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: t.errors.internal,
      },
    });
  }
};