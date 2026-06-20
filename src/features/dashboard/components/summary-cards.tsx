import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/auth';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface SummaryCardsProps {
  totalGetBack?: number;
  totalYouOwe?: number;
  pendingSettlements?: number;
  isLoading?: boolean;
}

export function SummaryCards({
  totalGetBack = 0,
  totalYouOwe = 0,
  pendingSettlements = 0,
  isLoading = false,
}: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const net = totalGetBack - totalYouOwe;
  const isPositive = net >= 0;

  return (
    <div className="space-y-3">
      {/* Net Balance — hero */}
      <Card
        className={
          isPositive ? 'border-primary/25 bg-primary/5' : 'border-destructive/25 bg-destructive/5'
        }
      >
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Net balance
            </p>
            <p
              className={`mt-1 text-4xl font-bold tabular-nums ${
                isPositive ? 'text-primary' : 'text-destructive'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(net)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isPositive ? "You're owed money overall" : 'You owe more than you get back'}
            </p>
          </div>
          {pendingSettlements > 0 && (
            <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              {pendingSettlements} pending
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supporting figures */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-primary/20">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <ArrowDownLeft className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">You get back</p>
              <p className="text-xl font-bold text-primary tabular-nums">
                {formatCurrency(totalGetBack)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <ArrowUpRight className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">You owe</p>
              <p className="text-xl font-bold text-destructive tabular-nums">
                {formatCurrency(totalYouOwe)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
