'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useInView, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
import { useRef } from 'react';

/* ─── Layout ──────────────────────────────────────────────────── */

const maxWidthMap = {
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
} as const;

export function PageLayout({
  children,
  maxWidth = '4xl',
  className = '',
}: {
  children: ReactNode;
  maxWidth?: keyof typeof maxWidthMap;
  className?: string;
}) {
  return <div className={`mx-auto w-full ${maxWidthMap[maxWidth]} ${className}`}>{children}</div>;
}

/* ─── Page Header ─────────────────────────────────────────────── */

export function PageHeader({
  title,
  description,
  actions,
  backHref,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-6">
      <div className="flex items-center gap-3">
        {backHref && (
          <Button variant="ghost" size="icon" asChild className="-ml-2 h-8 w-8 shrink-0">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ─── Page Section — scroll-triggered staggered entrance ────────── */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE,
      delay: i * 0.07,
    },
  }),
};

/**
 * Wraps a content block with a scroll-triggered staggered entrance animation.
 * Each child inside animates in sequence with a 50ms delay per item.
 * Pass `index` to control the stagger offset relative to other sections on the page.
 */
export function PageSection({
  children,
  index = 0,
  className = '',
}: {
  children: ReactNode;
  /** Controls stagger order — set this per-section in page order */
  index?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px 0px' });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Page Transition ─────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Use inside PageTransition to animate individual items with stagger.
 * Each item gets an increasing delay based on its position.
 */
export function StaggeredItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  );
}
