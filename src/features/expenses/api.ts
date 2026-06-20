import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api';
import type { ExpenseDTO } from '@/types';

// Request/Response types matching expense-api v1 contract
export interface ExpenseListItemResponse {
  expenseId: string;
  groupId: string;
  payerId: string;
  amount: { amount: number; currency: string };
  description: string;
  splitStrategy: 'EQUAL' | 'PERCENTAGE' | 'EXACT';
  splits: Array<{
    userId: string;
    amount: { amount: number; currency: string };
    percentage: number;
  }>;
  settled: boolean;
  createdAt: string;
}

export interface PaginatedExpenses {
  content: ExpenseListItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ExpenseFilters {
  groupId?: string;
  payerId?: string;
  startDate?: string;
  endDate?: string;
  settled?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export async function getExpenses(filters: ExpenseFilters = {}): Promise<PaginatedExpenses> {
  const params = new URLSearchParams();
  if (filters.groupId) params.set('groupId', filters.groupId);
  if (filters.payerId) params.set('payerId', filters.payerId);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.settled !== undefined) params.set('settled', String(filters.settled));
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.size !== undefined) params.set('size', String(filters.size));
  if (filters.sort) params.set('sort', filters.sort);

  const query = params.toString();
  return api.get<PaginatedExpenses>(`${API_ENDPOINTS.EXPENSES}${query ? `?${query}` : ''}`);
}

export async function getExpenseById(id: string): Promise<ExpenseDTO> {
  return api.get<ExpenseDTO>(API_ENDPOINTS.EXPENSE_BY_ID(id));
}

export interface CreateExpensePayload {
  groupId: string;
  description: string;
  totalAmount: { amount: number; currency: string };
  splitStrategy: 'EQUAL' | 'PERCENTAGE' | 'EXACT';
  splitEntries: Array<{
    userId: string;
    amount?: number;
    percentage?: number;
  }>;
  payerId: string;
}

export async function createExpense(
  data: CreateExpensePayload
): Promise<{ expenseId: string; createdAt: string }> {
  return api.post(API_ENDPOINTS.EXPENSES, data);
}

export async function settleExpense(id: string): Promise<void> {
  return api.patch(API_ENDPOINTS.EXPENSE_SETTLE(id), {});
}

export async function deleteExpense(id: string): Promise<void> {
  return api.delete(API_ENDPOINTS.EXPENSE_BY_ID(id));
}
