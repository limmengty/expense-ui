// Auth types matching the expense-api contract

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  scope: string;
  email: string;
  username: string;
  user_id: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UserSession {
  userId: string;
  email: string;
  username: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix ms when access token expires
}

export interface SessionWithTokens {
  session: UserSession;
  accessToken: string;
  refreshToken: string;
}
