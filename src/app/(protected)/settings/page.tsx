import { Lock, Shield, User, Palette } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageLayout, PageHeader, PageSection } from '@/components/layout/page-layout';
import { logoutAction, getSession } from '@/features/auth/actions';
import { AppearanceControls } from './appearance-controls';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const initials = session.username.slice(0, 2).toUpperCase();

  return (
    <PageLayout maxWidth="2xl">
      <PageHeader title="Account" description="Your profile and preferences" />

      {/* Identity block */}
      <PageSection index={0}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <Avatar className="h-16 w-16 shrink-0 ring-2 ring-border ring-offset-2 sm:h-20 sm:w-20">
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary sm:text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold tracking-tight">{session.username}</p>
            <p className="text-sm text-muted-foreground">{session.email}</p>
          </div>
        </div>
      </PageSection>

      {/* Profile section */}
      <PageSection index={1} className="pt-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Profile
            </h2>
          </div>
          <Separator />
          <dl className="divide-y">
            <div className="flex items-center justify-between py-4">
              <div>
                <dt className="text-xs text-muted-foreground">Username</dt>
                <dd className="mt-0.5 text-sm font-medium">{session.username}</dd>
              </div>
              <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="mt-0.5 text-sm font-medium">{session.email}</dd>
              </div>
              <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
          </dl>
          <p className="text-xs text-muted-foreground/60">
            Profile fields are set during account creation and cannot be changed here.
          </p>
        </section>
      </PageSection>

      {/* Appearance section */}
      <PageSection index={2} className="pt-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Appearance
            </h2>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
            </div>
            <AppearanceControls />
          </div>
        </section>
      </PageSection>

      {/* Security section */}
      <PageSection index={3} className="pt-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Security
            </h2>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium">Active session</p>
              <p className="text-xs text-muted-foreground">Signed in on this device</p>
            </div>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Active
            </Badge>
          </div>

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-medium">Sign out</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              You&apos;ll be signed out of your account on this device.
            </p>
            <form action={logoutAction} className="mt-3">
              <Button variant="destructive" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </section>
      </PageSection>
    </PageLayout>
  );
}
