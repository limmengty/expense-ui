// Centralized API endpoint constants for expense-api v1

const API_BASE = process.env.API_URL ?? 'http://localhost:8080';
const API_V1 = `${API_BASE}/api/v1`;

export const API_ENDPOINTS = {
  // Auth (handled separately via /auth routes)
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_REGISTER: '/auth/register',

  // Expenses
  EXPENSES: `${API_V1}/expenses`,
  EXPENSE_BY_ID: (id: string) => `${API_V1}/expenses/${id}`,
  EXPENSE_SETTLE: (id: string) => `${API_V1}/expenses/${id}/settle`,

  // Dashboard
  DASHBOARD: `${API_V1}/dashboard`,
  DASHBOARD_SPENDING_HISTORY: `${API_V1}/dashboard/spending-history`,

  // Settlements
  SETTLEMENTS: `${API_V1}/settlements`,

  // Groups
  GROUPS: `${API_V1}/groups`,
  GROUP_BY_ID: (id: string) => `${API_V1}/groups/${id}`,
  GROUP_EXPENSES: (id: string) => `${API_V1}/groups/${id}/expenses`,
  GROUP_BALANCES: (id: string) => `${API_V1}/groups/${id}/balances`,
  GROUP_MEMBERS: (id: string) => `${API_V1}/groups/${id}/members`,
  GROUP_REMOVE_MEMBER: (groupId: string, userId: string) =>
    `${API_V1}/groups/${groupId}/members/${userId}`,

  // Users
  USERS_SEARCH: `${API_V1}/users/search`,
} as const;

export function getApiUrl(endpoint: string): string {
  // If it's already a full URL (starts with http), use as-is
  if (endpoint.startsWith('http')) return endpoint;
  // Otherwise prepend API base
  return endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;
}
