import { z } from 'zod';
import { zodErrors } from '../locales';

const baseTreeSchema = (locale: 'en' | 'fr') => {
  const t = zodErrors[locale];
  return z.object({
    name: z
    .string()
    .nonempty(t.tree.nonempty)
    .min(3, t.tree.min)
    .max(100, t.tree.max),
  });
}

export const getCreateTreeSchema = (locale: 'en' | 'fr') => baseTreeSchema(locale);
export const getUpdateTreeSchema = (locale: 'en' | 'fr') => baseTreeSchema(locale);