import { z } from 'zod';
import { zodErrors } from '../locales/zodErrors';

export const getUpdateUserSchema = (locale: 'en' | 'fr') => {
  const t = zodErrors[locale];
  
  return z.object({
    firstName: z
      .string()
      .nonempty(t.firstName.nonempty)
      .max(50, t.firstName.max)
      .optional(),
    lastName: z
      .string()
      .nonempty(t.lastName.nonempty)
      .max(50, t.lastName.max)
      .optional(),
    pseudo: z
      .string()
      .min(3, t.pseudo.min)
      .max(30, t.pseudo.max)
      .optional(),
    lang: z.enum(['en', 'fr']).optional(),
  });
}

export const getUpdatePasswordSchema = (locale: 'en' | 'fr') => {
  const t = zodErrors[locale];

  return z.object({
    currentPassword: z.string(),
    newPassword: z
      .string()
      .min(8, t.password.min)
      .max(100, t.password.max)
      .regex(/[A-Z]/, t.password.uppercase)
      .regex(/[a-z]/, t.password.lowercase)
      .regex(/[0-9]/, t.password.number)
      .regex(/[^A-Za-z0-9]/, t.password.special),
    confirmNewPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'], // Tells Zod which field the error belongs to
    message: t.password.match,
  });
};