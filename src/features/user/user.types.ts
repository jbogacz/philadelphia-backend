/**
 * DTO
 */
export type AuthRequest = {
  login: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};
