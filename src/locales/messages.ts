// For general logic errors

export const messages = {
  en: {
    errors: {
      internal: 'Internal server error.',
      unauthorized: 'You are not authorized to access this resource.',
      userExists: 'User already exists.',
      invalidInput: 'Invalid input.',
      invalidCredentials: 'Invalid email or password.',
      incorrectPassword: 'Incorrect password.',
      userNotFound: 'User not found.',
      pseudoTaken: 'This pseudo is already taken.',
      treeNotFound: 'Tree not found.',
      tooManyRequests: 'Too many requests. Please try again later.',
      tooManyRegister: 'Too many sign-up attempts. Please try again later.',
      tooManyLogin: 'Too many login attempts. Please try again in 15 minutes.',
      tooManyUpdatePassword: 'Too many password updating attempts. Please try again later.',
    },
    successes: {
      register: 'User registered successfully',
      login: 'User logged in successfully',
      logout: 'Logged out successfully',
      userFetched: 'User profile loaded successfully',
      userUpdated: 'User profile updated successfully',
      passwordUpdated: 'Password has been updated successfully',
      refresh: 'Refreshed tokens successfully',
      sessionsFetched: 'Sessions fetched successfully'
    },
  },
  fr: {
    errors: {
      internal: 'Erreur interne du serveur.',
      unauthorized: "Vous n'êtes pas autorisé à accéder à cette ressource.",
      userExists: 'Un utilisateur avec cet email existe déjà.',
      invalidInput: 'Saisie invalide.',
      invalidCredentials: 'Email ou mot de passe invalide.',
      incorrectPassword: 'Mot de passe incorrect.',
      userNotFound: "Utilisateur introuvable.",
      pseudoTaken: 'Ce pseudo est déjà utilisé.',
      treeNotFound: "Arbre introuvable.",
      tooManyRequests: 'Trop de requêtes. Réessayez plus tard.',
      tooManyRegister: 'Trop de tentatives d\'inscription. Réessayez plus tard.',
      tooManyLogin: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
      tooManyUpdatePassword: 'Trop de tentatives de mise à jour du mot de passe. Réessayez plus tard.',
    },
    successes: {
      register: 'Inscription réussie.',
      login: 'Connexion réussie.',
      logout: 'Déconnexion réussie.',
      userFetched: 'Profil utilisateur récupéré avec succès.',
      userUpdated: 'Profil utilisateur mis à jour avec succès.',
      passwordUpdated: 'Le mot de passe a été mis à jour.',
      refresh: 'Les tokens ont été mis à jour avec succès.',
      sessionsFetched: 'Sessions récupérées avec succès.'
    },
  },
};