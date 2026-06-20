import { cookies } from 'next/headers';
import type { UserSession } from './types';
import { refreshApi } from './api';

const ACCESS_TOKEN_COOKIE = 'expensego_access_token';
const REFRESH_TOKEN_COOKIE = 'expensego_refresh_token';
const SESSION_COOKIE = 'expensego_session';

export const COOKIE_OPTIONS = {
  access: {
    name: ACCESS_TOKEN_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 5, // 5 minutes (matches expires_in)
  },
  refresh: {
    name: REFRESH_TOKEN_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 30, // 30 minutes (matches refresh_expires_in)
  },
  session: {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 30, // 30 minutes
  },
} as const;

export async function setAuthCookies(data: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  userId: string;
  email: string;
  username: string;
}) {
  const cookieStore = await cookies();

  const expiresAt = Date.now() + data.expiresIn * 1000;

  const session: UserSession = {
    userId: data.userId,
    email: data.email,
    username: data.username,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt,
  };

  cookieStore.set(ACCESS_TOKEN_COOKIE, data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: data.expiresIn,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: data.refreshExpiresIn,
  });

  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: data.refreshExpiresIn,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAuthCookies() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const sessionRaw = cookieStore.get(SESSION_COOKIE)?.value;

  let session: UserSession | null = null;
  if (sessionRaw) {
    try {
      session = JSON.parse(sessionRaw) as UserSession;
    } catch {
      session = null;
    }
  }

  return { accessToken, refreshToken, session };
}

export async function getAccessToken(): Promise<string | null> {
  const { accessToken, refreshToken, session } = await getAuthCookies();

  if (!session) return null;

  // Fast path: access token cookie present and not expired
  if (accessToken && session.expiresAt > Date.now()) {
    return accessToken;
  }

  // Access token gone or expired — attempt silent refresh
  // Fall back to the copy stored in the session cookie (30-min lifetime)
  const rt = refreshToken ?? session.refreshToken;
  if (!rt) return null;

  try {
    const data = await refreshApi(rt);
    await setAuthCookies({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      refreshExpiresIn: data.refresh_expires_in,
      userId: data.user_id,
      email: data.email,
      username: data.username,
    });
    return data.access_token;
  } catch {
    return null;
  }
}
