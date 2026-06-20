import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api';
import type { DashboardSummaryDTO, RecentActivityDTO, BalanceDTO } from '@/types';

export interface SpendingPeriodDTO {
  period: string;
  amount: number;
  expenseCount: number;
}

export async function getDashboardSummary(): Promise<DashboardSummaryDTO> {
  return api.get<DashboardSummaryDTO>(`${API_ENDPOINTS.DASHBOARD}/summary`);
}

export async function getRecentActivity(): Promise<RecentActivityDTO[]> {
  return api.get<RecentActivityDTO[]>(`${API_ENDPOINTS.DASHBOARD}/activity`);
}

export async function getBalances(): Promise<BalanceDTO[]> {
  return api.get<BalanceDTO[]>(`${API_ENDPOINTS.DASHBOARD}/balances`);
}

export async function getSpendingHistory(): Promise<SpendingPeriodDTO[]> {
  return api.get<SpendingPeriodDTO[]>(API_ENDPOINTS.DASHBOARD_SPENDING_HISTORY);
}
