'use server';

import { searchUsers, type UserSearchResult } from '@/features/users/api';

export async function searchUsersAction(query: string): Promise<UserSearchResult[]> {
  return searchUsers(query);
}
