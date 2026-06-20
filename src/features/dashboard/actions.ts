'use server';

import { getSpendingHistory } from '@/features/dashboard/api';

export async function getSpendingHistoryAction() {
  try {
    return await getSpendingHistory();
  } catch {
    return [];
  }
}
