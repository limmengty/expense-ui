import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency, formatDate } from '@/lib/auth';
import { Receipt } from 'lucide-react';
import type { ExpenseListItemResponse } from '@/features/expenses/api';

interface ExpenseTableProps {
  expenses?: ExpenseListItemResponse[];
  isLoading?: boolean;
  groups?: { id: string; name: string }[];
  searchQuery?: string;
  memberNames?: Record<string, string>;
}

function PayerCell({
  payerId,
  memberNames,
}: {
  payerId: string;
  memberNames: Record<string, string>;
}) {
  const name = memberNames[payerId];
  if (!name) {
    return <span className="font-mono text-xs text-muted-foreground">{payerId.slice(0, 8)}…</span>;
  }
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm">{name}</span>
    </div>
  );
}

export function ExpenseTable({
  expenses = [],
  isLoading = false,
  groups = [],
  searchQuery = '',
  memberNames = {},
}: ExpenseTableProps) {
  const groupsMap = new Map(groups.map((g) => [g.id, g.name]));

  const filtered = searchQuery
    ? expenses.filter((e) => {
        const q = searchQuery.toLowerCase();
        const payerName = memberNames[e.payerId] ?? '';
        return (
          e.description.toLowerCase().includes(q) ||
          (groupsMap.get(e.groupId) ?? '').toLowerCase().includes(q) ||
          payerName.toLowerCase().includes(q)
        );
      })
    : expenses;

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Paid by</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 text-center">
        <Receipt className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium">
          {searchQuery ? 'No expenses match your search' : 'No expenses found'}
        </p>
        <p className="text-xs text-muted-foreground">
          {searchQuery ? 'Try a different search term' : 'Add your first expense to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Paid by</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((expense) => {
            const groupName = groupsMap.get(expense.groupId);
            return (
              <TableRow key={expense.expenseId}>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell>
                  {groupName ? (
                    <span className="text-sm">{groupName}</span>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">
                      {expense.groupId.slice(0, 8)}…
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <PayerCell payerId={expense.payerId} memberNames={memberNames} />
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(expense.amount.amount, expense.amount.currency)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(expense.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge variant={expense.settled ? 'success' : 'secondary'}>
                    {expense.settled ? 'Settled' : 'Pending'}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
