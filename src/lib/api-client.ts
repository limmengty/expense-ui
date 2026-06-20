import 'server-only';
import { getApiUrl } from './api';
import { getAccessToken } from '@/lib/auth/cookies';

// Server-only API client — reads token from HTTP-only cookies automatically
// This file must NEVER be imported in client components

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiClientOptions extends RequestInit {
  // Token is auto-injected from cookies — don't pass manually
  token?: never;
}

async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  // Auto-inject token from HTTP-only cookies (server-side only)
  const token = await getAccessToken();

  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  if (options.headers) {
    const existing = options.headers as HeadersInit;
    if (existing instanceof Headers) {
      existing.forEach((value, key) => headers.set(key, value));
    } else if (Array.isArray(existing)) {
      existing.forEach(([key, value]) => headers.set(key, value));
    } else {
      Object.entries(existing).forEach(([key, value]) => headers.set(key, value));
    }
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(
      response.status,
      (errorBody as { message?: string }).message || 'API request failed',
      errorBody
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// Convenience methods
export const api = {
  get: <T = unknown>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body: unknown, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T = unknown>(endpoint: string, body: unknown, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T = unknown>(endpoint: string, body: unknown, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T = unknown>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
