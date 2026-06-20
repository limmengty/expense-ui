import { CheckCircle2, User, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import type { GroupDTO } from '@/features/groups/api';

interface GroupBalance {
  amount: number;
  currency: string;
}

interface GroupListProps {
  groups?: GroupDTO[];
  balances?: Map<string, GroupBalance>;
  currentUserId?: string;
  isLoading?: boolean;
}

function formatAmount(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

function BalanceChip({ amount, currency }: GroupBalance) {
  if (amount === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-primary">
        <CheckCircle2 className="h-3 w-3" />
        Settled
      </div>
    );
  }
  return (
    <span
      className={`text-xs font-medium tabular-nums ${
        amount > 0 ? 'text-primary' : 'text-destructive'
      }`}
    >
      {amount > 0 ? '+' : '−'}
      {formatAmount(amount, currency)}
    </span>
  );
}

function MemberAvatarStack({ count }: { count: number }) {
  const visible = Math.min(count, 4);
  return (
    <div className="flex items-center">
      {Array.from({ length: visible }).map((_, i) => (
        <div
          key={i}
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted"
          style={{ zIndex: visible - i, marginLeft: i > 0 ? '-6px' : 0 }}
        >
          <User className="h-3 w-3 text-muted-foreground" />
        </div>
      ))}
      {count > 4 && <span className="ml-2 text-xs text-muted-foreground">+{count - 4}</span>}
    </div>
  );
}

export function GroupList({
  groups = [],
  balances = new Map(),
  currentUserId,
  isLoading = false,
}: GroupListProps) {
  void currentUserId;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-full rounded-md" />
              <div className="flex gap-0">
                {[0, 1, 2].map((j) => (
                  <Skeleton
                    key={j}
                    className="h-6 w-6 rounded-full border-2 border-background"
                    style={{ marginLeft: j > 0 ? '-6px' : 0 }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
        <Users className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-4 text-sm font-medium">No groups yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create a group to start tracking shared expenses
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => {
        const balance = balances.get(group.id);
        return (
          <Link key={group.id} href={`/groups/${group.id}`} className="group block">
            <Card className="h-full transition-all duration-150 group-hover:border-primary/40 group-hover:shadow-sm">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-sm font-semibold text-primary">
                      {group.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm leading-tight font-semibold">{group.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {balance !== undefined && (
                  <div className="flex items-center justify-between rounded-md bg-muted/60 px-2.5 py-1.5">
                    <span className="text-xs text-muted-foreground">Your balance</span>
                    <BalanceChip amount={balance.amount} currency={balance.currency} />
                  </div>
                )}

                {group.memberIds.length > 0 && <MemberAvatarStack count={group.memberIds.length} />}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
