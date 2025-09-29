import { Response } from 'express';

type ErrorCode =
  | 'INTERNAL_SERVER_ERROR'
  | 'UNAUTHORIZED'
  | 'USER_ALREADY_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_INPUT'
  | 'INVALID_ID'
  | 'INCORRECT_PASSWORD'
  | 'USER_NOT_FOUND'
  | 'PSEUDO_TAKEN'
  | 'TREE_NOT_FOUND';

interface SendErrorParams {
  res: Response;
  status?: number; // Default: 500
  code: ErrorCode;
  message: string;
  context?: string; // Default: '[SERVER ERROR]'
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