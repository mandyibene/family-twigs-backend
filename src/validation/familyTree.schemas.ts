import { z } from 'zod';
import { zodErrors } from '../locales';

export const getCreateTreeSchema = (locale: 'en' | 'fr') => {
  const t = zodErrors[locale];
  return z.object({
    name: z
    .string()
    .nonempty(t.tree.nonempty)
    .min(3, t.tree.min)
    .max(100, t.tree.max),
  });
}