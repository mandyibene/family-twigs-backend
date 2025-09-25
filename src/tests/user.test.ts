import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const resetDatabase = async () => {
  await prisma.user.deleteMany();
};

afterAll(async () => {
  await prisma.$disconnect();
});

describe('USER API - /me', () => {
  let accessToken: string;

  beforeAll(async () => {
    await resetDatabase(); // Clean the db

    const email = `me${Date.now()}@example.com`;
    const password = 'StrongP@ssw0rd!';

    // Register the user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email, password, confirmPassword: password });

    accessToken = registerRes.body.accessToken;
  });

  it('should return user info when authenticated', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBeDefined();
    expect(res.body.user.email).toMatch(/@example.com/);
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/user/me');
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 if token is invalid', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', 'Bearer invalid.token');
    expect(res.statusCode).toBe(401);
  });
});