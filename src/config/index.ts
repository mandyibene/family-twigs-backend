export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
};

export const JWT = {
  ACCESS_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  ACCESS_EXPIRES_IN: '15m' as const, // Treat the value as exact string literal '15m', not just a generic string
  REFRESH_EXPIRES_IN: '7d' as const,
};