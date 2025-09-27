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

describe('AUTH API - /register', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('should register a new user successfully + return access token + set refresh token cookie', async () => {
    const email = `register${Date.now()}@example.com`; // Unique email
    const password = 'StrongP@ssw0rd!';
    const firstName = 'Jolyne';
    const lastName = 'Cujoh';

    const res = await request(app)
      .post('/api/auth/register')
      .set('Accept-Language', 'en') // Simulate locale detection
      .send({
        email,
        password,
        confirmPassword: password,
        firstName,
        lastName,
      });
    
    expect(res.statusCode).toBe(201); // Checks that the response is HTTP 201 Created
    expect(res.body.accessToken).toBeDefined(); // Checks that an access token is returned
    
    const setCookieHeader = res.headers['set-cookie'];
    expect(setCookieHeader).toBeDefined();
    const refreshCookie = Array.isArray(setCookieHeader)
      ? setCookieHeader.find(cookie => cookie.startsWith('refreshToken='))
      : undefined;

    expect(refreshCookie).toBeDefined(); // Checks that a refresh token is in cookies
    expect(refreshCookie).toContain('HttpOnly'); // Checks that it's HttpOnly
  });

  it('should reject duplicate email', async () => {
    const email = `duplicate${Date.now()}@example.com`;
    const password = 'StrongP@ssw0rd!';
    const firstName = 'Jolyne';
    const lastName = 'Cujoh';

    // Register once
    await request(app)
      .post('/api/auth/register')
      .set('Accept-Language', 'en')
      .send({
        email,
        password,
        confirmPassword: password,
        firstName,
        lastName,
      });

    // Try registering again
    const res = await request(app)
      .post('/api/auth/register')
      .set('Accept-Language', 'en')
      .send({
        email,
        password,
        confirmPassword: password,
        firstName,
        lastName,
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('USER_ALREADY_EXISTS');
  });

  it('should reject weak password', async () => {
    const email = `invalid${Date.now()}@example.com`;
    const password = 'weak';
    const firstName = 'Jolyne';
    const lastName = 'Cujoh';

    const res = await request(app)
      .post('/api/auth/register')
      .set('Accept-Language', 'en')
      .send({
        email,
        password,
        confirmPassword: password,
        firstName,
        lastName,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
    expect(res.body.details).toBeDefined();
  });

  it('should reject mismatched confirmPassword', async () => {
    const email = `mismatch${Date.now()}@example.com`;
    const password = 'StrongP@ssw0rd!';
    const firstName = 'Jolyne';
    const lastName = 'Cujoh';

    const res = await request(app)
      .post('/api/auth/register')
      .set('Accept-Language', 'en')
      .send({
        email,
        password,
        confirmPassword: 'WrongP@ssw0rd!',
        firstName,
        lastName,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });
});

describe('AUTH API - /login', () => {
  const testUser = {
    email: `login${Date.now()}@example.com`,
    password: 'StrongP@ssw0rd!',
    firstName: `Jolyne`,
    lastName: `Cujoh`,
  };

  beforeAll(async () => {
    await resetDatabase(); // Clean the db
    
    // Register a user we can login with
    await request(app).post('/api/auth/register')
      .set('Accept-Language', 'en')
      .send({
        email: testUser.email,
        password: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        confirmPassword: testUser.password,
      });
  });

  it('should login successfully + return access token + set refresh token cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Accept-Language', 'en')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200); // Checks that the response is HTTP 200 OK
    expect(res.body.accessToken).toBeDefined(); // Checks that an access token is returned

    const setCookieHeader = res.headers['set-cookie'];
    expect(setCookieHeader).toBeDefined();
    const refreshCookie = Array.isArray(setCookieHeader)
      ? setCookieHeader.find(cookie => cookie.startsWith('refreshToken='))
      : undefined;
    
    expect(refreshCookie).toBeDefined(); // Checks that a refresh token is in cookies
    expect(refreshCookie).toContain('HttpOnly'); // Checks that it's HttpOnly
  });

  it('should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Accept-Language', 'en')
      .send({
        email: testUser.email,
        password: 'WrongP@ssw0rd!',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Accept-Language', 'en')
      .send({
        email: 'notfound@example.com',
        password: 'RandomP@ssw0rd!',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});