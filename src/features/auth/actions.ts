'use server';

import { redirect } from 'next/navigation';
import { loginApi, refreshApi, registerApi } from '@/lib/auth/api';
import { setAuthCookies, clearAuthCookies, getAuthCookies } from '@/lib/auth/cookies';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    const data = await loginApi(email, password);

    await setAuthCookies({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      refreshExpiresIn: data.refresh_expires_in,
      userId: data.user_id,
      email: data.email,
      username: data.username,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return { success: false, error: message };
  }
}

export async function registerAction(formData: FormData) {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  if (!username || !email || !password) {
    return { success: false, error: 'Username, email, and password are required' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  try {
    await registerApi({ username, email, password, firstName, lastName });

    // Auto-login after registration
    const loginData = await loginApi(email, password);
    await setAuthCookies({
      accessToken: loginData.access_token,
      refreshToken: loginData.refresh_token,
      expiresIn: loginData.expires_in,
      refreshExpiresIn: loginData.refresh_expires_in,
      userId: loginData.user_id,
      email: loginData.email,
      username: loginData.username,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return { success: false, error: message };
  }
}

export async function logoutAction() {
  await clearAuthCookies();
  redirect('/');
}

export async function refreshTokenAction(): Promise<{ success: boolean; error?: string }> {
  const { refreshToken } = await getAuthCookies();

  if (!refreshToken) {
    return { success: false, error: 'No refresh token' };
  }

  try {
    const data = await refreshApi(refreshToken);

    await setAuthCookies({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      refreshExpiresIn: data.refresh_expires_in,
      userId: data.user_id,
      email: data.email,
      username: data.username,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Session expired' };
  }
}

// Get current session for use in Server Components
export async function getSession() {
  const { session } = await getAuthCookies();
  if (!session) return null;

  // If access token expired, silently refresh before returning
  if (session.expiresAt < Date.now()) {
    const refreshed = await refreshTokenAction();
    if (refreshed.success) {
      const { session: newSession } = await getAuthCookies();
      return newSession;
    }
    return null;
  }

  return session;
}
