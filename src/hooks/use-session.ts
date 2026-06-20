'use client';

import { useState, useEffect } from 'react';

// Subset of UserSession that is safe to send to the client (no tokens)
export interface ClientSession {
  userId: string;
  email: string;
  username: string;
}

interface UseSessionResult {
  session: ClientSession | null;
  isLoading: boolean;
}

export function useSession(): UseSessionResult {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read session from the page's session data injected by server
    fetchSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setIsLoading(false));
  }, []);

  return { session, isLoading };
}

async function fetchSession(): Promise<ClientSession | null> {
  try {
    const res = await fetch('/api/auth/session', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.session ?? null;
  } catch {
    return null;
  }
}
