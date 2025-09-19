import { errors } from '../locales';

export const getErrors = (locale: string = 'en') => {
  return errors[locale as 'en' | 'fr'] || errors['en'];
};