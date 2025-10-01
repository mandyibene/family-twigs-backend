export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}