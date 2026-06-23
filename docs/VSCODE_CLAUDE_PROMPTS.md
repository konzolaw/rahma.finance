# 🇰🇪 Kenya Finance App — VS Code Claude Prompts
> Paste the CONTEXT BLOCK once at the start of every new VS Code chat session.
> Then use the PHASE PROMPTS one at a time to build the app step by step.

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CONTEXT BLOCK — PASTE THIS AT THE START OF EVERY SESSION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
You are a senior full-stack engineer building the Kenya Personal Finance App inside VS Code.

STACK:
- Frontend: Next.js 14 (App Router, TypeScript strict), Tailwind CSS, TanStack React Query, Zustand, React Hook Form + Zod, Recharts, Axios
- Backend: Django 4.2 + Django REST Framework + SimpleJWT
- Database: PostgreSQL (Supabase)
- PWA: next-pwa (installable on Android home screen)

ABSOLUTE RULES — NEVER BREAK THESE:
1. All money uses Python Decimal / Django DecimalField(max_digits=12, decimal_places=2) — NEVER FloatField or float arithmetic
2. All API monetary values are returned as strings (COERCE_DECIMAL_TO_STRING = True)
3. ALL financial calculations happen in Django services.py — the frontend ONLY displays
4. Every Django queryset MUST filter by request.user — NEVER .objects.all()
5. JWT access tokens stored in Zustand memory only — refresh tokens in httpOnly cookies — NEVER localStorage
6. All primary keys are UUIDs — never integers
7. TypeScript strict mode — no `any` types
8. Currency is always Ksh — never $ or £
9. "Current month" = calendar month boundaries (1st to last day) — never rolling 30 days
10. Financial ratios use user.expected_monthly_income as denominator — not actual income (exception: Surplus/Deficit uses actual income)

THE 8 EXPENSE CATEGORIES (FIXED — DO NOT CHANGE OR RENAME):
food | transport | housing | personal_care | entertainment | insurance | loans_debt | additional

SUBCATEGORIES (FIXED):
- food: Groceries, Dining Out, Snacks, Meal Prep, Fast Food, Coffee, Extra 1, Extra 2
- transport: Matatu, Fuel, Uber / Bolt, Parking, Car Maintenance, Motorcycle Transport (boda boda), Travel
- housing: Rent, Electricity (Kenya Power), Water, Internet, Repairs & Maintenance, Furniture & Home Items, Cleaning Supplies
- personal_care: Haircuts, Gym Membership, Toiletries, Skincare, Barber, Clothing & Shoes, Laundry
- entertainment: Netflix, Spotify, Outings, Vacations & Holidays, Gaming, Movies & Cinema, Events & Concerts
- insurance: NHIF / SHA, Medical Insurance (private), Car Insurance, Life Insurance
- loans_debt: HELB, Fuliza, M-Shwari, Bank Loan, Credit Card, Mobile Loan (KCB M-Pesa / Tala / Branch), Extra Loan 1, Extra Loan 2
- additional: Airtime / Data Bundles, Family Support, Donations & Church / Tithe, Education, Business Expenses, Medical Emergencies, Miscellaneous

PAYMENT METHODS: Cash, M-Pesa, Debit Card, Credit Card, Bank Transfer
INCOME SOURCES: Salary, Freelance, Side Hustles, Trading, Business, Dividends, Online Work
INVESTMENT TYPES: SACCO, MMF, Chama, CHUMZ, Emergency Fund, Stocks, T-Bills, T-Bonds, Crypto

FINANCIAL RATIO THRESHOLDS (FIXED):
- Savings Rate:      Green ≥ 20%   | Yellow 10–19%  | Red < 10%
- Expense Ratio:     Green < 80%   | Yellow 80–90%  | Red > 90%
- Housing Ratio:     Green ≤ 30%   | Yellow 30–40%  | Red > 40%
- Debt-to-Income:    Green ≤ 20%   | Yellow 20–35%  | Red > 35%
- Food Cost Ratio:   Green ≤ 20%   | Yellow 20–30%  | Red > 30%
- Budget status:     On Track < 90% used | Near Limit 90–100% | Over Budget > 100%

DESIGN: Dark navy (#1B2A4A) + teal (#0E6655) + emerald (#1E8449). Premium fintech feel like Revolut/Monzo. Mobile-first. Font: Inter + JetBrains Mono for amounts.

FORMAT RULES:
- Write complete, working files — no skeletons, no "add logic here" placeholders
- Every function has a JSDoc (frontend) or docstring (backend)
- After each file, tell me the exact next step
- If something in my request is ambiguous, ask ONE specific question before writing code
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 1 — DJANGO PROJECT SETUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Prompt 1.1 — Project Scaffold & Requirements
```
We are starting Phase 1: Django backend setup.

Create the following for me:

1. The complete folder structure for the Django project. The project is called `backend/`. It has a `config/` folder (settings, URLs, WSGI) and an `apps/` folder with these Django apps: users, income, expenses, savings, budgets, dashboard, insights. Show me the full tree.

2. `backend/requirements.txt` with exact packages:
   django>=4.2
   djangorestframework
   djangorestframework-simplejwt
   django-cors-headers
   django-environ
   psycopg2-binary
   gunicorn
   whitenoise
   factory-boy (for tests)

3. `backend/config/settings/base.py` — shared settings including:
   - django-environ setup
   - INSTALLED_APPS with all our apps and DRF
   - REST_FRAMEWORK config (JWT auth, IsAuthenticated default, COERCE_DECIMAL_TO_STRING=True, PageNumberPagination with page_size=50)
   - SIMPLE_JWT config (ACCESS_TOKEN_LIFETIME=15min, REFRESH_TOKEN_LIFETIME=7days, ROTATE_REFRESH_TOKENS=True, BLACKLIST_AFTER_ROTATION=True)
   - CORS headers config (read CORS_ALLOWED_ORIGINS from env)
   - AUTH_USER_MODEL = 'users.User'

4. `backend/config/settings/development.py` — imports base, sets DEBUG=True, uses SQLite for local dev

5. `backend/config/settings/production.py` — imports base, DEBUG=False, reads DATABASE_URL from env, adds WhiteNoise, sets security headers (SECURE_SSL_REDIRECT, SECURE_HSTS_SECONDS, SESSION_COOKIE_SECURE, CSRF_COOKIE_SECURE)

6. `backend/.env.example` with all required keys

Write every file in full. After finishing, tell me exactly what to run to initialize the project.
```

---

## Prompt 1.2 — Custom User Model
```
Create the custom User model for the Kenya Finance App.

File: `backend/apps/users/models.py`

The User model must:
- Extend AbstractBaseUser and PermissionsMixin
- Use email as the login field (not username)
- Have these fields:
  - id: UUIDField (primary_key=True, default=uuid.uuid4, editable=False)
  - email: EmailField (unique=True)
  - display_name: CharField
  - expected_monthly_income: DecimalField(max_digits=12, decimal_places=2, null=True, blank=True) — used in ALL ratio calculations
  - partner_user_id: UUIDField (null=True, blank=True) — links to another user for shared household view
  - is_active: BooleanField (default=True)
  - is_staff: BooleanField (default=False)
  - created_at: DateTimeField (auto_now_add=True)
  - updated_at: DateTimeField (auto_now=True)
- Have a proper UserManager with create_user() and create_superuser()
- Have a __str__ that returns email

Also create:
- `backend/apps/users/admin.py` — register the User model in Django admin
- `backend/apps/users/apps.py` — AppConfig

After this, tell me to run makemigrations and what to check.
```

---

## Prompt 1.3 — All Financial Models
```
Create the remaining 4 Django models for the Kenya Finance App.

File: `backend/apps/expenses/models.py`

ExpenseEntry model:
- id: UUID PK
- user: ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, db_index=True)
- category: CharField(max_length=50, db_index=True) — must be one of: food, transport, housing, personal_care, entertainment, insurance, loans_debt, additional
- subcategory: CharField(max_length=100)
- date: DateField(db_index=True)
- day_of_week: CharField(max_length=3, editable=False) — auto-computed in save() as self.date.strftime("%a")
- description: CharField(max_length=200)
- amount: DecimalField(max_digits=12, decimal_places=2)
- payment_method: CharField(max_length=50) — one of: Cash, M-Pesa, Debit Card, Credit Card, Bank Transfer
- notes: TextField(blank=True)
- created_at / updated_at: auto timestamps
- Override save() to auto-compute day_of_week from date
- __str__ returns f"{self.category} - Ksh {self.amount} on {self.date.strftime('%d/%m/%Y')}"

File: `backend/apps/income/models.py`

IncomeEntry model:
- id: UUID PK
- user: FK to User
- date: DateField(db_index=True)
- day_of_week: CharField (auto-computed in save())
- income_source: CharField — one of: Salary, Freelance, Side Hustles, Trading, Business, Dividends, Online Work
- description: CharField(max_length=200)
- expected_amount: DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
- actual_amount: DecimalField(max_digits=12, decimal_places=2)
- payment_method: CharField — one of: M-Pesa, Bank Transfer, Cash
- notes: TextField(blank=True)
- created_at / updated_at
- __str__ returns f"{self.income_source} - Ksh {self.actual_amount} on {self.date.strftime('%d/%m/%Y')}"

File: `backend/apps/savings/models.py`

SavingsEntry model:
- id: UUID PK
- user: FK to User
- date: DateField
- investment_type: CharField — one of: SACCO, MMF, Chama, CHUMZ, Emergency Fund, Stocks, T-Bills, T-Bonds, Crypto
- institution: CharField(max_length=100)
- amount_contributed: DecimalField(max_digits=12, decimal_places=2)
- current_value: DecimalField(max_digits=12, decimal_places=2)
- goal_target: DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
- notes: TextField(blank=True)
- created_at / updated_at
- __str__ returns f"{self.investment_type} at {self.institution} - Ksh {self.current_value}"

File: `backend/apps/budgets/models.py`

CategoryBudget model:
- id: UUID PK
- user: FK to User (unique_together with category_name so one budget per category per user)
- category_name: CharField(max_length=50) — one of 9: food, transport, housing, personal_care, entertainment, insurance, loans_debt, savings, additional
- monthly_budget_ksh: DecimalField(max_digits=12, decimal_places=2)
- priority: CharField — one of: essential, important, optional, variable
- notes: TextField(blank=True)
- created_at / updated_at

Add `unique_together = [['user', 'category_name']]` to CategoryBudget Meta.

Write all 4 files in full. Then create migrations for all apps.
```

---

## Prompt 1.4 — Authentication API
```
Build the full authentication API for the Kenya Finance App.

Files to create:

1. `backend/apps/users/serializers.py`
   - RegisterSerializer: validates email (unique), display_name, password (min 8 chars, at least 1 letter and 1 number), password_confirm (must match). Creates user with create_user().
   - LoginSerializer: email + password fields
   - UserProfileSerializer: id, email, display_name, expected_monthly_income, created_at (read-only)
   - UpdateProfileSerializer: display_name, expected_monthly_income (both optional)

2. `backend/apps/users/views.py`
   - RegisterView (APIView, AllowAny): POST — creates user, returns tokens + user profile
   - LoginView (APIView, AllowAny): POST — validates credentials, returns access token in response body + refresh token as httpOnly cookie
   - TokenRefreshView (APIView, AllowAny): POST — reads refresh token from httpOnly cookie, returns new access token
   - LogoutView (APIView, IsAuthenticated): POST — clears the httpOnly refresh token cookie
   - MeView (APIView, IsAuthenticated): GET returns profile, PATCH updates profile

3. `backend/apps/users/urls.py`
   - POST /auth/register/
   - POST /auth/login/
   - POST /auth/token/refresh/
   - POST /auth/logout/
   - GET+PATCH /auth/me/

4. `backend/config/urls.py`
   - Include users.urls under /api/v1/auth/

The httpOnly cookie setup for refresh token:
```python
response.set_cookie(
    key='refresh_token',
    value=refresh_token,
    httponly=True,
    secure=True,         # HTTPS only in production
    samesite='Strict',
    max_age=7 * 24 * 60 * 60  # 7 days
)
```

All views must return the standard response envelope: {"data": {...}, "message": "ok"} or {"error": "...", "code": "..."}.

Write all 4 files in full.
```

---

## Prompt 1.5 — Expense & Income CRUD APIs
```
Build the CRUD APIs for expenses and income.

FILES TO CREATE:

1. `backend/apps/expenses/serializers.py`
   - ExpenseEntrySerializer: all fields, with validate_amount (must be > 0), validate_category (must be in the 8 valid categories), validate_subcategory. Make day_of_week and user read-only.

2. `backend/apps/expenses/views.py`
   - ExpenseEntryViewSet (ModelViewSet, IsAuthenticated):
     - get_queryset: filter by request.user, support ?category=, ?month=, ?year=, ?subcategory=, ?payment_method= query params
     - perform_create: set user = request.user
     - Add a custom action: @action(detail=False, methods=['get']) summary() — returns per-category totals vs budget for the given ?month= and ?year=
   - The summary action calls `get_expense_summary(user, month, year)` from services.py (create a stub for now)

3. `backend/apps/expenses/urls.py` — router for the ViewSet + summary endpoint

4. `backend/apps/income/serializers.py`
   - IncomeEntrySerializer: all fields, validate_actual_amount (> 0), validate_income_source. day_of_week and user read-only.

5. `backend/apps/income/views.py`
   - IncomeEntryViewSet (ModelViewSet):
     - get_queryset: filter by user, support ?month=, ?year=, ?source=
     - perform_create: set user = request.user
     - Custom action: summary() — returns total actual income, total expected income, count for ?month=?year=

6. `backend/apps/income/urls.py`

7. Update `backend/config/urls.py` to include both under /api/v1/

Use pagination (page_size=50 from settings). Write every file in full.
```

---

## Prompt 1.6 — Savings & Budgets CRUD APIs
```
Build the CRUD APIs for savings and budget settings.

FILES TO CREATE:

1. `backend/apps/savings/serializers.py`
   - SavingsEntrySerializer: all fields, validate_amount_contributed (> 0), validate_current_value (>= 0), validate_investment_type

2. `backend/apps/savings/views.py`
   - SavingsEntryViewSet (ModelViewSet):
     - get_queryset: filter by request.user, support ?type=, ?month=, ?year=
     - perform_create: set user = request.user
     - Custom action: summary() — total portfolio value (sum of current_value), total contributed (sum of amount_contributed), profit/loss, breakdown by investment_type

3. `backend/apps/savings/urls.py`

4. `backend/apps/budgets/serializers.py`
   - CategoryBudgetSerializer: all fields, validate_monthly_budget_ksh (> 0), validate_category_name (must be in the 9 valid categories)

5. `backend/apps/budgets/views.py`
   - CategoryBudgetViewSet:
     - get_queryset: filter by request.user
     - perform_create: set user = request.user
     - On first login, if a user has no budgets, seed them with default values:
       food=15000, transport=8000, housing=25000, personal_care=5000, entertainment=4000, insurance=3000, loans_debt=10000, savings=10000, additional=5000
     - Allow PATCH /budgets/{category_name}/ to update a specific category

6. `backend/apps/budgets/urls.py`

7. Update `backend/config/urls.py`

Write every file in full.
```

---

## Prompt 1.7 — Dashboard & Insights Calculation Engine
```
This is the most important backend file. Build the full calculation engine.

FILE 1: `backend/apps/dashboard/services.py`

Create these functions (all using Python Decimal arithmetic, all handling ZeroDivisionError):

```python
def get_month_range(month: int, year: int) -> tuple[date, date]:
    """Returns first and last day of the given calendar month."""

def get_monthly_income_total(user, month: int, year: int) -> Decimal:
    """SUM of actual_amount in IncomeEntry for the given calendar month."""

def get_monthly_expense_total(user, month: int, year: int) -> Decimal:
    """SUM of amount in ExpenseEntry for the given calendar month (all categories)."""

def get_monthly_expense_by_category(user, month: int, year: int) -> dict:
    """Returns dict of {category: total_amount} for each of the 8 categories."""

def get_monthly_savings_total(user, month: int, year: int) -> Decimal:
    """SUM of amount_contributed in SavingsEntry for the given calendar month."""

def get_total_portfolio_value(user) -> Decimal:
    """SUM of current_value across ALL SavingsEntry records for the user (all time)."""

def calculate_savings_rate(savings: Decimal, expected_income: Decimal) -> Decimal:
    """savings / expected_income * 100. Returns 0.00 if income is 0."""

def calculate_expense_ratio(expenses: Decimal, expected_income: Decimal) -> Decimal:
    """expenses / expected_income * 100. Returns 0.00 if income is 0."""

def calculate_housing_ratio(housing: Decimal, expected_income: Decimal) -> Decimal:
def calculate_food_ratio(food: Decimal, expected_income: Decimal) -> Decimal:
def calculate_dti(debt_payments: Decimal, expected_income: Decimal) -> Decimal:

def get_ratio_status(ratio: Decimal, green_threshold: Decimal, yellow_threshold: Decimal, higher_is_worse: bool = True) -> str:
    """Returns 'green', 'yellow', or 'red' based on thresholds."""

def get_budget_vs_actual(user, month: int, year: int) -> list[dict]:
    """Returns list of {category, budget, actual, difference, percent_used, status} for all categories."""

def get_emergency_fund_status(user, monthly_expenses: Decimal) -> dict:
    """Returns {available, months_covered, target_6_months, status: 'Fully Funded'|'Half Way'|'Keep Building'}"""

def get_full_dashboard(user, month: int, year: int) -> dict:
    """Aggregates ALL dashboard data into one dict for the /dashboard/ endpoint."""
```

FILE 2: `backend/apps/dashboard/views.py`
- DashboardView: GET /dashboard/?month=&year= — calls get_full_dashboard(), returns full result
- BudgetVsActualView: GET /dashboard/budget-vs-actual/?month=&year= — calls get_budget_vs_actual()

FILE 3: `backend/apps/insights/services.py`
- get_financial_insights(user, month, year) — returns all 6 ratios with value, status, benchmark, and a short tip string for each

FILE 4: `backend/apps/insights/views.py`
- InsightsView: GET /insights/
- TrendsView: GET /insights/trends/ — last 12 months of income vs expenses as a list of {month, year, income, expenses, savings_rate}

FILE 5: `backend/apps/dashboard/urls.py` and `backend/apps/insights/urls.py`

Write every function with full implementation (no stubs). Write every file in full.
```

---

## Prompt 1.8 — Backend Tests
```
Write unit tests for all financial calculation functions.

FILE: `backend/apps/dashboard/tests/test_services.py`

Write TestCase classes for every function in dashboard/services.py. For each function, test:

calculate_savings_rate:
- Normal case: savings=10000, income=50000 → 20.00
- Zero income → 0.00
- Savings > income (e.g. 60000/50000) → 120.00
- Very small savings (100/50000) → 0.20

calculate_expense_ratio:
- Normal: 40000/50000 → 80.00
- Zero income → 0.00
- Over 100%: 55000/50000 → 110.00

get_ratio_status:
- Test all three outcomes (green, yellow, red) for each threshold type

get_budget_vs_actual:
- Create a user with budget settings and expenses, verify status is correct for each bucket
- Test On Track (< 90%), Near Limit (90-100%), Over Budget (> 100%)

get_emergency_fund_status:
- Test Fully Funded (6+ months), Half Way (3–5 months), Keep Building (< 3 months)
- Test zero monthly expenses edge case

get_full_dashboard:
- Create a user with income, expenses, and savings for a specific month
- Verify all returned values are correct

Use factory_boy for creating test data. Create `backend/apps/dashboard/tests/factories.py` with UserFactory, ExpenseEntryFactory, IncomeEntryFactory, SavingsEntryFactory, CategoryBudgetFactory.

Write every test and every factory in full.
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 2 — NEXT.JS PROJECT SETUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Prompt 2.1 — Project Scaffold
```
We are starting Phase 2: Next.js frontend setup.

Create the following:

1. Show me the exact `npx create-next-app@latest` command to run with these flags:
   - TypeScript: yes
   - ESLint: yes
   - Tailwind CSS: yes
   - App Router: yes
   - src/ directory: yes
   - Import alias: @/*

2. After scaffolding, list all additional packages to install:
   npm install @tanstack/react-query zustand axios react-hook-form zod @hookform/resolvers recharts next-pwa
   npm install -D @tanstack/react-query-devtools vitest @testing-library/react @testing-library/user-event jsdom

3. `frontend/tsconfig.json` — ensure "strict": true and all strict checks are on

4. `frontend/next.config.js` — configure next-pwa:
   - dest: 'public'
   - disable in development
   - runtimeCaching for API calls

5. `frontend/public/manifest.json` — complete PWA manifest with:
   - name: "Kenya Finance"
   - short_name: "KeshoKwako"
   - start_url: "/dashboard"
   - display: "standalone"
   - background_color and theme_color: "#1B2A4A"
   - All icon sizes: 72, 96, 128, 144, 152, 192, 384, 512

6. `frontend/src/lib/constants.ts` — ALL dropdown constants:
   EXPENSE_CATEGORIES, SUBCATEGORIES_BY_CATEGORY, PAYMENT_METHODS, INCOME_SOURCES, INVESTMENT_TYPES, DEFAULT_BUDGETS (all 9 with default Ksh values and priority)

7. `frontend/src/types/index.ts` — ALL TypeScript interfaces:
   User, ExpenseEntry, ExpenseCategory, PaymentMethod, IncomeEntry, IncomeSource, SavingsEntry, InvestmentType, CategoryBudget, DashboardData, FinancialRatio, BudgetVsActual, InsightsData

8. `frontend/src/lib/formatters.ts`:
   - formatKsh(amount): "Ksh 15,000" (handles null, undefined, negative)
   - formatDate(dateStr): DD/MM/YYYY format
   - formatPercent(value): "47.3%"
   - formatDayOfWeek(dateStr): "Mon", "Tue" etc.

Write every file in full.
```

---

## Prompt 2.2 — API Client & Auth Store
```
Build the API layer and authentication state.

FILE 1: `frontend/src/lib/api/client.ts`
Single Axios instance:
- baseURL from process.env.NEXT_PUBLIC_API_URL
- Request interceptor: attach access token from Zustand auth store as "Authorization: Bearer {token}"
- Response interceptor: on 401, call refreshAccessToken(), retry original request, if refresh fails redirect to /login

FILE 2: `frontend/src/lib/api/auth.ts`
Functions:
- register(payload): POST /auth/register/
- login(email, password): POST /auth/login/
- refreshAccessToken(): POST /auth/token/refresh/
- logout(): POST /auth/logout/
- getMe(): GET /auth/me/
- updateMe(payload): PATCH /auth/me/

FILE 3: `frontend/src/lib/api/expenses.ts`
- getExpenses(filters: ExpenseFilters): GET /expenses/
- createExpense(payload): POST /expenses/
- updateExpense(id, payload): PATCH /expenses/{id}/
- deleteExpense(id): DELETE /expenses/{id}/
- getExpenseSummary(month, year): GET /expenses/summary/

FILE 4: `frontend/src/lib/api/income.ts`
- getIncome(filters), createIncome(payload), updateIncome(id, payload), deleteIncome(id), getIncomeSummary(month, year)

FILE 5: `frontend/src/lib/api/savings.ts`
- getSavings(filters), createSavings(payload), updateSavings(id, payload), deleteSavings(id), getSavingsSummary()

FILE 6: `frontend/src/lib/api/dashboard.ts`
- getDashboard(month, year): GET /dashboard/
- getBudgetVsActual(month, year): GET /dashboard/budget-vs-actual/
- getInsights(month, year): GET /insights/
- getTrends(): GET /insights/trends/
- getBudgets(): GET /budgets/
- updateBudget(category, payload): PATCH /budgets/{category}/

FILE 7: `frontend/src/store/authStore.ts`
Zustand store:
- State: accessToken (string | null), user (User | null), isAuthenticated (boolean)
- Actions: setAccessToken(token), setUser(user), logout() (clears token + user)

FILE 8: `frontend/src/hooks/useAuth.ts`
Custom hook: login(), register(), logout(), refreshToken()

Write every file in full. Every API function must have a JSDoc comment.
```

---

## Prompt 2.3 — App Layout & Route Structure
```
Build the app layout and route structure using Next.js App Router.

FOLDER STRUCTURE to create:
frontend/src/app/
  layout.tsx              — root layout (QueryClientProvider, fonts)
  (auth)/
    layout.tsx            — auth layout (centered card, no nav)
    login/page.tsx
    register/page.tsx
    forgot-password/page.tsx
  (app)/
    layout.tsx            — app layout (bottom nav + header)
    dashboard/page.tsx
    income/page.tsx
    expenses/[category]/page.tsx
    savings/page.tsx
    budget/page.tsx
    insights/page.tsx
    settings/page.tsx
    profile/page.tsx
  middleware.ts           — protect all (app) routes, redirect to login if no token

FILES TO CREATE:

1. `frontend/src/app/layout.tsx` — Root layout:
   - Loads Inter + JetBrains Mono from Google Fonts
   - Wraps in QueryClientProvider
   - Adds ReactQueryDevtools (development only)
   - Sets metadata: title "Kenya Finance", themeColor "#1B2A4A"
   - Links to manifest.json

2. `frontend/src/app/(auth)/layout.tsx` — Centered auth card layout, navy background

3. `frontend/src/app/(app)/layout.tsx` — App layout:
   - Fixed bottom navigation bar with 5 tabs: Dashboard, Add (large + button), Savings, Budget, More
   - Top header with page title + user avatar
   - Protected: redirects to /login if not authenticated

4. `frontend/src/middleware.ts`:
   - Protect all routes under /(app)/*
   - If no access token cookie or Zustand token, redirect to /login
   - If authenticated and on /login or /register, redirect to /dashboard

5. `frontend/src/components/layout/BottomNav.tsx`:
   - 5 tabs: Dashboard (home icon), Add Expense (large navy circle with + icon, slightly raised), Savings (chart icon), Budget (pie icon), More (menu icon)
   - Active tab highlighted in teal
   - All touch targets minimum 44×44px
   - Fixed to bottom, white background, subtle top border

6. `frontend/src/components/layout/AppHeader.tsx`:
   - Shows current page title
   - Shows user display_name greeting on dashboard
   - Shows month selector on expense/income screens

Write every file in full with real Tailwind classes. The design must look premium — dark navy, clean, no default browser styles.
```

---

## Prompt 2.4 — Dashboard Screen
```
Build the full Dashboard screen.

FILE 1: `frontend/src/hooks/useDashboard.ts`
- useMonthlyDashboard(month, year): wraps getDashboard() in useQuery, staleTime 5 minutes
- useBudgetVsActual(month, year): wraps getBudgetVsActual() in useQuery

FILE 2: `frontend/src/components/dashboard/SummaryCard.tsx`
Props: title, value (Ksh), icon, trend (optional), colorScheme ('income' | 'expense' | 'savings' | 'portfolio')
- Navy card with teal/green/red accent
- Large formatted Ksh amount in JetBrains Mono
- Icon in colored circle
- Subtle trend indicator if provided

FILE 3: `frontend/src/components/dashboard/HealthIndicator.tsx`
Props: label, value (%), status ('green' | 'yellow' | 'red'), benchmark
- Shows ratio name, value, and a colored status bar
- Green = teal, Yellow = amber, Red = red
- Shows benchmark text: "Target: ≤ 30%"

FILE 4: `frontend/src/components/dashboard/BudgetGauge.tsx`
Props: category, budget, actual, percentUsed, status
- Category name with colored icon
- Progress bar (teal if on track, amber if near limit, red if over)
- Shows "Ksh X,XXX / Ksh X,XXX" and status label with emoji (✅ / ⚡ / ⚠️)

FILE 5: `frontend/src/components/dashboard/SpendingChart.tsx`
- Recharts PieChart showing expense breakdown by category
- Each category gets a distinct color from the design palette
- Legend below chart with category names and Ksh amounts

FILE 6: `frontend/src/components/dashboard/DashboardSkeleton.tsx`
- Skeleton loading state: 4 placeholder cards, 6 placeholder health indicators, placeholder chart
- Use Tailwind animate-pulse on grey boxes

FILE 7: `frontend/src/app/(app)/dashboard/page.tsx`
The full dashboard page:
- Month/year selector at top (defaults to current month)
- 4 summary cards: Total Income, Total Expenses, Remaining Balance, Savings Rate
- 5 health indicator rows (all 5 ratios)
- Budget vs Actual table (all 8 categories + savings)
- Spending breakdown pie chart
- Shows DashboardSkeleton while loading
- Shows error state if API fails

Write every file in full with real Tailwind classes. The dashboard must look premium.
```

---

## Prompt 2.5 — Add Transaction Screen
```
Build the Add Transaction screen — the most-used screen in the app.

This screen is the quick entry point. User taps the + button in the bottom nav, picks a category, fills the form, saves. Must be completable in under 30 seconds.

FILE 1: `frontend/src/lib/validators.ts`
Zod schemas:
- expenseFormSchema: category (enum), subcategory (min 1), description (min 1, max 200), amount (string, must parse to > 0), payment_method (enum), date (YYYY-MM-DD, defaults to today), notes (optional, max 500)
- incomeFormSchema: income_source (enum), description (min 1), actual_amount (> 0), expected_amount (optional), payment_method (enum), date, notes

FILE 2: `frontend/src/components/forms/CategoryPicker.tsx`
- Full-screen category selector shown first
- 8 expense categories + Income as a 9th option
- Each displayed as a large tappable card with icon and category name
- Color-coded: food=green, transport=orange, housing=blue, personal_care=purple, entertainment=gold, insurance=navy, loans_debt=red, additional=teal, income=emerald
- Grid layout 3 columns on mobile

FILE 3: `frontend/src/components/forms/ExpenseForm.tsx`
After category is picked, shows the expense entry form:
- description: text input (autofocused)
- subcategory: dropdown (dynamically populated from SUBCATEGORIES_BY_CATEGORY[category])
- amount: large numeric input with Ksh prefix, inputMode="decimal"
- payment_method: horizontal pill selector (Cash, M-Pesa, Debit Card, Credit Card, Bank Transfer)
- date: date input defaulting to today
- notes: expandable text area (hidden by default, user taps "Add note" to reveal)
- Save button: full width, navy, disabled while submitting
- Uses React Hook Form + Zod
- On success: reset form, show toast "Expense saved ✅", invalidate expenses + dashboard queries

FILE 4: `frontend/src/components/forms/IncomeForm.tsx`
Similar to ExpenseForm but for income:
- income_source: dropdown
- description: text input
- actual_amount: numeric input
- expected_amount: optional numeric input
- payment_method: pill selector
- date: date input

FILE 5: `frontend/src/app/(app)/add/page.tsx`
- Shows CategoryPicker first
- When category selected (including income), slides in the relevant form
- Smooth transition between picker and form
- Back arrow returns to category picker

Write every file in full. The form must feel fast and clean — this is the most important UX in the app.
```

---

## Prompt 2.6 — Expense Category Screens
```
Build the reusable expense category screen and apply it to all 8 categories.

FILE 1: `frontend/src/hooks/useExpenses.ts`
- useExpenses(filters): wraps getExpenses() in useQuery, staleTime 1 minute
- useExpenseSummary(month, year): wraps getExpenseSummary()
- useCreateExpense(): useMutation with optimistic update + cache invalidation
- useDeleteExpense(): useMutation with confirmation + cache invalidation

FILE 2: `frontend/src/components/expenses/ExpenseRow.tsx`
Props: expense (ExpenseEntry)
- Shows: day+date, description, subcategory badge, payment method icon, amount in bold
- Swipe left to reveal delete button (or long press on mobile)
- Tap to open edit sheet
- Amount in red-tinted text (it's spending)

FILE 3: `frontend/src/components/expenses/ExpenseSummaryBanner.tsx`
Props: total, budget, percentUsed, status
- Shows this month's total vs budget
- Colored progress bar
- Status label with emoji

FILE 4: `frontend/src/components/expenses/ExpenseListSkeleton.tsx`
- Skeleton rows for loading state

FILE 5: `frontend/src/app/(app)/expenses/[category]/page.tsx`
Dynamic route page that works for ALL 8 expense categories:
- Reads [category] from params
- Validates it's one of the 8 valid categories
- Shows category name + icon in header (with correct category color)
- Month selector
- ExpenseSummaryBanner at top
- Filterable list of ExpenseRow items (filter by subcategory, payment method)
- Search bar (filters by description)
- Empty state if no entries: icon + "No [category] expenses this month" + "Add your first expense" button
- FAB (floating action button) to add new expense in this category
- Skeleton while loading

FILE 6: `frontend/src/components/expenses/EditExpenseSheet.tsx`
- Bottom sheet that slides up when user taps an ExpenseRow
- Pre-filled form with current expense data
- Save and Delete buttons
- Uses same Zod schema as ExpenseForm

Write every file in full.
```

---

## Prompt 2.7 — Savings, Budget Planner & Insights Screens
```
Build the remaining three main screens.

--- SAVINGS SCREEN ---

FILE 1: `frontend/src/hooks/useSavings.ts`
- useSavings(filters), useCreateSavings(), useUpdateSavings(), useDeleteSavings(), useSavingsSummary()

FILE 2: `frontend/src/components/savings/PortfolioSummary.tsx`
- Total portfolio value (large Ksh amount)
- Total contributed vs current value
- Overall profit/loss in green/red
- Breakdown by investment type as a horizontal bar

FILE 3: `frontend/src/components/savings/SavingsRow.tsx`
- Institution name + investment type badge
- Amount contributed + current value
- Goal progress bar if goal_target is set
- Profit/loss indicator

FILE 4: `frontend/src/app/(app)/savings/page.tsx`
- PortfolioSummary at top
- List of SavingsRow items grouped by investment_type
- FAB to add new savings entry

--- BUDGET PLANNER SCREEN ---

FILE 5: `frontend/src/app/(app)/budget/page.tsx`
- Full-page table showing all 9 categories
- Each row: category name, monthly budget (editable inline), actual spent this month, remaining, status badge
- Tap a budget amount to edit it inline
- Total row at bottom
- Current month auto-selected

--- INSIGHTS SCREEN ---

FILE 6: `frontend/src/components/insights/RatioCard.tsx`
Props: label, value, status, benchmark, tip
- Shows ratio name, large percentage value, colored status badge
- Progress bar from 0 to 100 (or 0 to 200 for over-limit)
- Benchmark target text
- Collapsible tip in teal callout box

FILE 7: `frontend/src/components/insights/EmergencyFundCard.tsx`
- Shows months covered (large number)
- Progress bar toward 6-month target
- Status: Fully Funded ✅ / Half Way 🔧 / Keep Building 🚧

FILE 8: `frontend/src/components/insights/TrendChart.tsx`
- Recharts LineChart
- Last 12 months of income (green line) vs expenses (red line)
- X axis: month abbreviations
- Y axis: Ksh amounts

FILE 9: `frontend/src/app/(app)/insights/page.tsx`
- 6 RatioCards
- EmergencyFundCard
- TrendChart
- A "Kenya Finance Tips" section with 3 static tips relevant to Kenyan finance

Write every file in full.
```

---

## Prompt 2.8 — Auth Screens & Profile
```
Build the authentication screens and profile screen.

FILE 1: `frontend/src/app/(auth)/login/page.tsx`
- Email + password inputs
- "Login" button (full width, navy)
- "Forgot password?" link
- "Don't have an account? Register" link
- On submit: calls login(), stores access token in Zustand, redirects to /dashboard
- Shows inline validation errors from Zod
- Shows API error (wrong password, account not found) as a red banner above the form
- Skeleton/spinner in button while loading

FILE 2: `frontend/src/app/(auth)/register/page.tsx`
- Display name, email, password, confirm password inputs
- "Create Account" button
- "Already have an account? Login" link
- Zod validation: email format, password min 8 chars with letter+number, passwords match
- On success: auto-login, redirect to /dashboard

FILE 3: `frontend/src/app/(auth)/forgot-password/page.tsx`
- Email input
- "Send Reset Link" button
- On success: show "Check your email for a reset link" message

FILE 4: `frontend/src/app/(app)/profile/page.tsx`
- Shows current user: display_name, email
- Editable: display_name, expected_monthly_income
- "Save Changes" button
- "Logout" button (red, with confirmation dialog: "Are you sure you want to log out?")
- On logout: clear Zustand store, clear httpOnly cookie (POST /auth/logout/), redirect to /login
- Shows "Partner Account" section with option to link a partner user (enter their email)

Write every file in full. Auth screens must look premium — dark navy background, white card, clean form.
```

---

## Prompt 2.9 — PWA Final Setup & Deployment Prep
```
Finalize the PWA setup and prepare for deployment.

FILE 1: `frontend/src/app/(app)/offline/page.tsx`
- Shown when user is offline and tries to navigate
- Navy background, white text, wifi-off icon
- "You're offline. Your last-saved data is available below."
- Link back to dashboard

FILE 2: Update `frontend/next.config.js`
- Configure next-pwa runtime caching:
  - Cache all /api/v1/ GET requests with NetworkFirst strategy (fall back to cache on offline)
  - Cache all static assets with CacheFirst
  - Set fallback to /offline for navigation requests when offline

FILE 3: `frontend/src/components/ui/OfflineBanner.tsx`
- A thin red banner at the top of the screen when navigator.onLine is false
- "⚡ You are offline — showing cached data"
- Disappears automatically when connection is restored
- Uses a useOnlineStatus() hook

FILE 4: `frontend/src/hooks/useOnlineStatus.ts`
- Hook that listens to window 'online' and 'offline' events
- Returns { isOnline: boolean }

FILE 5: `frontend/.env.local.example`
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

FILE 6: `frontend/vercel.json`
- Set headers for PWA: Cache-Control for static assets
- Redirect /api/* to the Django backend URL (if using Vercel rewrites)

FILE 7: Write me the complete README.md for the project root with:
- What the app is (one paragraph)
- Local dev setup instructions for both backend and Django (step by step)
- Environment variables needed
- How to deploy (Vercel + Railway)
- How to test the PWA install on Android

Write every file in full.
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 3 — DEBUGGING & FIXES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## When a calculation is wrong — use this prompt
```
I have a bug in a financial calculation. Here is what's happening:

[DESCRIBE: what value is being shown vs what is expected]
[PASTE: the relevant services.py function]
[PASTE: any test that is failing]

Rules reminder:
- Use Python Decimal arithmetic only
- Calendar month = first to last day of month
- Ratios use expected_monthly_income as denominator (not actual income)
- Division by zero must return Decimal("0.00")

Diagnose the bug, explain the root cause in one sentence, then give me the corrected function. After fixing it, write a unit test that would have caught this bug.
```

---

## When an API returns unexpected data — use this prompt
```
My API endpoint is returning unexpected data. Here is the issue:

Endpoint: [e.g. GET /api/v1/dashboard/]
Expected response: [describe what you expect]
Actual response: [paste the actual JSON response]
Django view: [paste the view code]
Service function: [paste the relevant service code]

Check:
1. Is the queryset filtered by request.user?
2. Is the date range using calendar month boundaries (first to last day)?
3. Is Decimal arithmetic being used (not float)?
4. Is the response envelope correct {"data": {...}, "message": "ok"}?

Find the bug and give me the corrected code.
```

---

## When a React component shows wrong data — use this prompt
```
A React component is showing incorrect data. Here is the issue:

Component: [name]
What it shows: [describe]
What it should show: [describe]
The data from the API (paste console.log of the raw API response):

Check:
1. Is the component calling formatKsh() correctly?
2. Is the component using the pre-computed value from the API (not calculating itself)?
3. Is React Query returning stale data? (try adding console.log in the queryFn)
4. Is the TypeScript interface matching the actual API response shape?

Find the bug and give me the corrected code.
```

---

## When a form is not submitting correctly — use this prompt
```
My form is not submitting correctly. Here is the issue:

Form: [name]
Problem: [describe — validation not triggering / API not called / wrong data sent]

Paste:
- The Zod schema
- The form component
- The mutation hook

Check:
1. Is zodResolver connected to useForm?
2. Is the onSubmit handler wrapped in handleSubmit()?
3. Is the amount field being parsed as a string (not number) before sending to API?
4. Is the mutation calling the correct API function?

Find the bug and give me the corrected code.
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# QUICK CHEAT SHEET — paste these small prompts as needed
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Add a new field to a model
```
Add the field [FIELD_NAME] ([TYPE]) to the [MODEL_NAME] model in [app]/models.py.
Update the serializer in [app]/serializers.py to include it.
Generate the migration.
If it's a required field on an existing table, give it a sensible default.
```

## Add filtering to an endpoint
```
Add filtering to the [endpoint] endpoint.
It should support these query params: [list them].
The filter should be applied in get_queryset() and must still filter by request.user.
Show me the updated view only.
```

## Write a test for a specific function
```
Write a comprehensive unit test for the [FUNCTION_NAME] function in [FILE_PATH].
Test these cases: [list edge cases].
Use factory_boy for test data. Follow the existing test patterns in the project.
```

## Fix a migration conflict
```
I have a migration conflict. Here are the two conflicting migrations:
[paste both]
Explain what each one does, then give me a merged migration that correctly applies both changes.
```

## Improve a component's design
```
The [COMPONENT_NAME] component looks too plain. Improve its design following the project's design system:
- Colors: navy (#1B2A4A), teal (#0E6655), emerald (#1E8449)
- Font: Inter for text, JetBrains Mono for Ksh amounts
- Premium fintech feel like Revolut/Monzo
- Mobile-first, all touch targets min 44×44px
Keep all the existing logic. Only change the JSX and Tailwind classes.
```
