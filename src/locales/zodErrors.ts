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
  firstName: {
    nonempty: string,
    max: string,
  };
  lastName: {
    nonempty: string,
    max: string,
  };
  pseudo: {
    min: string;
    max: string;
  };
  tree: {
    nonempty: string;
    max: string;
    min: string;
  }
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
    firstName: {
      nonempty: "You must indicate a firstname",
      max: "Firstname must be at most 50 characters"
    },
    lastName: {
      nonempty: "You must indicate a lastname",
      max: "Lastname must be at most 50 characters"
    },
    pseudo: {
      min: "Pseudo should be at least 3 characters long",
      max: "Pseudo should be at most 30 characters long",
    },
    tree: {
      nonempty: "You must indicate a name",
      min: "Tree name should be at least 3 characters long",
      max: "Tree name should be at most 100 characters long",
    }
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
    firstName: {
      nonempty: "Vous devez indiquer un prénom",
      max: "Le prénom ne doit pas dépasser 50 caractères"
    },
    lastName: {
      nonempty: "Vous devez indiquer un nom",
      max: "Le nom ne doit pas dépasser 50 caractères"
    },
    pseudo: {
      min: "Le pseudo doit contenir au moins 3 caractères",
      max: "Le pseudo doit contenir au plus 30 caractères",
    },
    tree: {
      nonempty: "Vous devez indiquer un nom",
      min: "Le nom de l'arbre doit contenir au moins 3 caractères",
      max: "Le nom de l'arbre doit contenir au plus 100 caractères",
    }
  },
};
