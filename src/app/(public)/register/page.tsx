'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Wallet, Eye, EyeOff } from 'lucide-react';
import { registerAction } from '@/features/auth/actions';
import Link from 'next/link';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string) {
  if (!password) return null;
  if (password.length < 6) return { level: 1, label: 'Too short', color: 'bg-destructive' };
  const checks = [/[A-Z]/.test(password), /[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  if (password.length < 8 || score === 0)
    return { level: 1, label: 'Weak', color: 'bg-orange-500' };
  if (score === 1) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
  if (score === 2) return { level: 3, label: 'Strong', color: 'bg-primary' };
  return { level: 4, label: 'Very strong', color: 'bg-emerald-500' };
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', firstName: '', lastName: '' },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch() is not memoizable
  const watchedPassword = form.watch('password');
  const strength = getPasswordStrength(watchedPassword);

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set('username', values.username);
    formData.set('email', values.email);
    formData.set('password', values.password);
    if (values.firstName) formData.set('firstName', values.firstName);
    if (values.lastName) formData.set('lastName', values.lastName);

    const result = await registerAction(formData);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error ?? 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
          <p className="text-sm text-muted-foreground">
            Join ExpenseGo to start tracking shared expenses
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First name <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    autoComplete="given-name"
                    autoFocus
                    {...form.register('firstName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last name <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    autoComplete="family-name"
                    {...form.register('lastName')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="janedoe"
                  autoComplete="username"
                  {...form.register('username')}
                />
                {form.formState.errors.username && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="pr-10"
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                            bar <= strength.level ? strength.color : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{strength.label}</p>
                  </div>
                )}
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
