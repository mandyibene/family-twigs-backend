import { 
  createTestUser, 
  disconnectDatabase, 
  getMe, 
  registerAndGetToken, 
  resetDatabase, 
  updateMe, 
  updatePassword
} from '../utils/testHelpers';

beforeAll(() => {
  process.env.DISABLE_RATE_LIMIT = 'true';
});

afterAll(async () => {
  await disconnectDatabase();
  process.env.DISABLE_RATE_LIMIT = 'false';
});

describe('GET /api/users/me', () => {
  let accessToken: string;
  
  beforeAll(async () => {
    await resetDatabase(); // Clean the db
    const user = createTestUser('me');
    accessToken = await registerAndGetToken(user);
  });

  it('should return user info when authenticated', async () => {
    const res = await getMe(accessToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBeDefined();
    expect(res.body.data.user.email).toMatch(/@example.com/);
  });

  it('should return 401 if no token is provided', async () => {
    const res = await getMe();
    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');

  });

  it('should return 401 if token is invalid', async () => {
    const res = await getMe('invalid.token');
    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('PUT /api/users/me', () => {
  let accessToken: string;

  beforeAll(async () => {
    await resetDatabase();
    const user = createTestUser('update-me', { firstName: 'Giorno', lastName: 'Giovanna' });
    accessToken = await registerAndGetToken(user);
  });

  it('should update user profile', async () => {
    const updatedInfo = {
      firstName: 'Josuke',
      lastName: 'Higashikata',
      pseudo: 'josuke',
      lang: 'fr',
    };

    const res = await updateMe(accessToken, updatedInfo);

    expect(res.status).toBe(200);
    for (const key in updatedInfo) {
      const typedKey = key as keyof typeof updatedInfo;
      expect(res.body.data.user[key]).toBe(updatedInfo[typedKey]);
    }
  });
});

describe('PUT /api/users/me/password', () => {
  let accessToken: string;
  const password = 'OldP@ssw0rd!';
  const newPassword = 'NewP@ssw0rd!';

  const user = createTestUser('update.pwd', {
    password,
    firstName: 'Jonathan',
    lastName: 'Joestar',
  });

  beforeAll(async () => {
    await resetDatabase();
    accessToken = await registerAndGetToken(user);
  });

  it('should update the password when current password is correct', async () => {
    const res = await updatePassword(
      accessToken,
      {
        currentPassword: password,
        newPassword,
        confirmNewPassword: newPassword,
      }
    )

    expect(res.status).toBe(200);
  });

  it('should fail if current password is incorrect', async () => {
    const res = await updatePassword(
      accessToken,
      {
        currentPassword: 'WrongP@ssw0rd!',
        newPassword,
        confirmNewPassword: newPassword,
      }
    )

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INCORRECT_PASSWORD');
  });

  it('should fail if new passwords do not match', async () => { 
    const res = await updatePassword(
      accessToken,
      {
        currentPassword: password,
        newPassword,
        confirmNewPassword: 'AnotherP@ssw0rd!',
      }
    )

    expect(res.status).toBe(400);
  });
});