'use server';

import { revalidatePath } from 'next/cache';
import {
  getExpenses,
  createExpense as createExpenseApi,
  settleExpense,
  deleteExpense,
} from '@/features/expenses/api';
import type { CreateExpensePayload, ExpenseFilters } from '@/features/expenses/api';

export async function getExpensesAction(filters: ExpenseFilters = {}) {
  return getExpenses(filters);
}

export async function createExpenseAction(formData: unknown) {
  // NOTE: Schema validation is done by the form (react-hook-form + zod).
  // The form already transforms values into CreateExpensePayload shape before calling this action.
  const payload = formData as CreateExpensePayload;

  try {
    const result = await createExpenseApi(payload);
    revalidatePath('/dashboard');
    revalidatePath('/expenses');
    revalidatePath('/groups');
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to create expense:', error);
    return {
      success: false,
      errors: { _form: ['Failed to create expense. Please try again.'] },
    };
  }
}

export async function settleExpenseAction(expenseId: string) {
  try {
    await settleExpense(expenseId);
    revalidatePath('/dashboard');
    revalidatePath('/expenses');
    return { success: true };
  } catch (error) {
    console.error('Failed to settle expense:', error);
    return { success: false, errors: { _form: ['Failed to settle expense.'] } };
  }
}

export async function deleteExpenseAction(expenseId: string) {
  try {
    await deleteExpense(expenseId);
    revalidatePath('/dashboard');
    revalidatePath('/expenses');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return { success: false, errors: { _form: ['Failed to delete expense.'] } };
  }
}
