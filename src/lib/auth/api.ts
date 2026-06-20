import type { LoginRequest, LoginResponse, RefreshRequest } from './types';

const API_BASE = process.env.API_URL ?? 'http://localhost:8080';

async function apiFetch<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error((error as { message?: string }).message ?? 'Request failed');
  }

  return response.json() as Promise<T>;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const data: LoginRequest = { email, password };
  return apiFetch<LoginResponse>('/api/v1/auth/login', data);
}

export async function refreshApi(refreshToken: string): Promise<LoginResponse> {
  const data: RefreshRequest = { refreshToken };
  return apiFetch<LoginResponse>('/api/v1/auth/refresh', data);
}

export async function registerApi(payload: {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ user_id: string; username: string; email: string }> {
  return apiFetch('/api/v1/auth/register', payload);
}
