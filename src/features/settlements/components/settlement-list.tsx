'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, initials } from '@/lib/auth';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { BalanceDTO } from '@/types';

interface SettlementListProps {
  balances?: BalanceDTO[];
  isLoading?: boolean;
  onSettle?: (balance: BalanceDTO) => void;
}

export function SettlementList({
  balances = [],
  isLoading = false,
  onSettle,
}: SettlementListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settle Up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (balances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settle Up</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary/50" />
            <p className="mt-3 text-sm font-medium">All settled up!</p>
            <p className="text-xs text-muted-foreground">You have no outstanding balances</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Settle Up</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {balances.map((balance) => (
          <div
            key={balance.userId}
            className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={balance.userAvatar ?? ''} />
              <AvatarFallback className="text-sm">{initials(balance.userName)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium">{balance.userName}</p>
              <p className="text-xs text-muted-foreground">
                {balance.direction === 'owes' ? 'You owe' : 'Gets back'}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <p
                className={`text-sm font-bold ${
                  balance.direction === 'owes' ? 'text-destructive' : 'text-primary'
                }`}
              >
                {formatCurrency(Math.abs(balance.amount))}
              </p>
              <Button
                size="sm"
                variant={balance.direction === 'owes' ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => onSettle?.(balance)}
              >
                {balance.direction === 'owes' ? (
                  <>Pay</>
                ) : (
                  <>
                    Settle <ArrowRight className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
