'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import { getSpendingHistoryAction } from '@/features/dashboard/actions';

function formatShortMonth(period: string) {
  const [year, month] = period.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString('default', {
    month: 'short',
  });
}

function formatCurrency(amount: number) {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount.toFixed(0)}`;
}

export function SpendingHistoryChart() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['dashboard', 'spending-history'],
    queryFn: () => getSpendingHistoryAction(),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const maxAmount = Math.max(...history.map((h) => h.amount), 1);
  const totalAmount = history.reduce((sum, h) => sum + h.amount, 0);
  const hasData = history.some((h) => h.amount > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Spending Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              No spending data yet — add your first expense to see activity
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Bar chart */}
            <div className="flex h-28 items-end gap-2">
              {history.map((item) => {
                const heightPct = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                return (
                  <div key={item.period} className="flex flex-1 flex-col items-center gap-1">
                    <div className="relative flex w-full items-end" style={{ height: '80px' }}>
                      <div
                        className="w-full rounded-t-sm bg-primary/70 transition-colors hover:bg-primary"
                        style={{ height: `${Math.max(heightPct, item.amount > 0 ? 4 : 0)}%` }}
                        title={`${formatShortMonth(item.period)}: $${item.amount.toFixed(2)}`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatShortMonth(item.period)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between border-t pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Last 6 months
              </span>
              <span className="font-medium text-foreground">
                {formatCurrency(totalAmount)} total
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
