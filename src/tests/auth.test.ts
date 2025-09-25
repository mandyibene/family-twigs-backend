import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const resetDatabase = async () => {
  await prisma.user.deleteMany();
};

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('AUTH API - /register', () => {
  it('should register a new user successfully', async () => {
    const email = `register${Date.now()}@example.com`; // Unique email
    const password = 'StrongP@ssw0rd!';

    const res = await request(app)
      .post('/api/auth/register')
      .set('Accept-Language', 'en') // Simulate locale detection
      .send({
        email,
        password,
        confirmPassword: password,
      });
    
    expect(res.statusCode).toBe(201); // checks that the response is HTTP 201
    expect(res.body.accessToken).toBeDefined(); // checks that an access token is returned
    
    
    const setCookieHeader = res.headers['set-cookie'];
    expect(setCookieHeader).toBeDefined();
    
    const cookiesArray = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader];

    const refreshCookie = cookiesArray?.find((cookie) =>
      cookie.startsWith('refreshToken=')
    );

    expect(refreshCookie).toBeDefined(); // checks that a refresh token is in cookies
    expect(refreshCookie).toContain('HttpOnly'); // checks it's HttpOnly
  });

  it('should reject duplicate email', async () => {
    const email = `duplicate${Date.now()}@example.com`;
    const password = 'StrongP@ssw0rd!';

    // Register once
    await request(app)
      .post('/api/auth/register')
      .set('Accept-Language', 'en')
      .send({
        email,
        password,
        confirmPassword: password,
      });

    // Try registering again
    const res = await request(app)
      .post('/api/auth/register')
      .set('Accept-Language', 'en')
      .send({
        email,
        password,
        confirmPassword: password,
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('USER_ALREADY_EXISTS');
  });

  it('should reject weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Accept-Language', 'en')
      .send({
        email: 'invalid@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
    expect(res.body.details).toBeDefined();
  });

  it('should reject mismatched confirmPassword', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Accept-Language', 'en')
      .send({
        email: 'mismatch@example.com',
        password: 'StrongP@ssw0rd!',
        confirmPassword: 'WrongP@ssw0rd!',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });
});