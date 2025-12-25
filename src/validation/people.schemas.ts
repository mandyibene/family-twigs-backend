import { z } from 'zod';
import { zodErrors } from '../locales';

export const getCreatePersonSchema = (locale: 'en' | 'fr') => {
  const t = zodErrors[locale];
  return z.object({
    fullName: z
      .string()
      .nonempty(t.lastName.nonempty)
      .max(50, t.lastName.max),
    birthDate: z
      .coerce.date()
      .optional(),
    deathDate: z
      .coerce.date()
      .optional(),
    gender: z
      .string()
      .max(20, t.lastName.max)
      .optional(),
    userId: z
      .uuid()
      .optional(),
    photoUrl: z
      .url()
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