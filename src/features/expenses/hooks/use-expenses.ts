'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createExpenseAction } from '@/features/expenses/actions';
import type {
  ExpenseFilters,
  PaginatedExpenses,
  CreateExpensePayload,
} from '@/features/expenses/api';
import { getExpensesAction } from '@/features/expenses/actions';

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery<PaginatedExpenses>({
    queryKey: ['expenses', filters],
    queryFn: () => getExpensesAction(filters),
    staleTime: 30 * 1000,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpensePayload) => createExpenseAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
