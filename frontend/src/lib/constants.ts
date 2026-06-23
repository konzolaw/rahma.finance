/**
 * All financial categories and constants for Kenya Finance App
 * These are FIXED and matched with the Django Backend models.
 */

// ==================== EXPENSE CATEGORIES ====================
export const EXPENSE_CATEGORIES = [
  { code: 'food', label: 'Food' },
  { code: 'transport', label: 'Transport' },
  { code: 'housing', label: 'Housing' },
  { code: 'personal_care', label: 'Personal Care' },
  { code: 'entertainment', label: 'Entertainment' },
  { code: 'insurance', label: 'Insurance' },
  { code: 'loans_debt', label: 'Loans & Debt' },
  { code: 'additional', label: 'Additional' },
  { code: 'miscellaneous', label: 'Miscellaneous' },
  { code: 'savings', label: 'Investment' },
] as const;

// ==================== EXPENSE SUBCATEGORIES ====================
// Matched exactly with SUBCATEGORIES in backend/apps/expenses/models.py
export const SUBCATEGORIES_BY_CATEGORY = {
  food: [
    'Groceries', 'Dining Out', 'Snacks', 'Meal Prep', 'Fast Food', 'Coffee', 'Extra 1', 'Extra 2'
  ],
  transport: [
    'Matatu', 'Fuel', 'Uber / Bolt', 'Parking', 'Car Maintenance', 'Motorcycle Transport (boda boda)', 'Travel'
  ],
  housing: [
    'Rent', 'Electricity (Kenya Power)', 'Water', 'Internet', 'Repairs & Maintenance', 'Furniture & Home Items', 'Cleaning Supplies'
  ],
  personal_care: [
    'Haircuts', 'Gym Membership', 'Toiletries', 'Skincare', 'Barber', 'Clothing & Shoes', 'Laundry'
  ],
  entertainment: [
    'Netflix', 'Spotify', 'Outings', 'Vacations & Holidays', 'Gaming', 'Movies & Cinema', 'Events & Concerts'
  ],
  insurance: [
    'NHIF / SHA', 'Medical Insurance (private)', 'Car Insurance', 'Life Insurance'
  ],
  loans_debt: [
    'HELB', 'Fuliza', 'M-Shwari', 'Bank Loan', 'Credit Card', 'Mobile Loan (KCB M-Pesa / Tala / Branch)', 'Extra Loan 1', 'Extra Loan 2'
  ],
  additional: [
    'Airtime / Data Bundles', 'Family Support', 'Donations & Church / Tithe', 'Education', 'Business Expenses', 'Medical Emergencies'
  ],
  miscellaneous: [
    'General', 'Pocket Money', 'Tips & Gratuities', 'Gifts', 'Other'
  ],
  savings: [
    'M-Pesa MMF', 'Bank Savings', 'SACCO Deposit', 'Chama Contribution', 'Chumz', 'Emergency Fund', 'Stocks / Shares', 'Crypto'
  ],
} as const;

// ==================== PAYMENT METHODS ====================
export const PAYMENT_METHODS = [
  { code: 'mpesa', label: 'M-Pesa' },
  { code: 'cash', label: 'Cash' },
  { code: 'debit_card', label: 'Debit Card' },
  { code: 'credit_card', label: 'Credit Card' },
  { code: 'bank_transfer', label: 'Bank Transfer' },
] as const;

// ==================== INCOME SOURCES ====================
export const INCOME_SOURCES = [
  { code: 'salary', label: 'Salary' },
  { code: 'freelance', label: 'Freelance Income' },
  { code: 'side_hustles', label: 'Side Hustles' },
  { code: 'trading', label: 'Trading Income' },
  { code: 'business', label: 'Business Income' },
  { code: 'dividends', label: 'Dividends' },
  { code: 'online_work', label: 'Online Work' },
] as const;

// ==================== INVESTMENT TYPES ====================
export const INVESTMENT_TYPES = [
  { code: 'sacco', label: 'SACCO' },
  { code: 'mmf', label: 'MMF (Money Market Fund)' },
  { code: 'chama', label: 'Chama' },
  { code: 'chumz', label: 'CHUMZ' },
  { code: 'emergency_fund', label: 'Emergency Fund' },
  { code: 'stocks', label: 'Stocks' },
  { code: 'treasury_bills', label: 'Treasury Bills' },
  { code: 'treasury_bonds', label: 'Treasury Bonds' },
  { code: 'crypto', label: 'Crypto' },
] as const;

// ==================== DEFAULT BUDGETS ====================
export const DEFAULT_BUDGETS = [
  {
    category: 'food',
    label: 'Food',
    default_ksh: 15000,
    priority: 1,
  },
  {
    category: 'transport',
    label: 'Transport',
    default_ksh: 8000,
    priority: 2,
  },
  {
    category: 'housing',
    label: 'Housing',
    default_ksh: 30000,
    priority: 1,
  },
  {
    category: 'personal_care',
    label: 'Personal Care',
    default_ksh: 5000,
    priority: 3,
  },
  {
    category: 'entertainment',
    label: 'Entertainment',
    default_ksh: 5000,
    priority: 3,
  },
  {
    category: 'insurance',
    label: 'Insurance',
    default_ksh: 8000,
    priority: 1,
  },
  {
    category: 'loans_debt',
    label: 'Loans & Debt',
    default_ksh: 10000,
    priority: 1,
  },
  {
    category: 'additional',
    label: 'Additional',
    default_ksh: 5000,
    priority: 3,
  },
] as const;

// ==================== HELPER FUNCTIONS ====================
export const getCategoryLabel = (code: string): string => {
  return EXPENSE_CATEGORIES.find((cat) => cat.code === code)?.label || code;
};

export const getPaymentMethodLabel = (code: string): string => {
  return PAYMENT_METHODS.find((method) => method.code === code)?.label || code;
};

export const getIncomeSourceLabel = (code: string): string => {
  return INCOME_SOURCES.find((source) => source.code === code)?.label || code;
};

export const getInvestmentTypeLabel = (code: string): string => {
  return INVESTMENT_TYPES.find((type) => type.code === code)?.label || code;
};

export const getSubcategories = (category: string) => {
  return (SUBCATEGORIES_BY_CATEGORY as any)[category] || [];
};

export const getDefaultBudget = (category: string) => {
  return DEFAULT_BUDGETS.find((budget) => budget.category === category)?.default_ksh || 0;
};
