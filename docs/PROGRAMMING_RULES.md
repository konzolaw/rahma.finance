# 🇰🇪 Kenya Finance App — Programming Rules & Standards
> **Version 1.0 · May 2026**
> Stack: Next.js 14 (PWA) + Django REST Framework + PostgreSQL
> These rules govern every line of code. They are not suggestions. They are standards.

---

## Table of Contents

1. [General Coding Standards](#1-general-coding-standards)
2. [Git & Version Control](#2-git--version-control)
3. [Django Backend Rules](#3-django-backend-rules)
4. [Next.js Frontend Rules](#4-nextjs-frontend-rules)
5. [Financial Logic Rules](#5-financial-logic-rules)
6. [Security Rules](#6-security-rules)
7. [Performance Rules](#7-performance-rules)
8. [PWA & Mobile Rules](#8-pwa--mobile-rules)
9. [Testing Rules](#9-testing-rules)
10. [UX & Display Rules](#10-ux--display-rules)
11. [Debugging Rules](#11-debugging-rules)
12. [Logging Rules](#12-logging-rules)
13. [Environment & Config Rules](#13-environment--config-rules)
14. [Code Review Rules](#14-code-review-rules)
15. [Forbidden Patterns](#15-forbidden-patterns)

---

## 1. General Coding Standards

### 1.1 Language & Typing

**R001 · TypeScript everywhere in the frontend — no plain `.js` files**
Every file in the Next.js codebase must be `.ts` or `.tsx`. Enable strict mode in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```
Never use `any` as a type unless there is genuinely no alternative. When you must use `any`, add a comment explaining exactly why.

---

**R002 · Python type hints on every Django function and method**
```python
# ✅ CORRECT
from __future__ import annotations
from decimal import Decimal

def calculate_savings_rate(savings: Decimal, income: Decimal) -> Decimal:
    if income == 0:
        return Decimal("0.00")
    return (savings / income * 100).quantize(Decimal("0.01"))

# ❌ WRONG
def calculate_savings_rate(savings, income):
    return savings / income * 100
```

---

**R003 · Define TypeScript interfaces for everything — in `/src/types/`**
```typescript
// src/types/expense.ts
export interface ExpenseEntry {
  id: string;
  category: ExpenseCategory;
  subcategory: string;
  date: string;           // YYYY-MM-DD
  dayOfWeek: string;      // "Mon", "Tue", etc.
  description: string;
  amount: string;         // Always string (Ksh Decimal)
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'personal_care'
  | 'entertainment'
  | 'insurance'
  | 'loans_debt'
  | 'additional';

export type PaymentMethod = 'cash' | 'mpesa' | 'debit_card' | 'credit_card' | 'bank_transfer';
```

---

### 1.2 Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `ExpenseCard.tsx` |
| React hooks | camelCase, starts with `use` | `useExpenses.ts` |
| Utility functions | camelCase | `formatKsh()` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_BUDGET_KSH` |
| TypeScript interfaces | PascalCase | `ExpenseEntry` |
| TypeScript type aliases | PascalCase | `PaymentMethod` |
| Django models | PascalCase singular | `ExpenseEntry` |
| Django views | PascalCase | `ExpenseListView` |
| Django serializers | PascalCase | `ExpenseEntrySerializer` |
| URL patterns | kebab-case | `/expenses/summary/` |
| Database columns | snake_case | `monthly_budget_ksh` |
| Environment variables | SCREAMING_SNAKE_CASE | `DATABASE_URL` |
| Feature branches | kebab-case prefixed | `feature/expense-form` |

---

### 1.3 File & Folder Organization

**R004 · One component per file — no exceptions**
- The filename must match the component name exactly: `ExpenseCard.tsx` exports `ExpenseCard`
- No file should export more than one component
- Sub-components used only by one parent live in the same feature folder, not a global folder

**R005 · Group by feature, not by type**
```
✅ CORRECT
src/components/
  expenses/
    ExpenseCard.tsx
    ExpenseList.tsx
    ExpenseSummaryBanner.tsx
    useExpenseFilters.ts
  dashboard/
    DashboardCard.tsx
    HealthIndicator.tsx
    BudgetGauge.tsx

❌ WRONG
src/components/
  ExpenseCard.tsx
  DashboardCard.tsx
  ExpenseList.tsx
  HealthIndicator.tsx
  BudgetGauge.tsx
```

**R006 · Shared utilities live in `/lib` — never duplicated**
- `/lib/formatters.ts` — `formatKsh()`, `formatDate()`, `formatPercent()`
- `/lib/constants.ts` — all dropdown options, category lists, benchmark thresholds
- `/lib/api/` — all API call functions organized by domain
- `/lib/validators.ts` — Zod schemas

---

### 1.4 Comments & Documentation

**R007 · Every exported function and component must have a JSDoc comment**
```typescript
/**
 * Formats a monetary amount in Kenyan Shilling format.
 * @param amount - The amount as a number or string (e.g., "15000.00")
 * @returns Formatted string (e.g., "Ksh 15,000")
 */
export function formatKsh(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `Ksh ${num.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}
```

**R008 · Inline comments explain WHY, not WHAT**
```python
# ✅ CORRECT — explains the business reason
# Use calendar month boundaries (not rolling 30-day window) because
# users think in terms of "this month's spending", not "last 30 days"
month_start = today.replace(day=1)

# ❌ WRONG — just restates the code
# Set month_start to first day of month
month_start = today.replace(day=1)
```

**R009 · No commented-out code in commits**
Delete dead code. If you need to preserve it, use a branch. A clean codebase has no zombie code.

---

### 1.5 Error Handling

**R010 · Every async operation must have error handling**
```typescript
// ✅ CORRECT
const { data, isLoading, error } = useQuery({
  queryKey: ['expenses', month, year],
  queryFn: () => getExpenses({ month, year }),
});

if (error) return <ErrorBanner message="Could not load expenses. Please try again." />;
```

**R011 · Never expose raw error messages to the user**
```python
# ✅ CORRECT — in Django view
try:
    result = calculate_monthly_summary(user, month, year)
except Exception as e:
    logger.error(f"Dashboard calculation failed for user {user.id}: {e}", exc_info=True)
    return Response(
        {"error": "Could not load dashboard. Please try again."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
```

---

## 2. Git & Version Control

### 2.1 Branching Strategy

| Branch | Purpose | Rule |
|--------|---------|------|
| `main` | Production — what is live | Never commit directly. Merge from `staging` only after full testing. |
| `staging` | Integration testing | Merge feature branches here first. Test fully before merging to `main`. |
| `feature/*` | Individual features | One branch per feature. Name it descriptively. |
| `fix/*` | Bug fixes | For isolated bug fixes. Merge to `staging` when done. |
| `chore/*` | Setup, config, refactoring | For non-feature changes. |

---

### 2.2 Commit Message Rules

**R012 · Follow Conventional Commits format on every commit**
```
type(scope): short description (max 72 chars)

Optional longer body explaining WHY, not WHAT.
```

Allowed types:
- `feat` — new feature
- `fix` — bug fix
- `chore` — setup, config, dependencies
- `style` — formatting only, no logic change
- `refactor` — code change, no feature/fix
- `test` — adding or updating tests
- `docs` — documentation only

```bash
# ✅ CORRECT
feat(expenses): add food category form with subcategory dropdown
fix(dashboard): correct savings rate to use calendar month not rolling 30 days
chore(backend): add django-cors-headers to requirements.txt
test(calculations): add unit tests for debt-to-income ratio edge cases

# ❌ WRONG
fix stuff
update
changes
wip
done
```

**R013 · One logical change per commit**
Never mix a bug fix with a new feature in one commit. Never mix backend and frontend changes unless they are a single atomic change. If a commit touches more than 5 files, ask yourself whether it should be split.

**R014 · Never commit directly to `main` or `staging`**
All changes go through feature branches and are reviewed (even if by yourself) before merging.

---

### 2.3 What Never Goes in Git

**R015 · These files must be in `.gitignore` and must NEVER be committed:**
```
.env
.env.local
.env.production
.env.staging
*.pem
*.key
venv/
__pycache__/
*.pyc
*.pyo
node_modules/
.next/
dist/
.DS_Store
*.sqlite3
db.sqlite3
```

> ⚠️ If a secret is ever accidentally committed, rotate it **immediately** — changing the file and force-pushing does not help because the secret is in the git history.

---

## 3. Django Backend Rules

### 3.1 Project Structure

**R016 · Each domain gets its own Django app**
```
backend/
  apps/
    users/       — User model, authentication
    income/      — IncomeEntry model + CRUD API
    expenses/    — ExpenseEntry model + CRUD API
    savings/     — SavingsEntry model + CRUD API
    budgets/     — CategoryBudget model + settings API
    dashboard/   — Aggregated summary API (no models)
    insights/    — Financial ratios API (no models)
```
Never put expense logic inside the `users` app. Each app owns its `models.py`, `views.py`, `serializers.py`, `urls.py`, `services.py`, and `tests/`.

**R017 · Split Django settings into base / development / production**
```python
# config/settings/base.py — shared settings
# config/settings/development.py — local dev, DEBUG=True
# config/settings/production.py — live server, DEBUG=False, strict security
```
Run locally with: `DJANGO_SETTINGS_MODULE=config.settings.development`
Run in production with: `DJANGO_SETTINGS_MODULE=config.settings.production`

---

### 3.2 Model Rules

**R018 · All primary keys must be UUIDs**
```python
import uuid
from django.db import models

class ExpenseEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # ...
```
Never use auto-incrementing integer IDs. They are enumerable (an attacker can guess `/expenses/1/`, `/expenses/2/`). UUIDs are not guessable.

**R019 · All monetary fields must use `DecimalField` — never `FloatField`**
```python
# ✅ CORRECT
amount = models.DecimalField(max_digits=12, decimal_places=2)

# ❌ WRONG — floats cause precision errors in financial calculations
amount = models.FloatField()
```

**R020 · Every model must have `created_at` and `updated_at` timestamps**
```python
created_at = models.DateTimeField(auto_now_add=True)
updated_at = models.DateTimeField(auto_now=True)
```

**R021 · `day_of_week` must be auto-computed from `date` in the model's `save()` method**
```python
def save(self, *args, **kwargs):
    if self.date:
        self.day_of_week = self.date.strftime("%a")  # "Mon", "Tue", etc.
    super().save(*args, **kwargs)
```
Never allow the API caller to set `day_of_week` directly. It is a derived field.

**R022 · Every model must implement `__str__`**
```python
def __str__(self) -> str:
    return f"{self.category} - Ksh {self.amount} on {self.date.strftime('%d/%m/%Y')}"
```

**R023 · Add database indexes on frequently queried fields**
```python
class ExpenseEntry(models.Model):
    user     = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    category = models.CharField(max_length=50, db_index=True)
    date     = models.DateField(db_index=True)
```
Every field used in `.filter()` calls on large tables must be indexed.

---

### 3.3 View & Serializer Rules

**R024 · Use ViewSets + Routers for standard CRUD**
```python
# ✅ CORRECT — auto-generates list, create, retrieve, update, destroy
class ExpenseEntryViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExpenseEntry.objects.filter(user=self.request.user)
```

**R025 · Every view must enforce authentication**
Set globally in settings:
```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
}
```
Explicitly override with `permission_classes = [AllowAny]` only for `register`, `login`, and `password-reset` endpoints.

**R026 · Always filter querysets by `request.user` — this is a security rule**
```python
# ✅ CORRECT
def get_queryset(self):
    return ExpenseEntry.objects.filter(user=self.request.user)

# ❌ WRONG — returns ALL users' expenses
def get_queryset(self):
    return ExpenseEntry.objects.all()
```

**R027 · All calculations go in a `services.py` file — never in views or serializers**
```python
# apps/dashboard/services.py
from decimal import Decimal
from apps.expenses.models import ExpenseEntry
from apps.income.models import IncomeEntry

def get_monthly_summary(user, month: int, year: int) -> dict:
    """
    Aggregates all financial data for a given calendar month.
    Returns pre-computed values ready for the API response.
    """
    # ... calculation logic here
```
The view calls `get_monthly_summary(request.user, month, year)` and returns the result. No calculation logic in views.

**R028 · Validate all input in serializers**
```python
class ExpenseEntrySerializer(serializers.ModelSerializer):
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_category(self, value):
        valid = ['food','transport','housing','personal_care',
                 'entertainment','insurance','loans_debt','additional']
        if value not in valid:
            raise serializers.ValidationError(f"Invalid category. Must be one of: {valid}")
        return value
```

---

### 3.4 API Response Rules

**R029 · Return all monetary values as strings from the API**
```python
# In Django settings
REST_FRAMEWORK = {
    'COERCE_DECIMAL_TO_STRING': True,
}
```
This prevents floating point precision loss in JSON serialization. The frontend always receives `"15000.00"`, never `15000.000000000001`.

**R030 · Follow a consistent response envelope**
```python
# Success (single object)
{"data": {...}, "message": "ok"}

# Success (list)
{"data": [...], "count": 42, "message": "ok"}

# Created
{"data": {...}, "message": "Created successfully"}

# Error
{"error": "Amount must be greater than zero.", "code": "VALIDATION_ERROR"}

# Server error
{"error": "Something went wrong. Please try again.", "code": "SERVER_ERROR"}
```

**R031 · Use correct HTTP status codes**
| Status | When to use |
|--------|-------------|
| `200 OK` | Successful GET, PATCH |
| `201 Created` | Successful POST (resource created) |
| `204 No Content` | Successful DELETE |
| `400 Bad Request` | Validation error |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | Authenticated but not permitted (e.g. accessing another user's data) |
| `404 Not Found` | Resource does not exist |
| `500 Internal Server Error` | Unexpected server-side error |

Never return `200` with an error body. Never return `400` for a server error.

---

### 3.5 Migration Rules

**R032 · Write a migration for every model change — never alter the DB manually**
```bash
# After every model change:
python manage.py makemigrations
python manage.py migrate

# Then commit the migration file with the code that requires it
git add apps/expenses/migrations/0003_add_notes_field.py
```

**R033 · Never run `makemigrations --merge` without understanding the conflict**
Read both conflicting migrations. Understand what each branch changed. Resolve manually if needed.

---

## 4. Next.js Frontend Rules

### 4.1 Component Rules

**R034 · Default to Server Components — add `"use client"` only when needed**

Use `"use client"` only when the component needs:
- `useState`, `useReducer`, `useEffect`
- Browser APIs (`window`, `document`, `navigator`)
- Event handlers (`onClick`, `onChange`)
- Third-party libraries that are not server-compatible

```typescript
// ✅ Server Component — no "use client"
// src/app/(app)/dashboard/page.tsx
import { getDashboardData } from '@/lib/api/dashboard';

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardView data={data} />;
}
```

**R035 · Every component must have a typed Props interface**
```typescript
// ✅ CORRECT
interface ExpenseCardProps {
  id: string;
  description: string;
  amount: string;
  category: ExpenseCategory;
  date: string;
  onDelete: (id: string) => void;
}

export function ExpenseCard({ id, description, amount, category, date, onDelete }: ExpenseCardProps) {
  // ...
}
```

**R036 · Never put side effects or API calls in the component body**
```typescript
// ❌ WRONG
function ExpenseList() {
  const expenses = fetchExpenses(); // Never do this
  return <div>{expenses.map(...)}</div>;
}

// ✅ CORRECT
function ExpenseList() {
  const { data: expenses, isLoading, error } = useExpenses();
  if (isLoading) return <ExpenseListSkeleton />;
  if (error) return <ErrorBanner />;
  return <div>{expenses?.map(...)}</div>;
}
```

**R037 · List keys must be the database UUID — never use array index**
```typescript
// ✅ CORRECT
expenses.map((expense) => <ExpenseCard key={expense.id} {...expense} />)

// ❌ WRONG
expenses.map((expense, index) => <ExpenseCard key={index} {...expense} />)
```

---

### 4.2 State Management

**R038 · Server state (API data) in React Query — UI state in Zustand**

| Data type | Where it lives |
|-----------|---------------|
| Expenses from API | React Query (`useQuery`) |
| Dashboard summary | React Query (`useQuery`) |
| Which modal is open | Zustand |
| Active month filter | Zustand |
| Form field values | React Hook Form |
| User profile | React Query + Zustand (cache on login) |

**R039 · Define custom hooks for all data fetching**
```typescript
// src/hooks/useExpenses.ts
export function useExpenses(filters: ExpenseFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => getExpenses(filters),
    staleTime: 60_000, // 1 minute
  });
}

// In component
const { data, isLoading, error } = useExpenses({ month: 1, year: 2026 });
```

**R040 · Use optimistic updates for expense and income creation**
```typescript
const mutation = useMutation({
  mutationFn: createExpense,
  onMutate: async (newExpense) => {
    await queryClient.cancelQueries({ queryKey: ['expenses'] });
    const previous = queryClient.getQueryData(['expenses']);
    // Optimistically add to cache
    queryClient.setQueryData(['expenses'], (old) => [...old, newExpense]);
    return { previous };
  },
  onError: (err, newExpense, context) => {
    // Roll back on failure
    queryClient.setQueryData(['expenses'], context?.previous);
    toast.error('Failed to save expense. Please try again.');
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    toast.success('Expense saved ✅');
  },
});
```

---

### 4.3 API Client Rules

**R041 · All API calls go through a single Axios instance**
```typescript
// src/lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return apiClient.request(error.config);
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);
```

**R042 · API functions are defined in `/lib/api/` — never inline in components**
```typescript
// src/lib/api/expenses.ts
export async function getExpenses(filters: ExpenseFilters): Promise<ExpenseListResponse> {
  const { data } = await apiClient.get('/expenses/', { params: filters });
  return data;
}

export async function createExpense(payload: CreateExpensePayload): Promise<ExpenseEntry> {
  const { data } = await apiClient.post('/expenses/', payload);
  return data.data;
}
```

---

### 4.4 Form Rules

**R043 · Use React Hook Form + Zod for all forms**
```typescript
// src/lib/validators.ts
import { z } from 'zod';

export const expenseFormSchema = z.object({
  category: z.enum(['food','transport','housing','personal_care',
                    'entertainment','insurance','loans_debt','additional']),
  subcategory: z.string().min(1, 'Please select a subcategory'),
  description: z.string().min(1, 'Description is required').max(200),
  amount: z.string().refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash','mpesa','debit_card','credit_card','bank_transfer']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  notes: z.string().max(500).optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
```

**R044 · All dropdown options are constants — never hardcoded inline in JSX**
```typescript
// src/lib/constants.ts
export const EXPENSE_CATEGORIES = [
  { value: 'food',         label: 'Food' },
  { value: 'transport',    label: 'Transport' },
  { value: 'housing',      label: 'Housing' },
  // ...
] as const;

export const FOOD_SUBCATEGORIES = [
  'Groceries', 'Dining Out', 'Snacks', 'Meal Prep',
  'Fast Food', 'Coffee', 'Extra 1', 'Extra 2',
] as const;

export const PAYMENT_METHODS = [
  { value: 'cash',          label: 'Cash' },
  { value: 'mpesa',         label: 'M-Pesa' },
  { value: 'debit_card',    label: 'Debit Card' },
  { value: 'credit_card',   label: 'Credit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
] as const;
```

**R045 · After successful form submission: reset, toast, invalidate cache**
```typescript
onSuccess: () => {
  form.reset();                                              // Clear form
  toast.success('Expense saved ✅');                        // Notify user
  queryClient.invalidateQueries({ queryKey: ['expenses'] }); // Refresh lists
  queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Refresh dashboard
  router.back();                                             // Go back if needed
}
```

---

## 5. Financial Logic Rules

**R046 · ALL calculations happen in the Django backend — the frontend only displays**

The frontend never:
- Calculates savings rates
- Calculates budget percentages
- Sums up monthly totals
- Computes running totals
- Derives any financial ratio

If you find yourself doing math in a React component, stop. Move it to the backend.

---

**R047 · "Current month" always means the calendar month — not a rolling 30-day window**
```python
from django.utils import timezone
from datetime import date

def get_month_range(month: int, year: int) -> tuple[date, date]:
    """
    Returns the first and last day of the given calendar month.
    Uses calendar month boundaries (Jan 1–31), NOT a rolling 30-day window.
    """
    import calendar
    first_day = date(year, month, 1)
    last_day  = date(year, month, calendar.monthrange(year, month)[1])
    return first_day, last_day
```

---

**R048 · Financial ratios use `expected_monthly_income` — not actual income**

| Ratio | Denominator |
|-------|------------|
| Savings Rate | `user.expected_monthly_income` |
| Expense Ratio | `user.expected_monthly_income` |
| Housing Cost Ratio | `user.expected_monthly_income` |
| Debt-to-Income | `user.expected_monthly_income` |
| Food Cost Ratio | `user.expected_monthly_income` |
| **Surplus/Deficit** | **Actual income this month** (exception) |

This makes ratios stable and comparable across months even when income varies.

---

**R049 · Use Python `Decimal` everywhere in financial arithmetic — never `float`**
```python
from decimal import Decimal, ROUND_HALF_UP

# ✅ CORRECT
savings_rate = (savings / income * Decimal("100")).quantize(
    Decimal("0.01"), rounding=ROUND_HALF_UP
)

# ❌ WRONG — float arithmetic introduces precision errors
savings_rate = float(savings) / float(income) * 100
```

---

**R050 · Handle division by zero on every ratio calculation**
```python
def calculate_savings_rate(savings: Decimal, expected_income: Decimal) -> Decimal:
    """
    Returns savings rate as a percentage.
    Returns 0.00 if expected_income is zero to avoid ZeroDivisionError.
    """
    if not expected_income or expected_income == 0:
        return Decimal("0.00")
    return (savings / expected_income * 100).quantize(Decimal("0.01"))
```

---

**R051 · Budget status thresholds are fixed constants — never magic numbers**
```python
# apps/budgets/constants.py

SAVINGS_RATE_GREEN   = Decimal("20.00")   # >= 20% is healthy
SAVINGS_RATE_YELLOW  = Decimal("10.00")   # 10–19% is borderline

EXPENSE_RATIO_GREEN  = Decimal("80.00")   # < 80% is healthy
EXPENSE_RATIO_YELLOW = Decimal("90.00")   # 80–90% is borderline

HOUSING_RATIO_GREEN  = Decimal("30.00")   # <= 30% is healthy
HOUSING_RATIO_YELLOW = Decimal("40.00")   # 30–40% is borderline

DTI_GREEN            = Decimal("20.00")   # <= 20% is healthy
DTI_YELLOW           = Decimal("35.00")   # 20–35% is borderline

EMERGENCY_FUND_FULL_MONTHS  = 6           # 6 months = fully funded
EMERGENCY_FUND_HALF_MONTHS  = 3           # 3 months = halfway

BUDGET_NEAR_LIMIT_THRESHOLD  = Decimal("90.00")  # % of budget used
BUDGET_OVER_THRESHOLD        = Decimal("100.00") # % of budget used
```

---

## 6. Security Rules

**R052 · JWT token lifetimes**
```python
# config/settings/base.py
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS':  True,   # Issue new refresh token on each refresh
    'BLACKLIST_AFTER_ROTATION': True, # Invalidate old refresh token
}
```

**R053 · Store tokens correctly**

| Token | Storage |
|-------|---------|
| Access token | In-memory only (Zustand state) |
| Refresh token | `httpOnly`, `Secure`, `SameSite=Strict` cookie |

Never use `localStorage` or `sessionStorage` for tokens. They are accessible to JavaScript and are vulnerable to XSS attacks.

**R054 · CORS settings — no wildcards in production**
```python
# config/settings/production.py
CORS_ALLOWED_ORIGINS = [
    "https://yourapp.vercel.app",
]
CORS_ALLOW_CREDENTIALS = True
```

**R055 · Filter every queryset by `request.user` — always**
```python
# This is enforced in the base ViewSet mixin
class UserOwnedMixin:
    def get_queryset(self):
        assert hasattr(self, 'model'), "ViewSet must set model attribute"
        return self.model.objects.filter(user=self.request.user)
```

**R056 · `DEBUG = False` in production — verified before every deploy**
```python
# config/settings/production.py
DEBUG = env.bool("DEBUG", default=False)

# Also set:
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")  # e.g., ["api.yourapp.com"]
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

---

## 7. Performance Rules

**R057 · Dashboard API returns all data in one request**
The `/dashboard/` endpoint aggregates and returns ALL summary cards, budget status, and financial ratios in a single API call. The frontend makes ONE request when the dashboard loads, not eight separate ones.

**R058 · Use database aggregation — never Python loops over querysets**
```python
from django.db.models import Sum, Count, Avg

# ✅ CORRECT — one SQL query
result = ExpenseEntry.objects.filter(
    user=user,
    date__gte=month_start,
    date__lte=month_end
).values('category').annotate(total=Sum('amount'))

# ❌ WRONG — loads all rows into Python then loops
expenses = ExpenseEntry.objects.filter(user=user, ...)
total = sum(e.amount for e in expenses)  # Never do this
```

**R059 · Paginate all list endpoints**
```python
class ExpenseEntryViewSet(viewsets.ModelViewSet):
    pagination_class = PageNumberPagination
    page_size = 50
```
The `/expenses/` endpoint never returns all records at once. As months of data accumulate, an unpaginated endpoint becomes unusable on mobile.

**R060 · Select related fields to avoid N+1 queries**
```python
# ✅ CORRECT — joins user in the same query
ExpenseEntry.objects.filter(...).select_related('user')

# ❌ WRONG — executes one extra query per expense to fetch the user
expenses = ExpenseEntry.objects.filter(...)
for expense in expenses:
    print(expense.user.email)  # N+1 queries
```

**R061 · React Query `staleTime` configuration**
```typescript
// Dashboard data — stale after 5 minutes
useQuery({ queryKey: ['dashboard'], staleTime: 5 * 60 * 1000 })

// Transaction lists — stale after 1 minute
useQuery({ queryKey: ['expenses'], staleTime: 60 * 1000 })

// Budget settings — stale after 10 minutes (rarely changes)
useQuery({ queryKey: ['budgets'], staleTime: 10 * 60 * 1000 })
```

---

## 8. PWA & Mobile Rules

**R062 · Design mobile-first — 390px wide first, desktop second**
```typescript
// ✅ CORRECT — mobile first, then larger
<div className="flex flex-col gap-2 md:flex-row md:gap-4">

// ❌ WRONG — desktop first, broken on mobile
<div className="flex flex-row gap-4">
```

**R063 · Touch targets must be at least 44×44px**
```typescript
// On all tappable elements:
<button className="min-h-[44px] min-w-[44px] px-4 py-3">
  Save Expense
</button>
```

**R064 · Amount fields must use numeric keypad on mobile**
```typescript
<input
  type="text"
  inputMode="decimal"  // Triggers numeric keypad on mobile
  pattern="[0-9]*"
  placeholder="0"
/>
```

**R065 · PWA manifest.json must be complete**
```json
{
  "name": "Kenya Finance",
  "short_name": "KeshoKwako",
  "description": "Your personal finance manager for Kenya",
  "start_url": "/dashboard",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#1B2A4A",
  "theme_color": "#1B2A4A",
  "icons": [
    { "src": "/icons/icon-72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96.png",   "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128.png",  "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png",  "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png",  "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png",  "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-384.png",  "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png",  "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

---

## 9. Testing Rules

### 9.1 Backend Tests (Django)

**R066 · Every calculation function must have unit tests**
```python
# apps/dashboard/tests/test_services.py
from decimal import Decimal
from django.test import TestCase
from apps.dashboard.services import calculate_savings_rate

class SavingsRateTests(TestCase):
    def test_normal_case(self):
        result = calculate_savings_rate(
            savings=Decimal("10000"),
            income=Decimal("50000")
        )
        self.assertEqual(result, Decimal("20.00"))

    def test_zero_income_returns_zero(self):
        result = calculate_savings_rate(
            savings=Decimal("5000"),
            income=Decimal("0")
        )
        self.assertEqual(result, Decimal("0.00"))

    def test_over_100_percent(self):
        # Edge case: more saved than earned (possible if income was late)
        result = calculate_savings_rate(
            savings=Decimal("60000"),
            income=Decimal("50000")
        )
        self.assertEqual(result, Decimal("120.00"))
```

**R067 · Every API endpoint must have an integration test**
```python
class ExpenseAPITests(APITestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_unauthenticated_request_returns_401(self):
        self.client.logout()
        response = self.client.get('/api/v1/expenses/')
        self.assertEqual(response.status_code, 401)

    def test_user_cannot_access_other_users_expenses(self):
        other_user = UserFactory()
        expense = ExpenseEntryFactory(user=other_user)
        response = self.client.get(f'/api/v1/expenses/{expense.id}/')
        self.assertEqual(response.status_code, 404)

    def test_create_expense_returns_201(self):
        payload = {
            "category": "food",
            "subcategory": "Groceries",
            "description": "Naivas weekly shop",
            "amount": "2500.00",
            "payment_method": "mpesa",
            "date": "2026-01-15",
        }
        response = self.client.post('/api/v1/expenses/', payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['data']['category'], 'food')
```

**R068 · Use `factory_boy` for test data — no inline model creation**
```python
# apps/expenses/tests/factories.py
import factory
from factory.django import DjangoModelFactory
from apps.expenses.models import ExpenseEntry

class ExpenseEntryFactory(DjangoModelFactory):
    class Meta:
        model = ExpenseEntry

    user        = factory.SubFactory('apps.users.tests.factories.UserFactory')
    category    = 'food'
    subcategory = 'Groceries'
    description = factory.Sequence(lambda n: f'Expense {n}')
    amount      = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True)
    payment_method = 'mpesa'
    date        = factory.Faker('date_this_month')
```

---

### 9.2 Frontend Tests (Vitest + React Testing Library)

**R069 · Every utility function must have unit tests**
```typescript
// src/lib/__tests__/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatKsh } from '../formatters';

describe('formatKsh', () => {
  it('formats a normal amount', () => {
    expect(formatKsh('15000.00')).toBe('Ksh 15,000');
  });
  it('handles zero', () => {
    expect(formatKsh(0)).toBe('Ksh 0');
  });
  it('handles large amounts', () => {
    expect(formatKsh('1000000')).toBe('Ksh 1,000,000');
  });
  it('handles negative amounts', () => {
    expect(formatKsh(-5000)).toBe('Ksh -5,000');
  });
});
```

**R070 · Test the expense form end-to-end**
```typescript
// src/components/expenses/__tests__/ExpenseForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExpenseForm } from '../ExpenseForm';

it('submits correct data when form is filled and submitted', async () => {
  const mockOnSubmit = vi.fn();
  render(<ExpenseForm onSubmit={mockOnSubmit} />);

  fireEvent.change(screen.getByLabelText('Description'), {
    target: { value: 'Naivas weekly shop' }
  });
  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '2500' }
  });
  fireEvent.click(screen.getByText('Save Expense'));

  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Naivas weekly shop', amount: '2500' })
    );
  });
});
```

---

## 10. UX & Display Rules

**R071 · Every screen must show a skeleton loader while data is fetching**
```typescript
// ✅ CORRECT
function DashboardPage() {
  const { data, isLoading } = useDashboard();
  if (isLoading) return <DashboardSkeleton />;
  return <DashboardView data={data} />;
}

// ❌ WRONG — blank screen while loading
function DashboardPage() {
  const { data } = useDashboard();
  if (!data) return null;
  return <DashboardView data={data} />;
}
```

**R072 · Every destructive action requires a confirmation dialog**
```typescript
function DeleteExpenseButton({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Delete</button>
      <ConfirmDialog
        open={showConfirm}
        title="Delete Expense"
        message="Delete this expense? This cannot be undone."
        onConfirm={() => deleteExpense(id)}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
```

**R073 · All Ksh amounts use the single `formatKsh()` utility — no exceptions**
```typescript
// src/lib/formatters.ts

export function formatKsh(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Ksh 0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Ksh 0';
  const formatted = Math.abs(num).toLocaleString('en-KE', { maximumFractionDigits: 0 });
  return num < 0 ? `Ksh -${formatted}` : `Ksh ${formatted}`;
}

export function formatDate(dateStr: string): string {
  // Returns DD/MM/YYYY format (Kenyan standard)
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB'); // en-GB uses DD/MM/YYYY
}

export function formatPercent(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num.toFixed(1)}%`;
}
```

---

## 11. Debugging Rules

> These rules are specifically for when something is broken and you are investigating.

**R074 · Before changing any code, reproduce the bug reliably first**
Write down exactly what steps reproduce the bug. Can you reproduce it every time? Intermittently? Only with certain data? A bug you cannot reproduce reliably is a bug you cannot confidently fix. Do not change code until you can reproduce the issue on demand.

---

**R075 · Read the full error message — do not skim it**
The most common debugging mistake is skimming the error and guessing the cause. Read:
1. The error **type** (e.g., `TypeError`, `KeyError`, `IntegrityError`)
2. The error **message** (the specific description)
3. The **traceback** from bottom to top — the bottom is where the error occurred, the top is where it was triggered
4. The **line number and file** where it happened

Do not Google the error until you have read all four of these.

---

**R076 · For Django API bugs — always check the Django server logs first**
```bash
# In development, Django prints full tracebacks to the terminal
python manage.py runserver

# Look for lines like:
# ERROR 2026-01-15 14:32:10 django.request Internal Server Error: /api/v1/expenses/
# Traceback (most recent call last):
#   File "apps/expenses/services.py", line 47, in calculate_summary
#     ...
```
The full Python traceback is always in the server logs. The API response only contains the clean error message.

---

**R077 · For React/Next.js bugs — always check the browser console first**
Open DevTools → Console. Look for:
- Red error messages
- Warning messages (often predict errors)
- Failed network requests (click on them to see the full request/response)
- React hydration errors (usually caused by mismatched server/client rendering)

Do not start editing code until you have read the console output.

---

**R078 · For API call failures — inspect the network request in DevTools**
Open DevTools → Network tab → find the failed request → click on it:
1. **Request tab** — verify the correct URL, method, and body were sent
2. **Response tab** — read the full error response from the backend
3. **Headers tab** — verify the `Authorization: Bearer ...` header is present

Most API bugs are either: wrong URL, missing auth header, wrong request body format, or a backend validation error that is clearly described in the response body.

---

**R079 · Use structured print debugging before adding a complex debugger**
When a calculation is producing wrong output, add temporary prints to trace the data:
```python
# Python — temporary debugging (REMOVE BEFORE COMMIT)
def calculate_savings_rate(savings, income):
    print(f"DEBUG calculate_savings_rate: savings={savings!r}, income={income!r}")
    if income == 0:
        print("DEBUG: income is zero, returning 0")
        return Decimal("0.00")
    result = (savings / income * 100).quantize(Decimal("0.01"))
    print(f"DEBUG calculate_savings_rate: result={result!r}")
    return result
```
```typescript
// TypeScript — temporary debugging (REMOVE BEFORE COMMIT)
function calculateBudgetStatus(spent: number, budget: number): BudgetStatus {
  console.log('[DEBUG] calculateBudgetStatus', { spent, budget });
  const percentage = (spent / budget) * 100;
  console.log('[DEBUG] percentage:', percentage);
  // ...
}
```
**Always prefix debug prints with `DEBUG` or `[DEBUG]` so they are easy to find and remove.**

---

**R080 · For Django ORM query bugs — print the SQL query being executed**
```python
# In Django shell or view — print the exact SQL
queryset = ExpenseEntry.objects.filter(user=user, date__month=1)
print(queryset.query)
# SELECT "expenses_expenseentry"."id", ... WHERE "user_id" = '...' AND EXTRACT(month FROM "date") = 1
```
This reveals whether the filter is doing what you think it is.

---

**R081 · For React Query bugs — use the React Query DevTools**
Install and add `<ReactQueryDevtools />` in development:
```typescript
// src/app/layout.tsx (development only)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```
The DevTools panel shows: every query's status, its cached data, when it last fetched, and its error if it failed. Use this before assuming an API problem.

---

**R082 · Isolate the problem to the smallest possible failing case**
If the dashboard is showing wrong totals, do not immediately investigate the whole dashboard. Ask:
- Is the raw data in the database correct? (Check Django admin)
- Is the API returning the correct value? (Check the raw API response in DevTools)
- Is the frontend displaying what the API returns? (Console log the API response)
- Is the formatting function changing the value? (Unit test the formatter in isolation)

Each step either confirms the bug is downstream or eliminates a layer. This is the fastest path to the root cause.

---

**R083 · For calculation bugs — write a failing unit test first, then fix the code**
```python
# Step 1: Write a test that demonstrates the bug
def test_savings_rate_when_savings_exceeds_budget(self):
    # Bug report: savings rate shows 0% when savings > expected income
    result = calculate_savings_rate(
        savings=Decimal("60000"),
        income=Decimal("50000")
    )
    # This test will FAIL with the buggy code, showing the exact wrong value
    self.assertEqual(result, Decimal("120.00"))

# Step 2: Run the test, see it fail, confirm you understand the bug
# Step 3: Fix the code
# Step 4: Run the test again, see it pass
# Step 5: Commit both the test and the fix together
```
This approach proves the bug existed, proves the fix works, and prevents regression.

---

**R084 · Check the Django admin to verify data before suspecting a code bug**
When the UI shows unexpected data, before debugging the code:
1. Open Django admin (`/admin/`)
2. Navigate to the relevant model
3. Check whether the data in the database is actually what you expect
4. If the data is wrong, the bug is in data entry or migration
5. If the data is correct, the bug is in calculation or display

Half of all "calculation bugs" are actually data bugs.

---

**R085 · When stuck for more than 30 minutes — explain the problem out loud (rubber duck debugging)**
Describe the bug to yourself (or to a rubber duck, your coffee mug, or a colleague) as if explaining it to someone who has never seen the code. Say:
> "The function receives X as input. I expect it to return Y. Instead it returns Z. I have verified that X is correct because I printed it. The function does A, then B, then C..."

The act of articulating the problem forces you to structure your understanding and almost always reveals the assumption you are making that is wrong.

---

**R086 · After fixing a bug — write down what caused it and what the fix was**
Add a comment above the fix:
```python
# FIX (2026-01-15): Savings rate was returning 0% when savings > income.
# Root cause: was using `integer division` (`//`) instead of `Decimal division`.
# Before: return (savings // income * 100)
# After: return (savings / income * 100).quantize(Decimal("0.01"))
savings_rate = (savings / income * Decimal("100")).quantize(Decimal("0.01"))
```
This prevents future developers (including yourself) from reintroducing the same bug.

---

## 12. Logging Rules

**R087 · Use Python's `logging` module — never `print()` in production code**
```python
# apps/dashboard/services.py
import logging

logger = logging.getLogger(__name__)

def get_monthly_summary(user, month, year):
    logger.info(f"Calculating monthly summary for user={user.id}, month={month}, year={year}")
    try:
        result = _compute_summary(user, month, year)
        logger.debug(f"Summary result for user={user.id}: {result}")
        return result
    except Exception as e:
        logger.error(
            f"Failed to calculate summary for user={user.id}: {e}",
            exc_info=True  # This includes the full traceback in the log
        )
        raise
```

**R088 · Log levels must be used correctly**

| Level | When to use |
|-------|-------------|
| `DEBUG` | Detailed diagnostic info (values, intermediate results). Not shown in production. |
| `INFO` | Confirmation that things are working as expected (user logged in, expense created). |
| `WARNING` | Something unexpected happened but the app can continue (user has no expected income set). |
| `ERROR` | A serious problem occurred — something failed that should not have. |
| `CRITICAL` | The application cannot continue. Reserved for catastrophic failures. |

**R089 · Never log sensitive financial data or personal information**
```python
# ✅ CORRECT — log user ID and summary, not raw financial data
logger.info(f"Dashboard calculated for user={user.id}, month={month}")

# ❌ WRONG — never log specific account values or personal data
logger.info(f"User {user.email} has income={income}, savings={savings}")
```

---

## 13. Environment & Config Rules

**R090 · All configuration comes from environment variables — no hardcoded values**
```python
# ✅ CORRECT
import environ
env = environ.Env()

DATABASE_URL   = env('DATABASE_URL')
SECRET_KEY     = env('SECRET_KEY')
ALLOWED_HOSTS  = env.list('ALLOWED_HOSTS')
DEBUG          = env.bool('DEBUG', default=False)
```
```typescript
// ✅ CORRECT
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

**R091 · Provide a `.env.example` file with all required keys (no values)**
```bash
# .env.example — commit this, not .env
SECRET_KEY=
DEBUG=
DATABASE_URL=
ALLOWED_HOSTS=
CORS_ALLOWED_ORIGINS=
```

**R092 · Validate that required environment variables are set at startup**
```python
# config/settings/base.py
import environ
env = environ.Env(
    DEBUG=(bool, False)
)
environ.Env.read_env()

# These will raise an exception at startup if the variable is missing
SECRET_KEY   = env('SECRET_KEY')
DATABASE_URL = env('DATABASE_URL')
```
A missing environment variable must cause the app to **fail at startup**, not fail silently mid-request.

---

## 14. Code Review Rules

**R093 · Review your own diff before marking a PR as ready**
Before merging any branch, open the diff and read every changed line. Ask:
- Does every change make sense?
- Are there any debug `print()` or `console.log()` statements left in?
- Are there any `.env` or secret values accidentally included?
- Does every new function have a JSDoc/docstring?
- Does every new API endpoint filter by `request.user`?

**R094 · A PR that breaks existing tests must not be merged**
Run `python manage.py test` (backend) and `npm run test` (frontend) before merging. If tests fail, fix them before merging. Do not merge with the intention of fixing tests later.

**R095 · New features must include tests in the same PR**
A PR that adds the expense form without tests is incomplete. The feature and its tests are committed together. "Add tests later" means tests are never added.

---

## 15. Forbidden Patterns

These patterns must never appear in the codebase. If you see them in existing code, fix them immediately.

```python
# ❌ FORBIDDEN — floats in financial calculations
amount = models.FloatField()
rate = float(savings) / float(income)

# ❌ FORBIDDEN — unfiltered querysets (security issue)
expenses = ExpenseEntry.objects.all()

# ❌ FORBIDDEN — DEBUG=True in production
DEBUG = True  # In production.py

# ❌ FORBIDDEN — hardcoded secrets
SECRET_KEY = "my-secret-key-123"
DATABASE_URL = "postgresql://user:password@localhost/db"

# ❌ FORBIDDEN — print() in production code (use logging)
print(f"User income: {income}")

# ❌ FORBIDDEN — bare except (swallows all errors silently)
try:
    calculate_summary()
except:
    pass
```

```typescript
// ❌ FORBIDDEN — any type
const data: any = await fetchExpenses();

// ❌ FORBIDDEN — array index as React key
expenses.map((e, i) => <ExpenseCard key={i} {...e} />)

// ❌ FORBIDDEN — localStorage for JWT tokens
localStorage.setItem('access_token', token);

// ❌ FORBIDDEN — inline API call in component body
function Dashboard() {
  const data = await fetch('/api/v1/dashboard').then(r => r.json());
}

// ❌ FORBIDDEN — financial calculation in the frontend
const savingsRate = (savings / income) * 100;

// ❌ FORBIDDEN — hardcoded dropdown options in JSX
<select>
  <option value="food">Food</option>      // Should come from CONSTANTS
  <option value="transport">Transport</option>
</select>
```

---

## Quick Reference Card

| # | Rule Summary | Severity |
|---|-------------|---------|
| R001 | TypeScript strict mode everywhere | 🔴 Required |
| R018 | UUID primary keys on all models | 🔴 Required |
| R019 | DecimalField for all money — never FloatField | 🔴 Required |
| R026 | Always filter queries by `request.user` | 🔴 Security |
| R046 | All calculations in Django backend only | 🔴 Required |
| R049 | Python `Decimal` for all financial math | 🔴 Required |
| R050 | Handle division by zero on every ratio | 🔴 Required |
| R052 | JWT: 15-min access, 7-day refresh | 🔴 Security |
| R053 | Tokens in httpOnly cookie, not localStorage | 🔴 Security |
| R056 | DEBUG=False in production | 🔴 Security |
| R012 | Conventional Commits format | 🟡 Enforced |
| R015 | .env files never committed | 🔴 Security |
| R029 | Monetary values as strings in API | 🟡 Enforced |
| R043 | React Hook Form + Zod for all forms | 🟡 Enforced |
| R057 | Dashboard in one API call | 🟡 Performance |
| R058 | DB aggregation, never Python loops | 🟡 Performance |
| R074 | Reproduce bug before changing code | 🔵 Debugging |
| R080 | Print SQL query when ORM results are wrong | 🔵 Debugging |
| R083 | Write failing test first, then fix | 🔵 Debugging |
| R087 | Use `logging`, never `print()` in production | 🟡 Enforced |

---

*Kenya Finance App · Programming Rules v1.0 · May 2026*
*These rules apply to every file, every function, every commit.*
