'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api';

export async function settleDebtAction(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  amount: number,
  currency = 'USD'
) {
  try {
    await api.post(API_ENDPOINTS.SETTLEMENTS, {
      groupId,
      fromUserId,
      toUserId,
      amount,
      currency,
    });
    revalidatePath('/dashboard');
    revalidatePath('/groups');
    return { success: true };
  } catch (error) {
    console.error('Failed to settle debt:', error);
    return {
      success: false,
      errors: { _form: ['Failed to settle. Please try again.'] },
    };
  }
}
