# ExpenseGo Frontend Implementation Todo List

**Project:** expense-ui  
**Based on:** PRD v1.0.0 (June 2026)  
**Stack:** Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui, React Query, Zod

---

## Phase 1: Foundation

### 1.1 Project Initialization
- [ ] Initialize Next.js App Router project with TypeScript strict mode
- [ ] Configure `tsconfig.json` with strict mode enabled
- [ ] Initialize Tailwind CSS with dark-mode-first configuration
- [ ] Initialize shadcn/ui and add base components (Button, Input, Dialog, Card, Table, DropdownMenu, Tooltip, Calendar, Sheet, Skeleton, Label, Select, etc.)
- [ ] Set up `clsx` and `tailwind-merge` utilities
- [ ] Install core dependencies: `next`, `react`, `react-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, `date-fns`, `recharts`

### 1.2 Project Structure
- [ ] Create feature-sliced directory structure under `src/`
- [ ] Set up `src/app/` with route groups `(public)/` and `(protected)/`
- [ ] Create `src/components/ui/` for shadcn primitives
- [ ] Create `src/components/layout/` for AppSidebar, TopNav, MobileNav, PageHeader, GroupSwitcher
- [ ] Create `src/features/` directories: auth, dashboard, expenses, groups, settlements
- [ ] Create `src/lib/` for shared utilities, fetch clients, formatters
- [ ] Create `src/hooks/` for shared cross-feature hooks
- [ ] Create `src/types/` for global domain contracts and DTO types
- [ ] Create `src/config/` for environment-aware constants

### 1.3 Authentication & Session
- [ ] Configure cookie-based auth with `/auth/login` and `/auth/refresh` endpoints
- [ ] Create `src/app/api/auth/session/route.ts` for client session access
- [ ] Implement session data contract (userId, email, username)
- [ ] Create server-side session helpers in `src/lib/auth/`
- [ ] Create server-only fetch utilities that attach access tokens from cookies
- [ ] Set up Next.js middleware for route protection (`/dashboard`, `/groups/*`, `/expenses/*`, `/settings`)
- [ ] Implement redirect flow for unauthenticated users to `/login`
- [ ] Configure server-only vs client-safe environment variables separation

### 1.4 BFF Infrastructure
- [ ] Create `src/lib/api-client.ts` — server-only fetch wrapper with token injection
- [ ] Create `src/lib/api.ts` — centralized API endpoint constants
- [ ] Create `src/lib/types.ts` — backend DTO type definitions shared across features
- [ ] Set up React Query provider in client layout
- [ ] Configure revalidation and cache invalidation strategies

---

## Phase 2: Core Experience

### 2.1 Dashboard
- [ ] Build `src/app/(protected)/dashboard/page.tsx` — main dashboard route
- [ ] Create `src/features/dashboard/components/SummaryCards.tsx` — total "Get back" and "You owe" cards (Server Component)
- [ ] Create `src/features/dashboard/components/SpendingHistoryChart.tsx` — monthly spending heatmap/timeline (hybrid)
- [ ] Create `src/features/dashboard/components/RecentActivity.tsx` — latest expenses and settlements (Server Component)
- [ ] Create `src/features/dashboard/components/SettleUpPanel.tsx` — pending balances by person (Server shell + client action buttons)
- [ ] Implement dashboard API functions in `src/features/dashboard/api.ts`
- [ ] Add dashboard Zod schemas in `src/features/dashboard/schemas.ts`
- [ ] Implement loading skeletons for dashboard cards
- [ ] Handle empty states for no groups / no expenses / all settled
- [ ] Ensure first viewport priority: balances visible without scrolling on desktop

### 2.2 Expense List
- [ ] Build `src/app/(protected)/expenses/page.tsx` — expense list route
- [ ] Create `src/features/expenses/components/ExpenseTable.tsx` — responsive table (collapses to cards on mobile)
- [ ] Create `src/features/expenses/components/ExpenseFilters.tsx` — group, date range, settlement status filters
- [ ] Create `src/features/expenses/components/SearchInput.tsx` — fuzzy search by description, payer, group name
- [ ] Implement pagination for expense result sets
- [ ] Implement expense API functions in `src/features/expenses/api.ts`
- [ ] Create `src/features/expenses/hooks/useExpenseFilters.ts`
- [ ] Preserve filter state in URL search params for shareability
- [ ] Add loading and error states for expense list

### 2.3 Add Expense Dialog
- [ ] Create `src/features/expenses/components/AddExpenseDialog.tsx` — shadcn Dialog wrapper
- [ ] Create `src/features/expenses/components/AddExpenseForm.tsx` — form with React Hook Form
- [ ] Implement form fields: Amount, Description, Date, Group selector, Paid by, Split type, Split entries
- [ ] Implement Zod validation schema (`addExpenseSchema`) with split logic validation:
  - Amount > 0
  - Valid date
  - Group selected
  - Equal/Exact/Percentage split math validation
- [ ] Create `src/features/expenses/actions.ts` — Server Action for `createExpense`
- [ ] Implement optimistic UI update on success
- [ ] Implement rollback + inline error display on server failure
- [ ] Preserve form state on recoverable errors
- [ ] Adapt dialog to sheet-style on mobile screens

### 2.4 Shared Form Infrastructure
- [ ] Set up React Hook Form + Zod integration pattern in `src/lib/forms.ts`
- [ ] Create shared form UI components if needed (FormField, FormLabel, FormMessage)
- [ ] Ensure inline validation errors are screen-reader accessible

---

## Phase 3: Settlement & Group Context

### 3.1 Settlement Workflow
- [ ] Create `src/features/settlements/components/SettlementList.tsx` — counterpart name, amount, direction display
- [ ] Create `src/features/settlements/components/SettleUpButton.tsx` — primary action button
- [ ] Implement `settleDebt` Server Action in `src/features/settlements/actions.ts`
- [ ] Add confirmation UI before destructive/irreversible settlement mutations
- [ ] Implement optimistic balance update after settlement
- [ ] Move completed settlements to recent activity with clear settled status
- [ ] Distinguish positive/negative balance states via typography (not excessive color)

### 3.2 Groups Management
- [ ] Build `src/app/(protected)/groups/page.tsx` — group list route
- [ ] Build `src/app/(protected)/groups/[groupId]/page.tsx` — group-specific view
- [ ] Create `src/features/groups/components/GroupList.tsx`
- [ ] Create `src/features/groups/components/GroupSwitcher.tsx` — in navigation
- [ ] Create `src/features/groups/components/GroupMembers.tsx`
- [ ] Create `src/features/groups/components/CreateGroupDialog.tsx`
- [ ] Implement group API functions in `src/features/groups/api.ts`
- [ ] Implement `createGroup` Server Action in `src/features/groups/actions.ts`
- [ ] Add empty state: guide users to create a group before adding expense
- [ ] Group switching should refresh data in place without full reload

### 3.3 Settings
- [ ] Build `src/app/(protected)/settings/page.tsx` — profile and preferences route
- [ ] Create settings components as needed

### 3.4 Navigation & Layout
- [ ] Create `src/components/layout/AppSidebar.tsx`
- [ ] Create `src/components/layout/TopNav.tsx`
- [ ] Create `src/components/layout/MobileNav.tsx`
- [ ] Create `src/components/layout/PageHeader.tsx`
- [ ] Integrate GroupSwitcher into navigation
- [ ] Ensure sidebar collapses to mobile nav at appropriate breakpoints
- [ ] Apply dark-mode-first styling across all layout components

---

## Phase 4: Hardening

### 4.1 Accessibility Audit
- [ ] Verify full keyboard navigation across all interactive elements
- [ ] Verify visible focus states on buttons, links, form fields, menu items
- [ ] Verify focus trapping inside dialogs and overlays
- [ ] Verify arrow-key navigation in dropdowns, menus, selectable lists (Radix primitives)
- [ ] Verify Escape-key dismissal for dialogs and transient overlays
- [ ] Verify semantic HTML usage (label associations, proper heading hierarchy)
- [ ] Verify screen reader announcements for validation errors and async feedback
- [ ] Verify ARIA attributes used only where native HTML semantics insufficient
- [ ] Verify dark mode contrast ratios meet WCAG AA
- [ ] Verify financial state/status not conveyed by color alone

### 4.2 Performance Profiling
- [ ] Measure initial dashboard LCP — target < 2.5s on standard broadband
- [ ] Analyze JS bundle size — identify and split large client boundaries
- [ ] Verify server components used for route shells and data-heavy pages
- [ ] Lazy-load heavy visualizations and non-critical dialog content
- [ ] Use `useTransition` for non-blocking search/filter updates
- [ ] Verify no unnecessary re-renders in large lists
- [ ] Optimize fonts — avoid excessive variants
- [ ] Replace heavy loading spinners with CSS-driven skeletons
- [ ] Defer chart rendering if below the fold

### 4.3 Error Handling & Empty States
- [ ] Implement specific, actionable error messages across all features
- [ ] Ensure inline validation errors render near relevant fields
- [ ] Ensure server failures preserve user input where possible
- [ ] Add retry affordances on route-level failures
- [ ] Handle session expiration with graceful redirect/re-auth prompt
- [ ] Add empty state copy for: no groups, no expenses, no balances, no search results

### 4.4 Security Review
- [ ] Verify access tokens never stored in browser-accessible storage
- [ ] Verify all authenticated API calls enforce session presence
- [ ] Verify CSRF protections follow Auth.js/Next.js best practices
- [ ] Verify server-only env vars not exposed to client
- [ ] Verify logging does not leak tokens, secrets, or financial data

### 4.5 Mobile Optimization
- [ ] Verify full usability at mobile widths
- [ ] Verify dialogs adapt to sheet-style on smaller screens
- [ ] Verify tables collapse to list/card views on narrow devices
- [ ] Verify primary action buttons remain thumb-reachable
- [ ] Verify cards stack vertically on mobile dashboard

### 4.6 Design Polish
- [ ] Apply dark surfaces with subtle layering (no heavy outlines)
- [ ] Apply restrained orange accent for primary actions only
- [ ] Verify spacing, alignment, and typography hierarchy
- [ ] Remove visual clutter and excessive call-to-actions
- [ ] Verify calm visual density suitable for daily use

---

## Feature Checklist by File

### `src/features/auth/`
- [ ] `api.ts` — authentication query functions
- [ ] `actions.ts` — any auth-related Server Actions
- [ ] `schemas.ts` — auth validation schemas
- [ ] `types.ts` — auth feature types
- [ ] `components/` — auth-specific UI components

### `src/features/dashboard/`
- [ ] `api.ts` — dashboard data fetching
- [ ] `schemas.ts` — dashboard validation schemas
- [ ] `types.ts` — dashboard domain types
- [ ] `components/SummaryCards.tsx`
- [ ] `components/SpendingHistoryChart.tsx`
- [ ] `components/RecentActivity.tsx`
- [ ] `components/SettleUpPanel.tsx`
- [ ] `hooks/` — dashboard-specific hooks

### `src/features/expenses/`
- [ ] `api.ts` — expense list and detail fetching
- [ ] `actions.ts` — `createExpense`, `editExpense`, `deleteExpense` Server Actions
- [ ] `schemas.ts` — expense validation schemas (including split logic)
- [ ] `types.ts` — expense domain types
- [ ] `components/ExpenseTable.tsx`
- [ ] `components/ExpenseFilters.tsx`
- [ ] `components/AddExpenseDialog.tsx`
- [ ] `components/AddExpenseForm.tsx`
- [ ] `hooks/useExpenseFilters.ts`

### `src/features/groups/`
- [ ] `api.ts` — group list and detail fetching
- [ ] `actions.ts` — `createGroup` Server Action
- [ ] `schemas.ts` — group validation schemas
- [ ] `types.ts` — group domain types
- [ ] `components/GroupList.tsx`
- [ ] `components/GroupSwitcher.tsx`
- [ ] `components/GroupMembers.tsx`
- [ ] `components/CreateGroupDialog.tsx`

### `src/features/settlements/`
- [ ] `api.ts` — settlement data fetching
- [ ] `actions.ts` — `settleDebt` Server Action
- [ ] `schemas.ts` — settlement validation schemas
- [ ] `types.ts` — settlement domain types
- [ ] `components/SettlementList.tsx`
- [ ] `components/SettleUpButton.tsx`

### `src/lib/`
- [ ] `api-client.ts` — server-only fetch wrapper with token injection
- [ ] `api.ts` — centralized API endpoint constants
- [ ] `auth.ts` — server session helpers
- [ ] `forms.ts` — shared React Hook Form + Zod integration
- [ ] `utils.ts` — formatting helpers, date-fns wrappers, clsx/tw merges
- [ ] `types.ts` — global shared DTO types

### `src/components/ui/`
- [ ] All shadcn/ui primitives configured and dark-mode styled

### `src/components/layout/`
- [ ] `AppSidebar.tsx`
- [ ] `TopNav.tsx`
- [ ] `MobileNav.tsx`
- [ ] `PageHeader.tsx`
- [ ] `GroupSwitcher.tsx`

### `src/app/`
- [ ] `(public)/page.tsx` — landing/entry route
- [ ] `(protected)/layout.tsx` — authenticated shell with navigation
- [ ] `(protected)/dashboard/page.tsx`
- [ ] `(protected)/expenses/page.tsx`
- [ ] `(protected)/groups/page.tsx`
- [ ] `(protected)/groups/[groupId]/page.tsx`
- [ ] `(protected)/settings/page.tsx`
- [ ] `api/auth/[...nextauth]/route.ts`

---

## Implementation Notes

1. **Server-first rule**: Default to Server Components; push `"use client"` only to smallest interactive leaf nodes.
2. **Token safety**: All Keycloak token attachment happens exclusively in `src/lib/api-client.ts` (server-only).
3. **Optimistic updates**: Use React Query `useMutation` with `onMutate`/`onError`/`onSettled` for expense creation and settlement flows.
4. **URL-driven state**: Keep filter state in search params for expenses and groups to support shareable links and back-navigation.
5. **Revalidation scope**: After mutations, revalidate only the affected cache keys (dashboard summaries, group balances, expense list) — avoid full-app refresh.
6. **Schema centralization**: All Zod schemas live near their feature; shared enums (e.g., `SplitType`) centralized in `src/types/`.
7. **DTO vs ViewModel**: Backend DTOs defined in `src/types/`; UI view models derived at component boundary where transformation is needed.
8. **Design restraint**: Orange accent only for primary CTAs; dark surfaces with subtle layering; no decorative treatments.

---

## Dependencies to Install

```bash
# Core
npm install next react react-dom

# Auth
npm install next-auth @auth/core

# Data fetching
npm install @tanstack/react-query

# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# UI utilities
npm install clsx tailwind-merge lucide-react date-fns

# Charts
npm install recharts

# shadcn/ui (via CLI)
npx shadcn@latest init
npx shadcn@latest add button input dialog card table dropdownmenu tooltip calendar sheet skeleton label select badge avatar popover command separator scroll-area
```

---

## Routes Summary

| Route | File |
|---|---|
| `/` | `src/app/(public)/page.tsx` |
| `/dashboard` | `src/app/(protected)/dashboard/page.tsx` |
| `/expenses` | `src/app/(protected)/expenses/page.tsx` |
| `/groups` | `src/app/(protected)/groups/page.tsx` |
| `/groups/[groupId]` | `src/app/(protected)/groups/[groupId]/page.tsx` |
| `/settings` | `src/app/(protected)/settings/page.tsx` |
| `/api/auth/*` | `src/app/api/auth/[...nextauth]/route.ts` |
