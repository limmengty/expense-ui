'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, initials } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import type { BalanceDTO } from '@/types';
import { settleDebtAction } from '@/features/settlements/actions';

interface SettleUpConfirmDialogProps {
  balance: BalanceDTO;
  currentUserId: string;
  onSettled?: () => void;
}

export function SettleUpConfirmDialog({
  balance,
  currentUserId,
  onSettled,
}: SettleUpConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const settle = useMutation({
    mutationFn: async () => {
      if (!balance.groupId) throw new Error('No group associated with this balance');
      const fromUserId = balance.direction === 'owes' ? currentUserId : balance.userId;
      const toUserId = balance.direction === 'owes' ? balance.userId : currentUserId;
      const result = await settleDebtAction(balance.groupId, fromUserId, toUserId, balance.amount);
      if (!result.success) throw new Error('Failed to record settlement');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
      setOpen(false);
      onSettled?.();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={balance.direction === 'owes' ? 'default' : 'outline'}
          className="h-7 text-xs"
        >
          {balance.direction === 'owes' ? 'Pay' : 'Settle'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Confirm Settlement</DialogTitle>
          <DialogDescription>
            {balance.direction === 'owes'
              ? `Pay ${formatCurrency(Math.abs(balance.amount))} to ${balance.userName}?`
              : `Mark ${formatCurrency(Math.abs(balance.amount))} as settled with ${balance.userName}?`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-md border p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={balance.userAvatar ?? ''} />
            <AvatarFallback className="text-sm">{initials(balance.userName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{balance.userName}</p>
            <p className="text-xs text-muted-foreground">
              {balance.direction === 'owes' ? 'You owe' : 'Owes you'}
            </p>
          </div>
          <p
            className={`text-lg font-bold ${
              balance.direction === 'owes' ? 'text-destructive' : 'text-primary'
            }`}
          >
            {formatCurrency(Math.abs(balance.amount))}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={balance.direction === 'owes' ? 'default' : 'outline'}
            onClick={() => settle.mutate()}
            disabled={settle.isPending}
          >
            {settle.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
