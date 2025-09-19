import jwt from 'jsonwebtoken';
import { JWT } from '../config';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('Missing ACCESS_TOKEN_SECRET in environment variables.');
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error('Missing REFRESH_TOKEN_SECRET in environment variables.');
}

// Short-lived access token
export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT.ACCESS_SECRET, { expiresIn: JWT.ACCESS_EXPIRES_IN });
};

// Long-lived refresh token
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT.REFRESH_SECRET, { expiresIn: JWT.REFRESH_EXPIRES_IN }); // longer-lived
};