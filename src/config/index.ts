// Environment-aware configuration constants

export const config = {
  // API
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL,

  // App
  appName: 'ExpenseGo',
  appDescription: 'Expense sharing made simple',

  // Pagination defaults
  defaultPageSize: 20,
  maxPageSize: 100,

  // Feature flags
  features: {
    settlementConfirmation: true,
  },
} as const;

// Server-only config (never imported in client components)
export const serverConfig = {
  apiBase: process.env.API_URL,
} as const;
