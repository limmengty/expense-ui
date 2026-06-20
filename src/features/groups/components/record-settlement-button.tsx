'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/auth';
import { settleDebtAction } from '@/features/settlements/actions';

interface RecordSettlementButtonProps {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  fromName: string;
  toName: string;
  amount: number;
  currency: string;
}

export function RecordSettlementButton({
  groupId,
  fromUserId,
  toUserId,
  fromName,
  toName,
  amount,
  currency,
}: RecordSettlementButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const settle = useMutation({
    mutationFn: () => settleDebtAction(groupId, fromUserId, toUserId, amount, currency),
    onSuccess: () => {
      setOpen(false);
      router.refresh();
    },
  });

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-7 shrink-0 text-xs"
      >
        Record payment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              Mark this debt as paid. This will update all balances in the group.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
            <p className="text-sm font-medium">{fromName}</p>
            <div className="flex flex-col items-center gap-0.5">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-bold text-destructive">
                {formatCurrency(amount, currency)}
              </span>
            </div>
            <p className="text-sm font-medium">{toName}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={settle.isPending}>
              Cancel
            </Button>
            <Button onClick={() => settle.mutate()} disabled={settle.isPending}>
              {settle.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
