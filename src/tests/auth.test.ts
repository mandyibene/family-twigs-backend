import {
  resetDatabase,
  disconnectDatabase,
  registerUser,
  loginUser,
  getRefreshToken,
  createTestUser,
} from '../utils/testHelpers';

beforeAll(() => {
  process.env.DISABLE_RATE_LIMIT = 'true';
});

afterAll(async () => {
  await disconnectDatabase();
  process.env.DISABLE_RATE_LIMIT = 'false';
});

describe('POST /api/auth/register', () => {
  beforeEach(resetDatabase); // Clean the db

  it('should register a new user successfully + return access token + set refresh token cookie', async () => {
    const user = createTestUser('register');
    const res = await registerUser(user);
    
    expect(res.statusCode).toBe(201); // Checks that the response is HTTP 201 Created
    expect(res.body.data.accessToken).toBeDefined(); // Checks that an access token is returned

    const refreshCookie = getRefreshToken(res);
    expect(refreshCookie).toBeDefined(); // Checks that a refresh token is in cookies
    expect(refreshCookie).toContain('HttpOnly'); // Checks that it's HttpOnly
  });

  it('should reject duplicate email', async () => {
    const user = createTestUser('duplicate');
    await registerUser(user);
    const res = await registerUser(user);

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('USER_ALREADY_EXISTS');
  });

  it('should reject weak password', async () => {
    const res = await registerUser({
      ...createTestUser('weak.pwd'),
      password: 'weak',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
    expect(res.body.details).toBeDefined();
  });

  it('should reject mismatched confirmPassword', async () => {
    const res = await registerUser({
      ...createTestUser('mismatch.pwd'),
      confirmPassword: 'WrongP@ssw0rd!',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });
});

describe('POST /api/auth/login', () => {
  const user = createTestUser('login', {firstName: 'Joseph', lastName: 'Joestar'});

  beforeAll(async () => {
    await resetDatabase();
    await registerUser(user);
  });

  it('should login successfully + return access token + set refresh token cookie', async () => {
    const res = await loginUser(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();

    const refreshCookie = getRefreshToken(res);
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
  });

  it('should reject login with incorrect password', async () => {

    const res = await loginUser(user.email, 'WrongP@ssw0rd!');
    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should reject login with non-existent email', async () => {
    const res = await loginUser('notfound.email@example.com', 'RandomP@ssw0rd!');
    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('[RATE LIMITING] POST /api/auth/login', () => {
  const user = createTestUser('ratelimit.login');

  beforeAll(async () => {
    await resetDatabase();
    process.env.DISABLE_RATE_LIMIT = 'false'; // Enable rate limiting
    await registerUser(user);
  });

  afterAll(() => {
    process.env.DISABLE_RATE_LIMIT = 'true'; // Disable rate limiting for other tests
  });

  it('should allow 2 login attempts and block the 3rd', async () => {
    await loginUser(user.email, user.password);
    await loginUser(user.email, user.password);
    const res = await loginUser(user.email, user.password);

    expect(res.statusCode).toBe(429);
    expect(res.body.error.code).toBe('TOO_MANY_LOGIN_ATTEMPTS');
  });
});