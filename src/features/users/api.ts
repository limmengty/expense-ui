import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api';

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  return api.get<UserSearchResult[]>(
    `${API_ENDPOINTS.USERS_SEARCH}?q=${encodeURIComponent(query.trim())}`
  );
}
