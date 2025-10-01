export interface UpdateUserProfileInput {
  fisrtName: string;
  lastName: string;
  pseudo: string;
  lang: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}