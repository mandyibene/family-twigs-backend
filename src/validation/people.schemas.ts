import { z } from 'zod';
import { zodErrors } from '../locales';

const basePersonSchema = (locale: 'en' | 'fr') => {
  const t = zodErrors[locale];
  return z.object({
    fullName: z
      .string()
      .nonempty(t.fullName.nonempty)
      .max(100, t.fullName.max),
    birthDate: z
      .coerce.date()
      .optional(),
    deathDate: z
      .coerce.date()
      .optional(),
    gender: z
      .string()
      .max(20, t.gender.max)
      .optional(),
  })
  .refine(
    (data) =>
      !data.birthDate ||
      !data.deathDate ||
      data.deathDate >= data.birthDate,
    {
      path: ['deathDate'], // Tells Zod which field the error belongs to
      message: t.date.invalidOrder,
    }
  );
}

export const getCreatePersonSchema = (locale: 'en' | 'fr') => {
  return basePersonSchema(locale).extend({
    userId: z
      .uuid()
      .optional(),
    photoUrl: z
      .url()
      .optional(),
  })
}

export const getUpdatePersonSchema = (locale: 'en' | 'fr') => basePersonSchema(locale)

export const getUpdatePersonUserSchema = (locale: 'en' | 'fr') => {
  const t = zodErrors[locale];
  return z.object({
    userId: z
      .uuid()
      .optional(),
  })
}