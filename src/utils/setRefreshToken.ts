import { Response } from 'express';
import { ENV } from '../config';

export const setRefreshToken = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production', // Only send over HTTPS in prod
    sameSite: 'strict', // Protects against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};