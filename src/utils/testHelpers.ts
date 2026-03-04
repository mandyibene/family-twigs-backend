import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const resetDatabase = async () => {
  await prisma.relationship.deleteMany();   // Depends on Person
  await prisma.person.deleteMany();         // Depends on FamilyTree, User
  await prisma.treeMembership.deleteMany(); // Depends on FamilyTree, User
  await prisma.familyTree.deleteMany();     // Depends on User
  await prisma.session.deleteMany();        // Depends on User
  await prisma.user.deleteMany();
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

export const createTestUser = (
  emailPrefix: string,
  overrides: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }> = {}
) => {
  const timestamp = Date.now();
  
  return {
    email: overrides.email || `${emailPrefix}${timestamp}@example.com`,
    password: overrides.password || 'StrongP@ssw0rd!',
    firstName: overrides.firstName || 'Jolyne',
    lastName: overrides.lastName || 'Cujoh',
  };
};

// ============== AUTH ==============

export const registerUser = async (user: {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
}) => {
  return await request(app)
    .post('/api/auth/register')
    .set('Accept-Language', 'en')
    .send({
      ...user,
      confirmPassword: user.confirmPassword ?? user.password,
    });
};

export const registerAndGetToken = async (user: {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
}) => {
  const res = await registerUser(user);

  const accessToken = res.body.data.accessToken;
  const rawCookies = res.headers['set-cookie'];
  const cookies = rawCookies === undefined ? "" : rawCookies;

  return { accessToken, cookies };
};

export const getRefreshToken = (res: request.Response) => {
  const setCookieHeader = res.headers['set-cookie'];
  if (!setCookieHeader) return undefined;

  const refreshCookie = Array.isArray(setCookieHeader)
    ? setCookieHeader.find((cookie) => cookie.startsWith('refreshToken='))
    : undefined;

  return refreshCookie;
};

export const loginUser = async (email: string, password: string) => {
  return await request(app)
    .post('/api/auth/login')
    .set('Accept-Language', 'en')
    .send({ email, password });
};

// ============== USER ==============

export const getMe = async (accessToken?: string) => {
  if (accessToken) {
    return await request(app)
    .get('/api/users/me')
    .set('Authorization', `Bearer ${accessToken}`);
  }

  return await request(app).get('/api/users/me')
}

type UpdateMeInput = Partial<{
  firstName: string;
  lastName: string;
  pseudo: string;
  lang: string;
}>;

export const updateMe = async (
  accessToken: string, 
  updateInput: UpdateMeInput = {}
) => {
  return await request(app)
    .patch('/api/users/me')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(updateInput);
}

export const updatePassword = async (
  accessToken: string,
  updateInput: {
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  }
) => {
  return await request(app)
    .put('/api/users/me/password')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(updateInput);
}

export const getSessions = async (cookies: string, accessToken?: string) => {
  if (accessToken) {
    return await request(app)
    .get('/api/users/me/sessions')
    .set('Authorization', `Bearer ${accessToken}`)
    .set('Cookie', cookies);
  }

  return await request(app).get('/api/users/me/sessions')
}

// ============== FAMILY TREE ==============

export const createFamilyTree = async (
  accessToken: string,
  name: string
) => {
  return await request(app)
    .post('/api/trees/')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({name});
};

export const updateTreeName = async (
  accessToken: string,
  name: string,
  treeId: string
) => {
  return await request(app)
    .put(`/api/trees/${treeId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({name});
};

export const getUserTrees = async (
  accessToken: string,
) => {
  return await request(app)
    .get('/api/trees/')
    .set('Authorization', `Bearer ${accessToken}`)
};

export const getOwnedTrees = async (
  accessToken: string
) => {
  return await request(app)
    .get('/api/trees/owned/')
    .set('Authorization', `Bearer ${accessToken}`)
};

export const getTreeById = async (
  accessToken: string,
  treeId: string,
) => {
  return await request(app)
    .get(`/api/trees/${treeId}`)
    .set('Authorization', `Bearer ${accessToken}`)
};

export const deleteTree = async (
  accessToken: string,
  treeId: string,
) => {
  return await request(app)
    .delete(`/api/trees/${treeId}`)
    .set('Authorization', `Bearer ${accessToken}`)
};