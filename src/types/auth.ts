export type UserRole = 'admin' | 'member';

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organisation: string;
}
