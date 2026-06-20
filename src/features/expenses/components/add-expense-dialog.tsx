'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { addExpenseSchema } from '@/features/expenses/schemas';
import { createExpenseAction } from '@/features/expenses/actions';
import { getGroupMembersAction } from '@/features/groups/actions';

const formSchema = addExpenseSchema;
type AddExpenseFormValues = z.infer<typeof formSchema>;

interface AddExpenseDialogProps {
  children: React.ReactNode;
  groups?: { id: string; name: string }[];
  defaultGroupId?: string;
}

export function AddExpenseDialog({ children, groups = [], defaultGroupId }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(defaultGroupId ?? '');
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['group-members', selectedGroupId],
    queryFn: () => getGroupMembersAction(selectedGroupId),
    enabled: !!selectedGroupId,
    staleTime: 60 * 1000,
    select: (data) => data.map((m) => ({ id: m.userId, name: m.name })),
  });

  const form = useForm<AddExpenseFormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      groupId: defaultGroupId ?? '',
      description: '',
      totalAmount: 0,
      payerId: '',
      splitStrategy: 'EQUAL',
      splitEntries: [] as { userId: string; amount?: number; percentage?: number }[],
    },
  });

  const watchedSplitStrategy = useWatch({ control: form.control, name: 'splitStrategy' });
  const watchedTotalAmount = useWatch({ control: form.control, name: 'totalAmount' });

  const createExpense = useMutation({
    mutationFn: async (values: AddExpenseFormValues) => {
      // Guard: prevent submission when members haven't loaded
      if (members.length === 0) {
        throw new Error('Please wait for group members to load before submitting.');
      }

      const total = values.totalAmount || 0;
      // Use user-entered splitEntries if available (EXACT/PERCENTAGE), otherwise compute
      const splitEntries =
        values.splitStrategy === 'EQUAL'
          ? members.map((m) => ({
              userId: m.id,
              amount: total / members.length,
            }))
          : values.splitEntries.length > 0
            ? values.splitEntries.map((s) => ({
                userId: s.userId,
                amount: s.amount,
                percentage: s.percentage,
              }))
            : members.map((m) => ({
                userId: m.id,
                ...(values.splitStrategy === 'PERCENTAGE'
                  ? { percentage: 100 / members.length }
                  : {}),
              }));

      const payload = {
        groupId: values.groupId,
        description: values.description,
        totalAmount: { amount: values.totalAmount, currency: 'USD' },
        payerId: values.payerId,
        splitStrategy: values.splitStrategy,
        splitEntries,
      };

      const result = await createExpenseAction(payload);
      if (!result.success) {
        const msg =
          result.errors && '_form' in result.errors
            ? result.errors._form?.[0]
            : 'Failed to create expense';
        throw new Error(msg);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setOpen(false);
      setSelectedGroupId('');
      form.reset();
      router.refresh();
    },
    onError: (error: Error) => {
      form.setError('description', { message: error.message });
    },
  });

  const onSubmit: SubmitHandler<AddExpenseFormValues> = (values) => {
    createExpense.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record a new expense and split it among group members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register('totalAmount', { valueAsNumber: true })}
            />
            {form.formState.errors.totalAmount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.totalAmount.message?.toString()}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message?.toString()}
              </p>
            )}
          </div>

          {/* Group */}
          <div className="space-y-2">
            <Label htmlFor="groupId">Group</Label>
            {groups.length === 0 ? (
              <p className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
                No groups yet.{' '}
                <a href="/groups" className="underline underline-offset-2 hover:text-foreground">
                  Create a group
                </a>{' '}
                first — expenses are always split among group members.
              </p>
            ) : (
              <Select
                onValueChange={(v) => {
                  form.setValue('groupId', v, { shouldValidate: true });
                  setSelectedGroupId(v);
                  form.setValue('payerId', '', { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {form.formState.errors.groupId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.groupId.message?.toString()}
              </p>
            )}
          </div>

          {/* Paid By */}
          <div className="space-y-2">
            <Label htmlFor="payerId">Paid By</Label>
            <Select onValueChange={(v) => form.setValue('payerId', v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.payerId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.payerId.message?.toString()}
              </p>
            )}
          </div>

          {/* Split Type */}
          <div className="space-y-2">
            <Label htmlFor="splitStrategy">Split Type</Label>
            <Select
              defaultValue="EQUAL"
              onValueChange={(v) =>
                form.setValue('splitStrategy', v as 'EQUAL' | 'EXACT' | 'PERCENTAGE', {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EQUAL">Equal Split</SelectItem>
                <SelectItem value="EXACT">Exact Amounts</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Splits — per-person inputs only needed for EXACT/PERCENTAGE */}
          <SplitsPreview
            members={members}
            watchedTotalAmount={watchedTotalAmount}
            watchedSplitStrategy={watchedSplitStrategy}
            form={form}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createExpense.isPending || membersLoading || members.length === 0}
            >
              {createExpense.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SplitsPreview({
  members,
  watchedTotalAmount,
  watchedSplitStrategy,
  form,
}: {
  members: { id: string; name: string }[];
  watchedTotalAmount: number;
  watchedSplitStrategy: string;
  form: ReturnType<typeof useForm<AddExpenseFormValues>>;
}) {
  const watchedSplitEntries = useWatch({ control: form.control, name: 'splitEntries' });

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">Select a group to see split options</p>;
  }

  const total = watchedTotalAmount || 0;
  const splitEntriesDisplay =
    members.length === 0
      ? []
      : members.map((m) => {
          const existing = watchedSplitEntries.find((s) => s.userId === m.id);
          if (watchedSplitStrategy === 'EQUAL')
            return { userId: m.id, amount: total / members.length };
          if (watchedSplitStrategy === 'PERCENTAGE')
            return { userId: m.id, percentage: existing?.percentage ?? 100 / members.length };
          return { userId: m.id, amount: existing?.amount };
        });

  return (
    <div className="space-y-3">
      <Label>Split Details</Label>
      <div className="space-y-2 rounded-md border p-3">
        {members.map((member) => {
          const splitEntry = splitEntriesDisplay.find((s) => s.userId === member.id);
          return (
            <div key={member.id} className="flex items-center gap-3">
              <span className="flex-1 text-sm">{member.name}</span>
              {watchedSplitStrategy === 'EQUAL' && (
                <span className="text-sm text-muted-foreground">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    splitEntry?.amount ?? 0
                  )}
                </span>
              )}
              {watchedSplitStrategy === 'PERCENTAGE' && (
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="0"
                  className="w-20"
                  value={splitEntry?.percentage ?? ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const newSplitEntries = members.map((m) => {
                      const existing = watchedSplitEntries.find((s) => s.userId === m.id);
                      return m.id === member.id
                        ? { userId: m.id, percentage: val }
                        : {
                            userId: m.id,
                            percentage: existing?.percentage ?? 100 / members.length,
                          };
                    });
                    form.setValue('splitEntries', newSplitEntries, { shouldValidate: false });
                  }}
                />
              )}
              {watchedSplitStrategy === 'EXACT' && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-28"
                  value={splitEntry?.amount ?? ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const newSplitEntries = members.map((m) => {
                      const existing = watchedSplitEntries.find((s) => s.userId === m.id);
                      return m.id === member.id
                        ? { userId: m.id, amount: val }
                        : { userId: m.id, amount: existing?.amount };
                    });
                    form.setValue('splitEntries', newSplitEntries, { shouldValidate: false });
                  }}
                />
              )}
              {watchedSplitStrategy === 'PERCENTAGE' && (
                <span className="text-sm text-muted-foreground">%</span>
              )}
            </div>
          );
        })}

        {watchedSplitStrategy === 'PERCENTAGE' && (
          <div className="border-t pt-2 text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-medium">
              {splitEntriesDisplay.reduce((sum, s) => sum + (s.percentage ?? 0), 0).toFixed(1)}%
            </span>
          </div>
        )}
        {watchedSplitStrategy === 'EXACT' && (
          <div className="border-t pt-2 text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-medium">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                splitEntriesDisplay.reduce((sum, s) => sum + (s.amount ?? 0), 0)
              )}
            </span>
            <span className="ml-2 text-muted-foreground">
              /{' '}
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
