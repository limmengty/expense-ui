import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="max-w-sm space-y-8 text-center">
        <div className="space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">ExpenseGo</h1>
            <p className="text-sm text-muted-foreground">
              Track what you owe, who owes you, and settle up without the awkwardness.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full" asChild>
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
