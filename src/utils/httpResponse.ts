import { Response } from 'express';

// ========================================
// Error Response Handler
// ========================================

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
  code?: ErrorCode; // Default: 'INTERNAL_SERVER_ERROR'
  message: string;
  context?: string; // Default: 'SERVER ERROR'
  log?: unknown;
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
 * @param {ErrorCode} [params.code='INTERNAL_SERVER_ERROR'] - Custom application error code.
 * @param {string} params.message - Error message.
 * @param {string} [params.context='SERVER ERROR'] - Context label for logging purposes.
 * @param {unknown} params.log - Optional data to log.
 */
export const sendError = ({
  res,
  status = 500,
  code = 'INTERNAL_SERVER_ERROR',
  context = 'SERVER ERROR',
  message,
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