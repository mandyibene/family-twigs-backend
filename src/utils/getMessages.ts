import { messages } from '../locales';

export const getMessages = (locale: string = 'en') => {
  return messages[locale as 'en' | 'fr'] || messages['en'];
};