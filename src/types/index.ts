// Global domain types and DTOs shared across features
// These represent the contract between frontend and Spring Boot backend

// ============================================================
// Enums
// ============================================================

export const SplitType = {
  EQUAL: 'EQUAL',
  EXACT: 'EXACT',
  PERCENTAGE: 'PERCENTAGE',
} as const;

export type SplitType = (typeof SplitType)[keyof typeof SplitType];

export const SettlementStatus = {
  PENDING: 'PENDING',
  SETTLED: 'SETTLED',
} as const;

export type SettlementStatus = (typeof SettlementStatus)[keyof typeof SettlementStatus];

// ============================================================
// User
// ============================================================

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ============================================================
// Group
// ============================================================

export interface GroupDTO {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  memberCount: number;
  members?: UserDTO[];
}

export interface CreateGroupDTO {
  name: string;
  description?: string;
}

// ============================================================
// Expense
// ============================================================

export interface ExpenseSplitDTO {
  userId: string;
  userName?: string;
  amount: number;
  percentage?: number;
}

export interface ExpenseDTO {
  id: string;
  description: string;
  amount: number;
  date: string;
  groupId: string;
  groupName?: string;
  paidBy: UserDTO;
  splits: ExpenseSplitDTO[];
  splitType: SplitType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDTO {
  groupId: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  splitType: SplitType;
  splits: ExpenseSplitDTO[];
}

export interface ExpenseListItemDTO {
  id: string;
  description: string;
  amount: number;
  date: string;
  groupName: string;
  paidByName: string;
  splitType: SplitType;
  myShare?: number;
  isSettled?: boolean;
}

// ============================================================
// Balance & Settlement
// ============================================================

export interface BalanceDTO {
  userId: string;
  userName: string;
  userAvatar?: string;
  amount: number; // positive = others owe them, negative = they owe
  direction: 'owes' | 'gets back';
  groupId?: string;
}

export interface SettlementDTO {
  id: string;
  fromUser: UserDTO;
  toUser: UserDTO;
  amount: number;
  expenseId?: string;
  expenseDescription?: string;
  status: SettlementStatus;
  createdAt: string;
  settledAt?: string;
}

// ============================================================
// Dashboard
// ============================================================

export interface DashboardSummaryDTO {
  totalGetBack: number;
  totalYouOwe: number;
  netBalance: number;
  pendingSettlements: number;
}

export interface RecentActivityDTO {
  id: string;
  type: 'expense' | 'settlement';
  description: string;
  amount: number;
  date: string;
  groupName?: string;
  userName?: string;
  isPositive?: boolean; // true = money coming back to you
}

// ============================================================
// API Response Wrappers
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  fields?: Record<string, string[]>;
}

// ============================================================
// UI View Models (derived from DTOs)
// ============================================================

export interface ExpenseListItemVM extends ExpenseListItemDTO {
  formattedAmount: string;
  formattedDate: string;
  isOverdue?: boolean;
}

export interface BalanceVM extends BalanceDTO {
  formattedAmount: string;
  displayDirection: 'you owe' | 'you get back';
}
