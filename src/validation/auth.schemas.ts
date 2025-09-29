import { z } from 'zod';
import { zodErrors } from '../locales/zodErrors';


export const getRegisterSchema = (locale: 'en' | 'fr') => {

  const t = zodErrors[locale];

  return z
    .object({
      email: z.email(t.email),
      password: z
        .string()
        .min(8, t.password.min)
        .max(100, t.password.max)
        .regex(/[A-Z]/, t.password.uppercase)
        .regex(/[a-z]/, t.password.lowercase)
        .regex(/[0-9]/, t.password.number)
        .regex(/[^A-Za-z0-9]/, t.password.special),
      confirmPassword: z.string(),
      firstName: z
        .string()
        .nonempty(t.firstName.nonempty)
        .max(50, t.firstName.max),
      lastName: z
        .string()
        .nonempty(t.lastName.nonempty)
        .max(50, t.lastName.max)
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'], // Tells Zod which field the error belongs to
      message: t.password.match,
    });
}

export const getLoginSchema = (locale: 'en' | 'fr') => {
  
  const t = zodErrors[locale];

  return z.object({
    email: z.email(t.email),
    password: z.string(), // No need to revalidate complexity
  });
};