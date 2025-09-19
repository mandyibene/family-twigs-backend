import { Response } from 'express';

interface SendSuccessParams {
  res: Response;
  status?: number;
  message: string;
  data?: object;
}

export const sendSuccess = ({
  res,
  status = 200,
  message,
  data = {},
}: SendSuccessParams) => {
  return res.status(status).json({ message, ...data });
};