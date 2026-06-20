import { z } from 'zod';

export const addExpenseSchema = z
  .object({
    groupId: z.string().min(1, 'Group is required'),
    description: z.string().min(1, 'Description is required').max(500),
    totalAmount: z.number().min(0.01, 'Amount must be greater than zero'),
    payerId: z.string().min(1, 'Please select who paid'),
    splitStrategy: z.enum(['EQUAL', 'EXACT', 'PERCENTAGE']),
    splitEntries: z
      .array(
        z.object({
          userId: z.string(),
          amount: z.number().optional(),
          percentage: z.number().optional(),
        })
      )
      .min(0), // Empty allowed — EQUAL auto-computes from members; EXACT/PERCENTAGE populate this
  })
  .refine(
    (data) => {
      const { splitStrategy, splitEntries, totalAmount } = data;
      if (splitStrategy === 'PERCENTAGE' && splitEntries.length > 0) {
        const total = splitEntries.reduce((sum, s) => sum + (s.percentage ?? 0), 0);
        return Math.abs(total - 100) <= 0.01;
      }
      if (splitStrategy === 'EXACT' && splitEntries.length > 0) {
        const total = splitEntries.reduce((sum, s) => sum + (s.amount ?? 0), 0);
        return Math.abs(total - totalAmount) <= 0.01;
      }
      return true;
    },
    {
      message: 'Split amounts must match the total (100% for percentage, exact amount for EXACT)',
      path: ['splitEntries'],
    }
  );

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(50),
  description: z.string().max(200).optional(),
});

export type AddExpenseFormValues = z.infer<typeof addExpenseSchema>;
export type CreateGroupFormValues = z.infer<typeof createGroupSchema>;
