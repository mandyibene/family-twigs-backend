import { z } from 'zod';

export const getCreateTreeSchema = () =>
  z.object({
    body: z.object({
    name: z.string().min(2),
  }),
});