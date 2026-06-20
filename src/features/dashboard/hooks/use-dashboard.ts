import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary, getRecentActivity, getBalances } from '@/features/dashboard/api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => getDashboardSummary(),
    staleTime: 60 * 1000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => getRecentActivity(),
    staleTime: 60 * 1000,
  });
}

export function useBalances() {
  return useQuery({
    queryKey: ['dashboard', 'balances'],
    queryFn: () => getBalances(),
    staleTime: 60 * 1000,
  });
}
