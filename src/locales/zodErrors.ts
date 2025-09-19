// For validation errors

export type ZodErrors = {
  email: string;
  password: {
    min: string;
    max: string;
    uppercase: string;
    lowercase: string;
    number: string;
    special: string;
    match: string;
  };
};

export const zodErrors: Record<'en' | 'fr', ZodErrors> = {
  en: {
    email: "Invalid email format",
    password: {
      min: "Password must be at least 8 characters long",
      max: "Password is too long",
      uppercase: "Password must contain at least one uppercase letter",
      lowercase: "Password must contain at least one lowercase letter",
      number: "Password must contain at least one number",
      special: "Password must contain at least one special character",
      match: "Passwords do not match",
    },
  },
  fr: {
    email: "Format d'email invalide",
    password: {
      min: "Le mot de passe doit contenir au moins 8 caractères",
      max: "Le mot de passe est trop long",
      uppercase: "Le mot de passe doit contenir une lettre majuscule",
      lowercase: "Le mot de passe doit contenir une lettre minuscule",
      number: "Le mot de passe doit contenir un chiffre",
      special: "Le mot de passe doit contenir un caractère spécial",
      match: "Les mots de passe ne correspondent pas",
    },
  },
};
