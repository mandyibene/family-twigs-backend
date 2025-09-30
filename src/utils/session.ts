import { JWT } from '../config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRefreshTokenExpiryDate = () => {
  const expiresInDays = JWT.REFRESH_EXPIRES_IN ? parseInt(JWT.REFRESH_EXPIRES_IN) : 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  return expiresAt;
};

/**
 * Creates a session record in the database for a user.
 *
 * @param userId - The ID of the user
 * @param refreshToken - The refresh token to store
 */
export async function createSession(userId: string, refreshToken: string) {
  const expiresAt = getRefreshTokenExpiryDate();

  return await prisma.session.create({
    data: {
      userId,
      refreshToken,
      expiresAt,
    },
  });
}