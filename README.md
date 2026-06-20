# ExpenseGo Frontend

**Expense-sharing web application** built with Next.js 16 App Router, TypeScript strict mode, Tailwind CSS, shadcn/ui, React Query, and Zod.

> **Status:** Phase 1–3 mostly complete. Core structure, cookie-based auth, and BFF infrastructure in place. Run `npx shadcn@latest init` to install UI components.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript strict mode |
| Styling | Tailwind CSS 4 (dark-mode-first) |
| UI Primitives | shadcn/ui + Radix UI |
| Authentication | Cookie-based BFF auth via `/auth/login` + `/auth/refresh` |
| Data Fetching | React Query (client) + Server Components (server) |
| Mutations | Next.js Server Actions |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Utilities | date-fns, clsx, tailwind-merge, lucide-react |

---

## Project Structure

```
src/
├── app/                          # App Router routes
│   ├── (public)/                 # Public routes (landing)
│   ├── (protected)/              # Auth-protected routes
│   │   ├── dashboard/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── groups/[groupId]/page.tsx
│   │   ├── groups/page.tsx
│   │   └── settings/page.tsx
│   └── api/auth/session/         # Session endpoint
├── components/
│   ├── ui/                      # shadcn/ui primitives (DO NOT EDIT — use CLI)
│   ├── layout/                  # App shell: AppSidebar, TopNav
│   └── providers.tsx            # React Query + Session + Theme providers
├── features/
│   ├── auth/
│   ├── dashboard/                # Dashboard cards, activity, settle panel
│   ├── expenses/                # Expense list, filters, add dialog, forms
│   ├── groups/                   # Group list, switcher, create dialog
│   └── settlements/              # Settlement list, confirm dialog
├── lib/                          # Shared utilities, API client, formatters
├── hooks/                        # Shared hooks (useDebouncedCallback)
├── types/                        # Global DTO types and enums
└── config/                        # Environment-aware constants
```

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Install shadcn/ui components

```bash
npx shadcn@latest init
npx shadcn@latest add button input dialog card table dropdownmenu tooltip sheet skeleton label select badge avatar separator scroll-area popover
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
# Fill in your backend API values
```

**Required environment variables:**

```env
# Public (client-safe)
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Server-only (never exposed to browser)
API_URL=http://localhost:8080
AUTH_SECRET=<generate with: openssl rand -base64 32>
```

### 4. Run the development server

```bash
npm run dev
```

---

## Architecture Notes

### BFF Pattern
- Tokens live in HTTP-only cookies on the BFF server — never exposed to browser
- `src/lib/api-client.ts` auto-injects the access token from cookies on every request
- Server Components fetch protected data directly — no token in client code
- Client components use React Query for cache, optimistic updates, and background refresh
- Server Actions handle mutations with Zod validation

### Authentication Flow
```
User submits credentials → /login page
  → loginAction() calls POST /api/v1/auth/login
  → Tokens stored in HTTP-only cookies (expensego_access_token, expensego_refresh_token)
  → Session cookie (expensego_session) with user metadata

Subsequent requests:
  → Middleware checks expensego_session cookie
  → apiClient reads access_token from cookie, attaches as Bearer token
  → On 401: refreshTokenAction() calls POST /api/v1/auth/refresh
  → New tokens stored, request retried
```

### Route Protection
Protected routes: `/dashboard`, `/expenses`, `/groups/*`, `/settings`
Middleware checks `expensego_session` cookie and redirects to `/login` if missing/expired.

### Key Files
- `src/lib/auth/` — cookie utils, API calls, types for auth
- `src/features/auth/actions.ts` — `loginAction`, `logoutAction`, `refreshTokenAction`, `getSession`
- `src/middleware.ts` — cookie-based route protection
- `src/lib/api-client.ts` — server-only fetch, auto-injects token from cookies
- `src/features/*/actions.ts` — Server Actions with Zod validation

---

## Feature Status

| Feature | Status |
|---|---|
| Auth (cookie-based login/refresh via expense-api) | ✅ Implemented |
| Protected routes + cookie-based middleware | ✅ Working |
| Dashboard (Server Component data) | ✅ Implemented |
| Expense list + filters | ✅ Implemented |
| Add Expense dialog + split validation | ✅ Implemented |
| Group list + create dialog | ✅ Implemented |
| Settlement confirm dialog | ✅ Implemented |
| shadcn/ui components | ⚠️ Run `npx shadcn@latest init` to install |
| Real API integration | 🔜 Connect to Spring Boot backend |
| Session expiration + refresh | ✅ Implemented |
| Accessibility audit | 🔜 Phase 4 |
| Performance profiling | 🔜 Phase 4 |

---

## Scripts

```bash
pnpm run dev        # Development server
pnpm run build      # Production build
pnpm run start      # Start production server
pnpm run lint       # ESLint
pnpm run typecheck  # TypeScript check
```
