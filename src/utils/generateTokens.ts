import jwt from 'jsonwebtoken';
import { JWT } from '../config';
// Using uuid v8 for Jest test (uuid v9+ is pure ESM, Jest runs in CommonJs by default)
import { v4 as uuidv4 } from 'uuid';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('Missing ACCESS_TOKEN_SECRET in environment variables.');
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error('Missing REFRESH_TOKEN_SECRET in environment variables.');
}

/**
 * Generate a short-lived access token
 *
 * @param userId - The ID of the user
 * @return An access token
 */
export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT.ACCESS_SECRET, { expiresIn: JWT.ACCESS_EXPIRES_IN });
};

/**
 * Generate a long-lived refresh token
 *
 * @param userId - The ID of the user
 * @return A refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { 
      userId,
      jti: uuidv4(), // Add random unique ID to prevent token duplication
    }, 
    JWT.REFRESH_SECRET,
    { 
      expiresIn: JWT.REFRESH_EXPIRES_IN
    }
  );
};