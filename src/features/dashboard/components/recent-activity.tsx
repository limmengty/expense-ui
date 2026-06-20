import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateRelative } from '@/lib/auth';
import { Receipt, ArrowLeftRight } from 'lucide-react';
import type { RecentActivityDTO } from '@/types';

interface RecentActivityProps {
  activities?: RecentActivityDTO[];
  isLoading?: boolean;
}

export function RecentActivity({ activities = [], isLoading = false }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">No activity yet</p>
            <p className="text-xs text-muted-foreground">
              Your recent expenses and settlements will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                activity.type === 'expense'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {activity.type === 'expense' ? (
                <Receipt className="h-4 w-4" />
              ) : (
                <ArrowLeftRight className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{activity.description}</p>
              <p className="text-xs text-muted-foreground">
                {activity.groupName && `${activity.groupName} · `}
                {formatDateRelative(activity.date)}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <p
                className={`text-sm font-medium ${
                  activity.isPositive ? 'text-primary' : 'text-foreground'
                }`}
              >
                {activity.isPositive ? '+' : ''}
                {formatCurrency(activity.amount)}
              </p>
              <Badge
                variant={activity.type === 'expense' ? 'secondary' : 'success'}
                className="text-xs"
              >
                {activity.type === 'expense' ? 'Expense' : 'Settled'}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
