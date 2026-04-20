import { Response } from 'express';

// ========================================
// Error Response Handler
// ========================================

type ErrorCode =
  | 'INTERNAL_SERVER_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INSUFFICIENT_ROLE'
  | 'BAD_REQUEST'
  | 'TREE_ID_REQUIRED'
  | 'SESSION_ID_REQUIRED'
  | 'USER_ALREADY_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_INPUT'
  | 'INVALID_ID'
  | 'INCORRECT_PASSWORD'
  | 'USER_NOT_FOUND'
  | 'PSEUDO_TAKEN'
  | 'TREE_NOT_FOUND'
  | 'TREE_NAME_TAKEN'
  | 'INVALID_USER_REFERENCE'
  | 'USER_ALREADY_LINKED';

interface ErrorParams {
  res: Response;
  status?: number;
  context: string;
  log?: unknown;
  code?: ErrorCode;
  message: string;
}

/**
 * Sends a standardized JSON error response and logs the error conditionally.
 * 
 * Returns response in the form : { error: { code: string, message: string } }
 * 
 * Logs the error to the console if:
 * - The status code is 500 or higher (server-side error), OR
 * - A `log` value is explicitly provided.
 *
 * @param {Object} params - Error details.
 * @param {Response} params.res - Express response object.
 * @param {number} [params.status=500] - HTTP status code (defaults to 500).
 * @param {string} params.context - Context label for logging purposes.
 * @param {unknown} params.log - Optional data to log.
 * @param {ErrorCode} [params.code='INTERNAL_SERVER_ERROR'] - Custom application error code.
 * @param {string} params.message - Error message.
 */
export const sendError = ({
  res,
  status = 500,
  context,
  log,
  message,
  code = 'INTERNAL_SERVER_ERROR',
}: ErrorParams) => {
  
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

export const badRequest = (res: Response, context: string, log: string, message: string, code?: ErrorCode) =>
  sendError({ res, status: 400, context, log, message, code: code ?? 'BAD_REQUEST' });

export const unauthorized = (res: Response, context: string, log: string, message: string, code?: ErrorCode) =>
  sendError({ res, status: 401, context, log, message, code: code ?? 'UNAUTHORIZED' });

export const forbidden = (res: Response, context: string, log: string, message: string, code?: ErrorCode) =>
  sendError({ res, status: 403, context, log, message, code: code ?? 'FORBIDDEN' });

export const notFound = (res: Response, context: string, log: string, message: string, code?: ErrorCode) =>
  sendError({ res, status: 404, context, log, message, code: code ?? 'NOT_FOUND' });


// ========================================
// Success Response Handler
// ========================================

interface SendSuccessParams {
  res: Response;
  status?: number; // Default: 200
  message: string;
  data?: object;
}

/**
 * Sends a standardized JSON success response.
 * 
 * Returns response in the form : { message: string, data: {} }
 *
 * @param {Object} params - Success response details.
 * @param {Response} params.res - Express response object.
 * @param {number} [params.status=200] - HTTP status code (defaults to 200).
 * @param {string} params.message - Success message.
 * @param {Object} params.data - Optional data to include in the response body.
 */
export const sendSuccess = ({
  res,
  status = 200,
  message,
  data = {},
}: SendSuccessParams) => {
  return res.status(status).json({ message, data });
};