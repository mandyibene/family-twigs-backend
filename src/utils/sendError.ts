import { Response } from 'express';

type ErrorCode =
  | 'INTERNAL_SERVER_ERROR'
  | 'UNAUTHORIZED'
  | 'USER_ALREADY_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_INPUT'
  | 'USER_NOT_FOUND';

interface SendErrorParams {
  res: Response;
  status?: number; // default: 500
  code: ErrorCode;
  message: string;
  context?: string;
  log?: unknown;
}

export const sendError = ({
  res,
  status = 500,
  code,
  message,
  context = '[SERVER ERROR]',
  log,
}: SendErrorParams) => {
  
  if (status >= 500 || log) {
    console.error(`[${context}]`, log || message);
  }

  return res.status(status).json({
    error: {
      code,
      message,
    },
  });
};

export const unauthorized = (res: Response, message: string) =>
  sendError({ res, status: 401, code: 'UNAUTHORIZED', message });