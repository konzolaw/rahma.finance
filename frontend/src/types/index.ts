/**
 * Complete TypeScript type definitions for Kenya Finance App
 */

// ==================== USER TYPES ====================
export interface User {
  id: string;
  email: string;
  display_name: string;
  expected_monthly_income: string; // Decimal as string from API
  profile_image?: string | null;
  partner_id?: string | null;
  partner_user?: User | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  display_name: string;
  password: string;
  password_confirm: string;
  expected_monthly_income?: string;
}

// ==================== EXPENSE TYPES ====================
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'personal_care'
  | 'entertainment'
  | 'insurance'
  | 'loans_debt'
  | 'additional'
  | 'miscellaneous'
  | 'savings';

export interface ExpenseEntry {
  id: string;
  user: string;
  category: ExpenseCategory;
  subcategory: string;
  amount: string; // Decimal as string
  payment_method: PaymentMethod;
  description?: string | null;
  date: string; // ISO date format
  receipt_image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseRequest {
  category: ExpenseCategory;
  subcategory: string;
  amount: string;
  payment_method: PaymentMethod;
  description?: string;
  date: string;
  receipt_image?: File;
}

export type UpdateExpenseRequest = Partial<CreateExpenseRequest>;

// ==================== INCOME TYPES ====================
export type IncomeSource =
  | 'salary'
  | 'freelance'
  | 'side_hustles'
  | 'trading'
  | 'business'
  | 'dividends'
  | 'online_work';

export interface IncomeEntry {
  id: string;
  user: string;
  source: IncomeSource;
  expected_amount: string; // Decimal as string
  actual_amount: string; // Decimal as string
  description?: string | null;
  date: string; // ISO date format
  created_at: string;
  updated_at: string;
}

export interface CreateIncomeRequest {
  source: IncomeSource;
  expected_amount: string;
  actual_amount: string;
  description?: string;
  date: string;
}

export type UpdateIncomeRequest = Partial<CreateIncomeRequest>;

// ==================== PAYMENT METHOD ====================
export type PaymentMethod = 'cash' | 'mpesa' | 'debit_card' | 'credit_card' | 'bank_transfer';

// ==================== SAVINGS / INVESTMENT TYPES ====================
export type InvestmentType =
  | 'sacco'
  | 'mmf'
  | 'chama'
  | 'chumz'
  | 'emergency_fund'
  | 'stocks'
  | 'treasury_bills'
  | 'treasury_bonds'
  | 'crypto'
  | 'other';

export interface SavingsEntry {
  id: string;
  user: string;
  investment_type: InvestmentType;
  institution: string;
  amount_contributed: string; // Decimal as string
  current_value: string; // Decimal as string
  goal_target: string; // Decimal as string
  notes?: string | null;
  date: string; // ISO date format
  created_at: string;
  updated_at: string;
}

export type InvestmentEntry = SavingsEntry;

export interface CreateSavingsRequest {
  investment_type: string;
  institution: string;
  amount_contributed: string | number;
  current_value: string | number;
  goal_target?: string | number;
  notes?: string;
  date: string;
}

export type UpdateSavingsRequest = Partial<CreateSavingsRequest>;

// ==================== VAULT TYPES ====================
export interface VaultTransaction {
  id: string;
  user: string;
  date: string;
  type: 'save' | 'withdraw';
  type_display: string;
  amount: string;
  description: string;
  created_at: string;
}

export interface CreateVaultRequest {
  type: 'save' | 'withdraw';
  amount: string | number;
  description?: string;
  date?: string;
}

// ==================== BUDGET TYPES ====================
export type BudgetPriority = 'essential' | 'important' | 'optional' | 'variable';

export interface CategoryBudget {
  id: string;
  user: string;
  category: ExpenseCategory;
  monthly_budget_ksh: string; // Decimal as string
  priority: BudgetPriority;
  created_at: string;
  updated_at: string;
}

export interface BudgetVsActual {
  category: ExpenseCategory;
  category_label: string;
  budget: string;
  monthly_budget: string;
  actual: string;
  monthly_spent: string;
  remaining: string;
  utilization_percent: string;
  monthly_utilization_percent: string;
  status: 'on_track' | 'warning' | 'exceeded';
  days_left: number;
  priority: BudgetPriority;
  daily_budget: string;
  daily_spent: string;
}

export interface CreateBudgetRequest {
  category: ExpenseCategory;
  monthly_budget_ksh: string;
  priority: BudgetPriority;
}

export type UpdateBudgetRequest = Partial<CreateBudgetRequest>;

export interface PartnerInvite {
  id: string;
  sender_email: string;
  receiver_email: string;
  inviter_name: string;
  inviter_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface BudgetVsActualResponse {
  data: BudgetVsActual[];
  summary: {
    budget: string;
    spent: string;
    remaining: string;
    utilization_percent: string;
    days_passed: number;
    days_total: number;
  };
  income: {
    total_available: string;
    expected: string;
  };
  status: 'success' | 'error';
}

// ==================== DASHBOARD TYPES ====================
export interface DashboardSummary {
  income: IncomeSummary;
  expenses: ExpensesSummary;
  savings: SavingsSummary;
  budgets: BudgetSummary;
  daily_spending: Array<{ day: number; amount: string; date: string }>;
  comparison_spending: Array<{ day: number; amount: string; date: string }>;
  matrix?: {
    capacity: string;
    planned: string;
    actual: string;
    buffer: string;
    vault_balance: string;
    utilization_rate: string;
    burn_rate: string;
    runway_days: number;
    health_score: number;
    savings_rate: string;
  };
  period?: {
    current_month: string;
    current_year: number;
    days_passed: number;
    days_total: number;
  };
  recent_transactions?: Array<{
    date: string;
    type: 'income' | 'expense' | 'investment' | 'vault';
    category: string;
    amount: string;
    description: string;
  }>;
  notifications?: Array<{
    type: 'partner_activity' | 'alert' | 'budget';
    severity: 'low' | 'medium' | 'high';
    title: string;
    message: string;
    amount?: string;
    date: string;
    icon: 'user' | 'alert' | 'budget';
  }>;
  ai_analysis?: AIAnalysis;
}

export interface AIAnalysis {
  status_line: string;
  score_verdict: string;
  top_risk: string;
  actions: string[];
  projection: string;
  one_thing: string;
}

export interface IncomeSummary {
  month: {
    expected: string;
    actual: string;
    period_actual: string;
    carry_forward: string;
    total_available: string;
    variance: string;
    variance_percent: string;
    entries_count: number;
  };
  year: {
    expected: string;
    actual: string;
    monthly_average: string;
  };
}

export interface ExpensesSummary {
  month: {
    total: string;
    buckets: {
      fixed: string;
      variable: string;
      discretionary: string;
      one_off: string;
    };
    categories: Record<string, { amount: string; percentage: string; entries: number }>;
  };
  year: {
    total: string;
    monthly_average: string;
  };
}

export interface SavingsSummary {
  total: {
    contributed: string;
    contributed_this_period: string;
    current_value: string;
    profit_loss: string;
    goal_target: string;
    goal_progress_percent: string;
    vault_balance: string;
    entries_count: number;
  };
  by_type: Record<
    string,
    {
      current_value: string;
      contributed: string;
      profit_loss: string;
      percentage: string;
      entries: number;
    }
  >;
}

export interface BudgetSummary {
  total: {
    budget: string;
    spent: string;
    remaining: string;
    utilization_percent: string;
  };
  by_category: Record<
    string,
    {
      budget: string;
      spent: string;
      remaining: string;
      utilization_percent: string;
      status: 'on_track' | 'warning' | 'exceeded';
    }
  >;
}

// ==================== INSIGHTS & ALERTS ====================
export interface InsightsData {
  ratios: any[];
  trends: {
    income_trend: Array<{ month: string; amount: string }>;
    expense_trend: Array<{ month: string; amount: string }>;
    savings_trend: Array<{ month: string; contributed: string }>;
    category_trends?: Record<string, Array<{ month: string; amount: string }>>;
  };
  alerts: any[];
  recommendations: any[];
  emergency_fund_months: number;
  generated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: string;
  frequency: 'monthly' | 'weekly';
  day_of_period: number;
  is_active: boolean;
  payment_method: string;
  last_processed_date: string | null;
  created_at: string;
}
