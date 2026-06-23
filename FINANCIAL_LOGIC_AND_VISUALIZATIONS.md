# 🇰🇪 Kenya Finance App — Financial Logic, Calculation Engine & Visualization Spec
> Written from the perspective of a senior financial advisor with 20 years in budget tracking and expenditure flows.
> This document is the single source of truth for ALL financial logic in the app.
> Version 2.0 — May 2026

---

## THE CORE PROBLEM WITH MOST FINANCE APPS

Most apps just add up numbers. That is not financial management — that is a receipt printer.

Real financial management answers three questions every single day:
1. **Where am I right now against my plan?** (Budget tracking)
2. **Where am I headed if I keep going like this?** (Projection)
3. **What do I need to change and by how much?** (Actionable insight)

This logic document builds all three into the app.

---

## PART 1 — THE INCOME MODEL

### Why most income tracking fails

The problem: you receive a salary on the 25th, but your rent is due on the 1st. Your M-Pesa freelance money comes in on random days. If the app only looks at "income this calendar month" it gives you a misleading picture in the first 3 weeks of every month.

### The solution: Three income layers

```
Layer 1 — COMMITTED INCOME
Money you are certain is coming. Salary, fixed retainer, HELB disbursement.
This is your "floor" — the minimum you will earn.

Layer 2 — EXPECTED INCOME  
Money you have invoiced or are owed but not yet received.
This is what you are planning around.

Layer 3 — ACTUAL INCOME
Money that has physically landed in your M-Pesa or bank account.
This is the only number used for ratio calculations.
```

### Django — Income Model Fields (additions to existing model)

```python
class IncomeEntry(models.Model):
    # --- existing fields ---
    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user            = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    date            = models.DateField(db_index=True)
    day_of_week     = models.CharField(max_length=3, editable=False)
    income_source   = models.CharField(max_length=100)
    description     = models.CharField(max_length=200)
    actual_amount   = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method  = models.CharField(max_length=50)
    notes           = models.TextField(blank=True)

    # --- NEW fields for proper income tracking ---
    expected_amount  = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    income_layer     = models.CharField(
        max_length=20,
        choices=[('committed', 'Committed'), ('expected', 'Expected'), ('actual', 'Actual')],
        default='actual'
    )
    is_recurring     = models.BooleanField(default=False)
    recurrence_day   = models.IntegerField(null=True, blank=True)  # Day of month (e.g. 25 for salary)
    variance_amount  = models.DecimalField(  # auto-computed: actual - expected
        max_digits=12, decimal_places=2,
        null=True, blank=True, editable=False
    )
    variance_percent = models.DecimalField(  # auto-computed: variance / expected * 100
        max_digits=6, decimal_places=2,
        null=True, blank=True, editable=False
    )

    def save(self, *args, **kwargs):
        self.day_of_week = self.date.strftime("%a")
        # Auto-compute variance when both amounts are present
        if self.expected_amount and self.actual_amount:
            self.variance_amount = self.actual_amount - self.expected_amount
            self.variance_percent = (self.variance_amount / self.expected_amount * 100).quantize(Decimal("0.01"))
        super().save(*args, **kwargs)
```

### Income Service Functions

```python
# backend/apps/income/services.py

from decimal import Decimal
from django.db.models import Sum, Avg, Count
from .models import IncomeEntry

def get_income_summary(user, month: int, year: int) -> dict:
    """
    Returns a full income picture for the month:
    - committed_income: fixed recurring income expected
    - expected_income: total expected for the month
    - actual_income: total received so far
    - income_achievement_rate: actual / expected * 100
    - variance: actual - expected (positive = overperformed)
    - days_elapsed: how many days into the month
    - income_run_rate: projected income by month end based on pace
    - sources_breakdown: income by source
    """
    from datetime import date
    import calendar

    first_day, last_day = get_month_range(month, year)
    today = date.today()
    days_in_month = calendar.monthrange(year, month)[1]
    days_elapsed = min((today - first_day).days + 1, days_in_month)

    entries = IncomeEntry.objects.filter(
        user=user,
        date__gte=first_day,
        date__lte=last_day
    )

    actual_total = entries.filter(income_layer='actual').aggregate(
        total=Sum('actual_amount'))['total'] or Decimal("0")

    expected_total = entries.aggregate(
        total=Sum('expected_amount'))['total'] or user.expected_monthly_income or Decimal("0")

    # Run rate: if we've earned X in D days, we'll earn X * (days_in_month / D) by month end
    income_run_rate = Decimal("0")
    if days_elapsed > 0:
        daily_rate = actual_total / Decimal(str(days_elapsed))
        income_run_rate = (daily_rate * Decimal(str(days_in_month))).quantize(Decimal("0.01"))

    # Achievement rate
    achievement_rate = Decimal("0")
    if expected_total > 0:
        achievement_rate = (actual_total / expected_total * 100).quantize(Decimal("0.01"))

    # Breakdown by source
    sources = entries.filter(income_layer='actual').values('income_source').annotate(
        total=Sum('actual_amount'),
        count=Count('id')
    ).order_by('-total')

    return {
        "actual_income":          str(actual_total),
        "expected_income":        str(expected_total),
        "income_run_rate":        str(income_run_rate),  # Projected month-end income
        "achievement_rate":       str(achievement_rate),
        "variance":               str(actual_total - expected_total),
        "days_elapsed":           days_elapsed,
        "days_in_month":          days_in_month,
        "sources_breakdown":      list(sources),
        "is_on_track":            actual_total >= (expected_total * Decimal(str(days_elapsed)) / Decimal(str(days_in_month))),
    }
```

---

## PART 2 — THE EXPENSE TRACKING MODEL

### Why most expense tracking is misleading

**Problem 1: Fixed vs variable expenses are treated identically.**
Your rent (Ksh 25,000 — fixed, happens once) and your groceries (Ksh 500 per trip, happens 12 times) look the same in a list. But they behave completely differently.

**Problem 2: The app doesn't know if you have already paid a fixed bill this month.**
If rent is due on the 1st and you track it, the app should know that cost is "settled." It should not warn you about it again.

**Problem 3: Discretionary vs non-discretionary is invisible.**
You cannot cut your rent. You CAN cut dining out. The app treats them identically.

### The solution: Expense classification layer

```python
class ExpenseEntry(models.Model):
    # --- existing fields ---
    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user           = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    category       = models.CharField(max_length=50, db_index=True)
    subcategory    = models.CharField(max_length=100)
    date           = models.DateField(db_index=True)
    day_of_week    = models.CharField(max_length=3, editable=False)
    description    = models.CharField(max_length=200)
    amount         = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    notes          = models.TextField(blank=True)

    # --- NEW fields for proper expense classification ---
    expense_type = models.CharField(
        max_length=20,
        choices=[
            ('fixed',        'Fixed'),         # Same amount every month (rent, Netflix, NHIF)
            ('variable',     'Variable'),       # Changes month to month (groceries, fuel)
            ('one_off',      'One-off'),        # Unexpected / irregular (car repair, medical)
            ('discretionary','Discretionary'),  # Optional / lifestyle (dining out, cinema)
        ],
        default='variable'
    )
    is_recurring    = models.BooleanField(default=False)
    recurrence_day  = models.IntegerField(null=True, blank=True)  # Day of month

    # Running total (auto-computed by service, not stored — see services.py)
    # We DO NOT store running_total in DB — it is always computed fresh

    def save(self, *args, **kwargs):
        self.day_of_week = self.date.strftime("%a")
        super().save(*args, **kwargs)
```

### The 4 Expense Buckets (this is the financial advisor framework)

```
BUCKET 1 — COMMITTED FIXED (Cannot change this month)
Examples: Rent, NHIF, loan repayments, insurance premiums
Logic: These are paid once per month. Once logged, they are "settled."
Budget behavior: Full amount is reserved on Day 1 of the month.

BUCKET 2 — COMMITTED VARIABLE (Must spend, amount varies)
Examples: Groceries, electricity, water, fuel, airtime
Logic: You must spend these, but you have some control over the amount.
Budget behavior: Budget is depleted as you spend throughout the month.

BUCKET 3 — DISCRETIONARY (Optional spending)
Examples: Dining out, cinema, Spotify, new clothes, outings
Logic: You choose to spend these. They are the first to cut when money is tight.
Budget behavior: Any overspend here is a choice, not a necessity.

BUCKET 4 — ONE-OFF (Irregular, unexpected)
Examples: Car repair, medical emergency, school fees top-up
Logic: Not budgeted for. Must be tracked separately so they don't distort monthly averages.
Budget behavior: Shown separately — do not count against category budget averages.
```

### Expense Service Functions

```python
# backend/apps/expenses/services.py

from decimal import Decimal
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth
import calendar
from datetime import date
from .models import ExpenseEntry
from apps.budgets.models import CategoryBudget

def get_month_range(month: int, year: int):
    from datetime import date
    first_day = date(year, month, 1)
    last_day  = date(year, month, calendar.monthrange(year, month)[1])
    return first_day, last_day

def get_expense_summary(user, month: int, year: int) -> dict:
    """
    Full expense picture for the month.
    Returns per-category breakdown with budget, actual, remaining, burn rate, projection.
    """
    first_day, last_day = get_month_range(month, year)
    today = date.today()
    days_in_month = calendar.monthrange(year, month)[1]
    days_elapsed  = min((today - first_day).days + 1, days_in_month)
    percent_month_elapsed = Decimal(str(days_elapsed)) / Decimal(str(days_in_month))

    # All expenses this month
    expenses = ExpenseEntry.objects.filter(
        user=user,
        date__gte=first_day,
        date__lte=last_day
    )

    # Budgets for all categories
    budgets = {b.category_name: b for b in CategoryBudget.objects.filter(user=user)}

    CATEGORIES = ['food','transport','housing','personal_care',
                  'entertainment','insurance','loans_debt','additional']

    summary = []
    total_budgeted = Decimal("0")
    total_actual   = Decimal("0")

    for category in CATEGORIES:
        budget_obj  = budgets.get(category)
        budget_amt  = budget_obj.monthly_budget_ksh if budget_obj else Decimal("0")

        cat_expenses = expenses.filter(category=category)
        actual_amt   = cat_expenses.aggregate(t=Sum('amount'))['t'] or Decimal("0")

        # Exclude one-off expenses from burn rate calculation (they distort averages)
        recurring_actual = cat_expenses.exclude(expense_type='one_off').aggregate(
            t=Sum('amount'))['t'] or Decimal("0")
        one_off_actual   = cat_expenses.filter(expense_type='one_off').aggregate(
            t=Sum('amount'))['t'] or Decimal("0")

        remaining    = budget_amt - actual_amt
        percent_used = Decimal("0")
        if budget_amt > 0:
            percent_used = (actual_amt / budget_amt * 100).quantize(Decimal("0.01"))

        # BURN RATE: how fast are you spending vs how fast the month is passing?
        # If month is 40% elapsed but you've used 70% of budget → burning too fast
        burn_rate = Decimal("0")
        if percent_month_elapsed > 0:
            burn_rate = (percent_used / (percent_month_elapsed * 100) * 100).quantize(Decimal("0.01"))

        # PROJECTED MONTH-END SPEND (based on pace of recurring expenses only)
        projected_spend = Decimal("0")
        if days_elapsed > 0 and percent_month_elapsed > 0:
            daily_recurring_rate = recurring_actual / Decimal(str(days_elapsed))
            projected_spend = (daily_recurring_rate * Decimal(str(days_in_month)) + one_off_actual).quantize(Decimal("0.01"))

        projected_overspend = max(Decimal("0"), projected_spend - budget_amt)

        # STATUS
        if percent_used >= 100:
            status = "over_budget"
            status_label = "⚠️ Over Budget"
        elif percent_used >= 90:
            status = "near_limit"
            status_label = "⚡ Near Limit"
        elif burn_rate > 120:
            status = "burning_fast"       # On track by amount, but spending too fast
            status_label = "🔥 Burning Fast"
        else:
            status = "on_track"
            status_label = "✅ On Track"

        # DAILY BUDGET REMAINING (how much can I spend per day for the rest of the month?)
        days_remaining = max(1, days_in_month - days_elapsed)
        daily_budget_remaining = (max(Decimal("0"), remaining) / Decimal(str(days_remaining))).quantize(Decimal("0.01"))

        total_budgeted += budget_amt
        total_actual   += actual_amt

        summary.append({
            "category":              category,
            "budget":                str(budget_amt),
            "actual":                str(actual_amt),
            "recurring_actual":      str(recurring_actual),
            "one_off_actual":        str(one_off_actual),
            "remaining":             str(remaining),
            "percent_used":          str(percent_used),
            "burn_rate":             str(burn_rate),          # > 100 = spending faster than month
            "projected_month_end":   str(projected_spend),    # Where you'll end up
            "projected_overspend":   str(projected_overspend),
            "daily_budget_remaining":str(daily_budget_remaining),  # How much left per day
            "status":                status,
            "status_label":          status_label,
            "days_remaining":        days_remaining,
            "transaction_count":     cat_expenses.count(),
        })

    # Overall summary
    overall_remaining  = total_budgeted - total_actual
    overall_pct_used   = Decimal("0")
    if total_budgeted > 0:
        overall_pct_used = (total_actual / total_budgeted * 100).quantize(Decimal("0.01"))

    return {
        "categories":          summary,
        "total_budgeted":      str(total_budgeted),
        "total_actual":        str(total_actual),
        "total_remaining":     str(overall_remaining),
        "overall_percent_used":str(overall_pct_used),
        "days_elapsed":        days_elapsed,
        "days_in_month":       days_in_month,
        "days_remaining":      days_in_month - days_elapsed,
        "percent_month_elapsed":str((percent_month_elapsed * 100).quantize(Decimal("0.01"))),
    }


def get_running_total_by_day(user, category: str, month: int, year: int) -> list[dict]:
    """
    Returns cumulative spending by day for a category.
    Used for the spend-pace chart. Shows actual vs ideal (budget / days_in_month * day).
    """
    first_day, last_day = get_month_range(month, year)
    days_in_month = calendar.monthrange(year, month)[1]

    budget = CategoryBudget.objects.filter(user=user, category_name=category).first()
    budget_amt = budget.monthly_budget_ksh if budget else Decimal("0")
    daily_ideal = budget_amt / Decimal(str(days_in_month))

    # Get all expenses for this category grouped by day
    from django.db.models.functions import TruncDate
    daily_expenses = (
        ExpenseEntry.objects
        .filter(user=user, category=category, date__gte=first_day, date__lte=last_day)
        .values('date')
        .annotate(daily_total=Sum('amount'))
        .order_by('date')
    )

    # Build a dict: {date: total}
    daily_map = {e['date']: e['daily_total'] for e in daily_expenses}

    result = []
    running = Decimal("0")
    today = date.today()

    for day_num in range(1, days_in_month + 1):
        d = date(year, month, day_num)
        day_spend = daily_map.get(d, Decimal("0"))
        running += day_spend

        ideal_cumulative = (daily_ideal * Decimal(str(day_num))).quantize(Decimal("0.01"))

        result.append({
            "day":              day_num,
            "date":             d.strftime("%d/%m"),
            "daily_spend":      str(day_spend),
            "cumulative_spend": str(running),
            "ideal_cumulative": str(ideal_cumulative),  # Where you should be
            "is_future":        d > today,
            "is_over_ideal":    running > ideal_cumulative,
        })

    return result


def get_spending_heatmap(user, month: int, year: int) -> list[dict]:
    """
    Returns daily spending totals for a calendar heatmap visualization.
    Each day has: date, total_spend, transaction_count, intensity (0-4 scale).
    """
    first_day, last_day = get_month_range(month, year)

    daily = (
        ExpenseEntry.objects
        .filter(user=user, date__gte=first_day, date__lte=last_day)
        .values('date')
        .annotate(total=Sum('amount'), count=Count('id'))
        .order_by('date')
    )

    daily_map = {e['date']: e for e in daily}
    days_in_month = calendar.monthrange(year, month)[1]

    # Find max daily spend to normalize intensity
    max_spend = max((e['total'] for e in daily), default=Decimal("1"))

    result = []
    for day_num in range(1, days_in_month + 1):
        d = date(year, month, day_num)
        entry = daily_map.get(d)
        total = entry['total'] if entry else Decimal("0")
        count = entry['count'] if entry else 0
        intensity = 0
        if total > 0:
            ratio = float(total / max_spend)
            if ratio < 0.25:   intensity = 1
            elif ratio < 0.50: intensity = 2
            elif ratio < 0.75: intensity = 3
            else:              intensity = 4

        result.append({
            "date":      d.strftime("%Y-%m-%d"),
            "day":       day_num,
            "weekday":   d.strftime("%a"),
            "total":     str(total),
            "count":     count,
            "intensity": intensity,  # 0=none, 1=light, 2=medium, 3=high, 4=very high
        })

    return result


def get_month_over_month_trends(user, num_months: int = 6) -> list[dict]:
    """
    Returns last N months of per-category spending for trend analysis.
    Used for the category trend chart.
    """
    from dateutil.relativedelta import relativedelta
    today = date.today()
    results = []

    for i in range(num_months - 1, -1, -1):
        target = today - relativedelta(months=i)
        m, y = target.month, target.year
        first_day, last_day = get_month_range(m, y)

        by_category = (
            ExpenseEntry.objects
            .filter(user=user, date__gte=first_day, date__lte=last_day)
            .values('category')
            .annotate(total=Sum('amount'))
        )
        cat_map = {e['category']: str(e['total']) for e in by_category}

        total = sum(e['total'] for e in by_category) if by_category else Decimal("0")

        results.append({
            "month":     m,
            "year":      y,
            "label":     target.strftime("%b %Y"),
            "total":     str(total),
            "breakdown": cat_map,
        })

    return results
```

---

## PART 3 — SAVINGS & INVESTMENT TRACKING

### Why most savings tracking is wrong

**Problem 1: Contributions and returns are confused.**
If you put Ksh 5,000 into an MMF in January, and by March it's worth Ksh 5,300, most apps just show Ksh 5,300. They lose the distinction between your contribution (Ksh 5,000) and the return (Ksh 300). You need to know both.

**Problem 2: Goal progress is meaningless without a timeline.**
"You are 34% toward your goal" means nothing. "At your current savings rate, you will reach your goal in 8 months" means everything.

**Problem 3: Emergency fund is not separated from investments.**
Your emergency fund is not an investment. It is liquidity insurance. It must be tracked separately and must never be counted toward investment returns.

### The solution: Three savings dimensions

```
DIMENSION 1 — CONTRIBUTIONS (what you put in)
Every deposit/contribution is logged with date and amount.
Total contributions = what you actually sacrificed from income.

DIMENSION 2 — CURRENT VALUE (what it's worth today)
Updated manually by the user (or in future, via API).
Current value - total contributions = your return/profit/loss.

DIMENSION 3 — GOAL PROGRESS (where you are headed)
Goal target, current value, monthly contribution rate.
Projected completion date based on current pace.
```

### Django — Savings Model (updated)

```python
class SavingsEntry(models.Model):
    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user                = models.ForeignKey(User, on_delete=models.CASCADE)
    date                = models.DateField()
    investment_type     = models.CharField(max_length=50)
    institution         = models.CharField(max_length=100)
    amount_contributed  = models.DecimalField(max_digits=12, decimal_places=2)
    current_value       = models.DecimalField(max_digits=12, decimal_places=2)
    goal_target         = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    goal_name           = models.CharField(max_length=100, blank=True)   # NEW: "House Deposit", "Emergency Fund"
    goal_deadline       = models.DateField(null=True, blank=True)         # NEW: when do you need to reach the goal?
    notes               = models.TextField(blank=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)
```

### Savings Service Functions

```python
# backend/apps/savings/services.py

from decimal import Decimal
from datetime import date
from dateutil.relativedelta import relativedelta
from .models import SavingsEntry
from django.db.models import Sum

def get_savings_portfolio(user) -> dict:
    """
    Full portfolio picture across all investment types.
    Returns total contributed, total current value, overall return, breakdown.
    """
    entries = SavingsEntry.objects.filter(user=user)

    total_contributed = entries.aggregate(t=Sum('amount_contributed'))['t'] or Decimal("0")
    total_value       = entries.aggregate(t=Sum('current_value'))['t'] or Decimal("0")
    total_return      = total_value - total_contributed
    return_pct        = Decimal("0")
    if total_contributed > 0:
        return_pct = (total_return / total_contributed * 100).quantize(Decimal("0.01"))

    # Breakdown by investment type
    from django.db.models import Sum
    breakdown = {}
    for inv_type in entries.values_list('investment_type', flat=True).distinct():
        type_entries = entries.filter(investment_type=inv_type)
        contributed  = type_entries.aggregate(t=Sum('amount_contributed'))['t'] or Decimal("0")
        value        = type_entries.aggregate(t=Sum('current_value'))['t'] or Decimal("0")
        ret          = value - contributed
        ret_pct      = (ret / contributed * 100).quantize(Decimal("0.01")) if contributed > 0 else Decimal("0")
        breakdown[inv_type] = {
            "contributed":  str(contributed),
            "value":        str(value),
            "return":       str(ret),
            "return_pct":   str(ret_pct),
        }

    # Emergency fund separately (critical to isolate)
    ef_entries    = entries.filter(investment_type='Emergency Fund')
    ef_value      = ef_entries.aggregate(t=Sum('current_value'))['t'] or Decimal("0")

    return {
        "total_contributed":    str(total_contributed),
        "total_current_value":  str(total_value),
        "total_return":         str(total_return),
        "return_percent":       str(return_pct),
        "emergency_fund_value": str(ef_value),
        "investable_portfolio": str(total_value - ef_value),  # Excluding emergency fund
        "breakdown":            breakdown,
    }


def get_goal_projections(user) -> list[dict]:
    """
    For each savings goal, calculates:
    - Progress percentage
    - Amount remaining
    - Monthly contribution rate (based on last 3 months)
    - Projected completion date
    - Months to goal
    - Whether on track for deadline (if set)
    """
    today = date.today()
    entries = SavingsEntry.objects.filter(user=user).exclude(goal_target=None)

    # Group by institution + goal_name (a "goal" is a unique institution+name combo)
    goals_seen = set()
    results = []

    for entry in entries:
        key = f"{entry.institution}_{entry.goal_name}_{entry.investment_type}"
        if key in goals_seen:
            continue
        goals_seen.add(key)

        # All entries for this goal
        goal_entries = SavingsEntry.objects.filter(
            user=user,
            institution=entry.institution,
            investment_type=entry.investment_type,
        )

        total_contributed = goal_entries.aggregate(t=Sum('amount_contributed'))['t'] or Decimal("0")
        current_value     = goal_entries.order_by('-date').first().current_value
        goal_target       = entry.goal_target
        goal_deadline     = entry.goal_deadline
        goal_name         = entry.goal_name or entry.institution

        amount_remaining  = max(Decimal("0"), goal_target - current_value)
        progress_pct      = Decimal("0")
        if goal_target > 0:
            progress_pct = min(Decimal("100"), (current_value / goal_target * 100).quantize(Decimal("0.01")))

        # Monthly contribution rate: average of last 3 months
        three_months_ago  = today - relativedelta(months=3)
        recent_entries    = goal_entries.filter(date__gte=three_months_ago)
        recent_contributed = recent_entries.aggregate(t=Sum('amount_contributed'))['t'] or Decimal("0")
        monthly_rate      = (recent_contributed / Decimal("3")).quantize(Decimal("0.01"))

        # Projected completion
        projected_months  = None
        projected_date    = None
        on_track          = None

        if monthly_rate > 0 and amount_remaining > 0:
            projected_months = int((amount_remaining / monthly_rate).quantize(Decimal("1")))
            projected_date   = (today + relativedelta(months=projected_months)).strftime("%b %Y")

            if goal_deadline:
                months_to_deadline = (goal_deadline.year - today.year) * 12 + (goal_deadline.month - today.month)
                on_track = projected_months <= months_to_deadline
        elif amount_remaining <= 0:
            projected_months = 0
            on_track = True

        results.append({
            "goal_name":          goal_name,
            "investment_type":    entry.investment_type,
            "institution":        entry.institution,
            "goal_target":        str(goal_target),
            "current_value":      str(current_value),
            "total_contributed":  str(total_contributed),
            "amount_remaining":   str(amount_remaining),
            "progress_percent":   str(progress_pct),
            "monthly_rate":       str(monthly_rate),
            "projected_months":   projected_months,
            "projected_date":     projected_date,
            "goal_deadline":      goal_deadline.strftime("%d/%m/%Y") if goal_deadline else None,
            "on_track":           on_track,
        })

    return results
```

---

## PART 4 — THE DASHBOARD CALCULATION ENGINE

### The 3 questions every dashboard must answer

```
Question 1: AM I WINNING THIS MONTH?
→ Income achievement rate, budget burn rate, net position

Question 2: WHERE AM I HEADED?
→ Projected month-end income, projected month-end spending per category, projected surplus/deficit

Question 3: WHAT SHOULD I DO ABOUT IT?
→ Actionable alerts: "Slow down food spending", "You're on track", "Unexpected bills this month"
```

### The Full Dashboard Service

```python
# backend/apps/dashboard/services.py

from decimal import Decimal, ROUND_HALF_UP
from datetime import date
import calendar
from apps.income.services import get_income_summary
from apps.expenses.services import get_expense_summary, get_month_range
from apps.savings.services import get_savings_portfolio, get_goal_projections
from apps.budgets.models import CategoryBudget

# ── RATIO THRESHOLDS ──────────────────────────────────────────────────────
THRESHOLDS = {
    "savings_rate":    {"green": Decimal("20"), "yellow": Decimal("10"), "higher_is_better": True},
    "expense_ratio":   {"green": Decimal("80"), "yellow": Decimal("90"), "higher_is_better": False},
    "housing_ratio":   {"green": Decimal("30"), "yellow": Decimal("40"), "higher_is_better": False},
    "food_ratio":      {"green": Decimal("20"), "yellow": Decimal("30"), "higher_is_better": False},
    "dti_ratio":       {"green": Decimal("20"), "yellow": Decimal("35"), "higher_is_better": False},
    "discretionary_ratio": {"green": Decimal("15"), "yellow": Decimal("25"), "higher_is_better": False},
}

def get_ratio_status(value: Decimal, key: str) -> str:
    t = THRESHOLDS[key]
    if t["higher_is_better"]:
        if value >= t["green"]:   return "green"
        elif value >= t["yellow"]:return "yellow"
        else:                     return "red"
    else:
        if value <= t["green"]:   return "green"
        elif value <= t["yellow"]:return "yellow"
        else:                     return "red"


def safe_divide(numerator: Decimal, denominator: Decimal) -> Decimal:
    """Safe division returning 0 if denominator is zero."""
    if not denominator or denominator == 0:
        return Decimal("0.00")
    return (numerator / denominator).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def get_full_dashboard(user, month: int, year: int) -> dict:
    """
    The single API call that powers the entire dashboard.
    Returns everything the frontend needs — pre-computed, no client-side math.
    """
    today        = date.today()
    first_day, last_day = get_month_range(month, year)
    days_in_month = calendar.monthrange(year, month)[1]
    days_elapsed  = min((today - first_day).days + 1, days_in_month) if today >= first_day else 0
    pct_elapsed   = safe_divide(Decimal(str(days_elapsed)), Decimal(str(days_in_month))) * 100

    # ── RAW DATA ──────────────────────────────────────────────────────────
    income_summary  = get_income_summary(user, month, year)
    expense_summary = get_expense_summary(user, month, year)
    portfolio       = get_savings_portfolio(user)

    actual_income     = Decimal(income_summary["actual_income"])
    expected_income   = user.expected_monthly_income or Decimal("0")
    total_expenses    = Decimal(expense_summary["total_actual"])
    this_month_savings = Decimal("0")

    from apps.savings.models import SavingsEntry
    from django.db.models import Sum
    this_month_savings = SavingsEntry.objects.filter(
        user=user,
        date__gte=first_day,
        date__lte=last_day
    ).aggregate(t=Sum('amount_contributed'))['t'] or Decimal("0")

    # ── CORE METRICS ──────────────────────────────────────────────────────
    net_position      = actual_income - total_expenses          # Actual surplus/deficit so far
    projected_income  = Decimal(income_summary["income_run_rate"])
    projected_expenses = Decimal(expense_summary["total_actual"])  # Will be refined below

    # Project month-end expenses based on burn rates per category
    for cat in expense_summary["categories"]:
        projected_expenses = max(projected_expenses, Decimal(cat["projected_month_end"]) if cat["projected_month_end"] else Decimal("0"))

    # Actually sum projected month-ends across categories
    projected_expense_total = sum(
        Decimal(cat["projected_month_end"])
        for cat in expense_summary["categories"]
    )
    projected_surplus = projected_income - projected_expense_total

    # ── FINANCIAL RATIOS ──────────────────────────────────────────────────
    # Use expected_monthly_income for all ratios (stable denominator)
    # Exception: surplus/deficit uses actual income

    by_category = {cat["category"]: Decimal(cat["actual"]) for cat in expense_summary["categories"]}

    savings_rate       = safe_divide(this_month_savings, expected_income) * 100
    expense_ratio      = safe_divide(total_expenses,     expected_income) * 100
    housing_ratio      = safe_divide(by_category.get("housing",      Decimal("0")), expected_income) * 100
    food_ratio         = safe_divide(by_category.get("food",         Decimal("0")), expected_income) * 100
    dti_ratio          = safe_divide(by_category.get("loans_debt",   Decimal("0")), expected_income) * 100
    discretionary      = by_category.get("entertainment", Decimal("0")) + by_category.get("personal_care", Decimal("0"))
    discretionary_ratio= safe_divide(discretionary, expected_income) * 100

    ratios = {
        "savings_rate":        {"value": str(savings_rate.quantize(Decimal("0.1"))),       "status": get_ratio_status(savings_rate,        "savings_rate"),    "benchmark": "Target ≥ 20%"},
        "expense_ratio":       {"value": str(expense_ratio.quantize(Decimal("0.1"))),       "status": get_ratio_status(expense_ratio,        "expense_ratio"),   "benchmark": "Target < 80%"},
        "housing_ratio":       {"value": str(housing_ratio.quantize(Decimal("0.1"))),       "status": get_ratio_status(housing_ratio,        "housing_ratio"),   "benchmark": "Target ≤ 30%"},
        "food_ratio":          {"value": str(food_ratio.quantize(Decimal("0.1"))),           "status": get_ratio_status(food_ratio,           "food_ratio"),      "benchmark": "Target ≤ 20%"},
        "dti_ratio":           {"value": str(dti_ratio.quantize(Decimal("0.1"))),            "status": get_ratio_status(dti_ratio,            "dti_ratio"),       "benchmark": "Target ≤ 20%"},
        "discretionary_ratio": {"value": str(discretionary_ratio.quantize(Decimal("0.1"))), "status": get_ratio_status(discretionary_ratio, "discretionary_ratio"), "benchmark": "Target ≤ 15%"},
    }

    # ── EMERGENCY FUND ────────────────────────────────────────────────────
    ef_value = Decimal(portfolio["emergency_fund_value"])
    monthly_expenses_avg = total_expenses  # Use current month as proxy
    ef_months = safe_divide(ef_value, monthly_expenses_avg) if monthly_expenses_avg > 0 else Decimal("0")
    ef_target = monthly_expenses_avg * 6
    ef_status = "Fully Funded" if ef_months >= 6 else ("Half Way" if ef_months >= 3 else "Keep Building")

    # ── SMART ALERTS ──────────────────────────────────────────────────────
    alerts = generate_smart_alerts(
        expense_summary=expense_summary,
        ratios=ratios,
        income_summary=income_summary,
        net_position=net_position,
        projected_surplus=projected_surplus,
        days_elapsed=days_elapsed,
        days_in_month=days_in_month,
    )

    return {
        # ── Summary Cards
        "actual_income":          str(actual_income),
        "expected_income":        str(expected_income),
        "total_expenses":         str(total_expenses),
        "net_position":           str(net_position),
        "this_month_savings":     str(this_month_savings),
        "savings_rate":           str(savings_rate.quantize(Decimal("0.1"))),
        "total_portfolio_value":  portfolio["total_current_value"],

        # ── Projections
        "projected_income":       str(projected_income),
        "projected_expenses":     str(projected_expense_total),
        "projected_surplus":      str(projected_surplus),
        "income_achievement_rate":income_summary["achievement_rate"],

        # ── Month Progress
        "days_elapsed":           days_elapsed,
        "days_in_month":          days_in_month,
        "days_remaining":         days_in_month - days_elapsed,
        "percent_month_elapsed":  str(pct_elapsed.quantize(Decimal("0.1"))),

        # ── Financial Ratios
        "ratios":                 ratios,

        # ── Budget vs Actual (per category)
        "expense_summary":        expense_summary,

        # ── Emergency Fund
        "emergency_fund": {
            "value":       str(ef_value),
            "months":      str(ef_months.quantize(Decimal("0.1"))),
            "target":      str(ef_target),
            "status":      ef_status,
            "percent":     str(safe_divide(ef_value, ef_target) * 100),
        },

        # ── Smart Alerts
        "alerts": alerts,

        # ── Portfolio snapshot
        "portfolio": portfolio,
    }


def generate_smart_alerts(
    expense_summary, ratios, income_summary,
    net_position, projected_surplus, days_elapsed, days_in_month
) -> list[dict]:
    """
    Generates actionable, specific alerts based on the financial data.
    Returns list of {type, severity, message, action} sorted by severity.
    """
    alerts = []

    # Alert 1: Over budget categories
    for cat in expense_summary["categories"]:
        if cat["status"] == "over_budget":
            alerts.append({
                "type": "over_budget",
                "severity": "high",
                "category": cat["category"],
                "message": f"Your {cat['category'].replace('_', ' ').title()} spending has exceeded budget by Ksh {abs(float(cat['remaining'])):,.0f}",
                "action": "Review and reduce spending in this category",
            })
        elif cat["status"] == "burning_fast":
            days_rem = cat["days_remaining"]
            daily_rem = cat["daily_budget_remaining"]
            alerts.append({
                "type": "burning_fast",
                "severity": "medium",
                "category": cat["category"],
                "message": f"{cat['category'].replace('_', ' ').title()} spending pace is high. You have Ksh {float(daily_rem):,.0f}/day left for {days_rem} days",
                "action": f"Limit {cat['category'].replace('_', ' ')} to Ksh {float(daily_rem):,.0f} per day",
            })

    # Alert 2: Projected deficit
    if projected_surplus < 0:
        alerts.append({
            "type": "projected_deficit",
            "severity": "high",
            "message": f"At current pace, you are projected to end the month Ksh {abs(float(projected_surplus)):,.0f} in deficit",
            "action": "Cut discretionary spending now to protect your surplus",
        })

    # Alert 3: Low savings rate
    savings_rate = float(ratios["savings_rate"]["value"])
    if savings_rate < 10 and days_elapsed > 15:
        alerts.append({
            "type": "low_savings",
            "severity": "medium",
            "message": f"Savings rate is {savings_rate:.1f}% — below the 10% minimum target",
            "action": "Transfer money to savings before end of month",
        })

    # Alert 4: Income below target
    achievement = float(income_summary["achievement_rate"])
    if achievement < 70 and days_elapsed > int(days_in_month * 0.6):
        alerts.append({
            "type": "income_shortfall",
            "severity": "medium",
            "message": f"Income is at {achievement:.0f}% of expected with {days_in_month - days_elapsed} days left",
            "action": "Follow up on outstanding payments or invoice clients",
        })

    # Alert 5: High debt payments
    dti = float(ratios["dti_ratio"]["value"])
    if dti > 35:
        alerts.append({
            "type": "high_debt",
            "severity": "high",
            "message": f"Debt payments are {dti:.1f}% of income — this is unsustainable above 35%",
            "action": "Prioritise paying off highest-interest debt first",
        })

    # Alert 6: Good news — on track
    on_track_count = sum(1 for cat in expense_summary["categories"] if cat["status"] == "on_track")
    if on_track_count >= 6 and projected_surplus > 0:
        alerts.append({
            "type": "on_track",
            "severity": "positive",
            "message": f"Great job — {on_track_count} of 8 categories are on track. Projected surplus: Ksh {float(projected_surplus):,.0f}",
            "action": "Consider moving the surplus to savings or debt repayment",
        })

    # Sort: high → medium → positive
    order = {"high": 0, "medium": 1, "low": 2, "positive": 3}
    alerts.sort(key=lambda a: order.get(a["severity"], 99))
    return alerts
```

---

## PART 5 — VISUALIZATION SPECIFICATIONS

### Chart 1: Budget Burn Rate Chart (Most Important)
**What it shows:** For each category, how fast you are spending vs how fast the month is moving.

```
Visual: Horizontal grouped bar chart
X-axis: 0% to 150% (spending as % of budget)
Each category = one row with two bars:
  Bar 1 (grey): "You should have spent by now" = budget × % of month elapsed
  Bar 2 (colored): "You have actually spent" = actual spending

Color logic:
  - Actual bar GREEN if actual ≤ expected-by-now
  - Actual bar AMBER if actual is 100-120% of expected-by-now
  - Actual bar RED if actual > 120% of expected-by-now

Right side label: "Ksh X,XXX remaining" or "Ksh X,XXX over"

Frontend component: <BurnRateChart data={expense_summary.categories} />
Data fields used: percent_used, burn_rate, status, remaining, daily_budget_remaining
```

### Chart 2: Spend Pace Line Chart (Per Category)
**What it shows:** Day-by-day cumulative spending vs the ideal straight-line budget.

```
Visual: Line chart (Recharts LineChart)
X-axis: Days 1–31
Y-axis: Cumulative Ksh spent

Line 1 (dashed, grey): Ideal pace = budget / days_in_month × day
  → This is a perfectly straight diagonal line
  → If you spend this exact amount per day, you use exactly 100% by month end

Line 2 (solid, teal or red): Actual cumulative spend
  → Goes up steeply on shopping days, flat on days with no spending
  → Color = teal if below ideal line, red if above

Shaded zone: Area between actual and ideal
  → Green shaded when below ideal (you are under-spending = good)
  → Red shaded when above ideal (you are over-spending = warning)

Vertical line: Today (dashed vertical line)
  → Everything to the right is future

Future projection: Dashed line from today's actual value
  → Continues at the average daily spend rate to show projected month-end

API endpoint: GET /expenses/pace/?category=food&month=1&year=2026
Backend function: get_running_total_by_day()
Frontend component: <SpendPaceChart data={pace_data} budget={budget_amount} />
```

### Chart 3: Income vs Expenses Trend (12 Months)
**What it shows:** Month-by-month history to reveal seasonal patterns.

```
Visual: Grouped bar chart + line overlay (Recharts ComposedChart)
X-axis: Last 12 months (abbreviated: Jan 25, Feb 25, etc.)
Y-axis: Ksh amount

Bar 1 (emerald green): Income for each month
Bar 2 (coral red): Total expenses for each month
Line (teal): Savings/surplus each month (income - expenses)

Key feature: The line going below zero = deficit months
  → These months are highlighted with a red background bar

Labels: Each bar shows the Ksh value on hover tooltip
  Tooltip format: "March 2025 — Income: Ksh 85,000 | Expenses: Ksh 71,000 | Surplus: Ksh 14,000"

API endpoint: GET /insights/trends/?months=12
Backend function: get_month_over_month_trends(user, num_months=12)
Frontend component: <IncomeTrendChart data={trends} />
```

### Chart 4: Portfolio Allocation Donut Chart
**What it shows:** How savings are split across investment types.

```
Visual: Donut chart (Recharts PieChart with innerRadius)
Each segment = one investment type
Center of donut: Total portfolio value in large bold text

Segments:
  - SACCO (deep blue)
  - MMF (teal)
  - Emergency Fund (amber — distinct because it is not an investment)
  - T-Bills (emerald)
  - Stocks (purple)
  - Crypto (orange)
  - Chama (gold)
  - CHUMZ (navy)

Below the donut: Legend table
  Each row: Investment type | Contributed | Current Value | Return %
  Emergency fund row styled differently (amber background) with label "Liquidity Reserve"

API endpoint: GET /savings/summary/
Backend function: get_savings_portfolio()
Frontend component: <PortfolioDonut data={portfolio.breakdown} total={portfolio.total_current_value} />
```

### Chart 5: Goal Progress Cards (Savings Goals)
**What it shows:** Visual progress toward each savings goal with projected completion.

```
Visual: Card per goal (not a chart, but a visual component)
Each card contains:

[Goal Name — e.g. "Emergency Fund"]
[Investment type badge — e.g. "MMF at CIC"]

Progress bar:
  ████████████░░░░░░░░  67%
  Ksh 20,000 of Ksh 30,000

Bottom section:
  Monthly rate: Ksh 5,000/month (avg last 3 months)
  At this pace: Reach goal in 2 months (Aug 2026) ← projected date

If deadline is set:
  Deadline: Dec 2026  |  On Track ✅   or   Behind ⚠️

API endpoint: GET /savings/goals/
Backend function: get_goal_projections()
Frontend component: <GoalCard goal={goal} />
```

### Chart 6: Spending Heatmap Calendar
**What it shows:** Visual calendar where each day is colored by spending intensity.

```
Visual: Monthly calendar grid
Each day is a colored square:
  ⬜ White/light = no spending (Ksh 0)
  🟩 Light green = low spending (bottom 25%)
  🟨 Yellow = medium spending
  🟧 Orange = high spending (top 25%)
  🟥 Red = very high spending day

On tap/hover: Shows "Mon 15 Jan — Ksh 4,500 across 3 transactions"

Use case: Immediately see which days of the week you overspend
  → If weekends are always red, you have a weekend spending pattern
  → If the 1st of every month is always red, you have a fixed-bill cluster

API endpoint: GET /expenses/heatmap/?month=1&year=2026
Backend function: get_spending_heatmap()
Frontend component: <SpendingHeatmap data={heatmap} />
```

### Chart 7: Financial Health Radar (Advanced)
**What it shows:** All 6 financial ratios on one spider/radar chart vs target.

```
Visual: Recharts RadarChart
6 axes: Savings Rate, Expense Ratio, Housing, Food, DTI, Discretionary
Two overlaid shapes:
  Shape 1 (dashed grey): Target/benchmark values
  Shape 2 (solid teal, semi-transparent): Your actual values

The closer your shape is to the outer edge of each axis = better
The further inside = worse

Perfect score = your teal shape completely covers the grey benchmark shape

API: Ratios come from GET /dashboard/
Frontend component: <HealthRadarChart ratios={dashboard.ratios} />
```

---

## PART 6 — FRONTEND IMPLEMENTATION GUIDE

### Dashboard Layout (mobile-first)

```
┌─────────────────────────────────┐
│  Kenya Finance    Jan 2026  ◀ ▶ │  ← Month selector
├─────────────────────────────────┤
│  Hello Moses 👋  Day 18 of 31   │  ← Greeting + month progress
│  ░░░░░░░░░░░░░░░░░░░░░  58%     │  ← Month elapsed bar
├─────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐    │
│  │ INCOME   │  │ EXPENSES │    │  ← Summary cards row 1
│  │ Ksh 65K  │  │ Ksh 48K  │    │
│  │ of 85K   │  │ of 85K   │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │ NET POS  │  │ SAVINGS  │    │  ← Summary cards row 2
│  │ Ksh 17K  │  │ 8.5%     │    │
│  │ +Ksh 22K │  │ Target:20│    │
│  │ projected│  │          │    │
│  └──────────┘  └──────────┘    │
├─────────────────────────────────┤
│  ⚠️ ALERTS (2)                   │  ← Smart alerts (expandable)
│  > Food spending is burning fast│
│  > Projected deficit of Ksh 3K  │
├─────────────────────────────────┤
│  BUDGET BURN RATES              │  ← Burn rate chart
│  [Chart 1 — Horizontal bars]    │
├─────────────────────────────────┤
│  SPENDING BREAKDOWN             │  ← Donut chart
│  [Chart — Pie by category]      │
├─────────────────────────────────┤
│  HEALTH RADAR                   │  ← Radar chart
│  [Chart — 6 ratios vs targets]  │
└─────────────────────────────────┘
```

### Key React Components to Build

```typescript
// 1. Month Progress Bar — shows where you are in the month
interface MonthProgressProps {
  daysElapsed: number;
  daysInMonth: number;
  percentElapsed: string;
}

// 2. Summary Card — enhanced with projection
interface SummaryCardProps {
  title: string;
  actual: string;        // e.g. "Ksh 65,000"
  target?: string;       // e.g. "of Ksh 85,000"
  projected?: string;    // e.g. "→ Ksh 85,000 by month end"
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;   // e.g. "+12% vs last month"
  status?: 'green' | 'yellow' | 'red';
}

// 3. Burn Rate Chart
interface BurnRateCategoryProps {
  category: string;
  budget: string;
  actual: string;
  percentUsed: string;
  burnRate: string;       // > 100 = burning faster than month
  status: string;
  remaining: string;
  dailyBudgetRemaining: string;
}

// 4. Smart Alert Banner
interface AlertProps {
  type: string;
  severity: 'high' | 'medium' | 'low' | 'positive';
  message: string;
  action: string;
  category?: string;
}

// 5. Spend Pace Chart (per category screen)
interface SpendPaceDataPoint {
  day: number;
  date: string;
  dailySpend: string;
  cumulativeSpend: string;
  idealCumulative: string;
  isFuture: boolean;
  isOverIdeal: boolean;
}

// 6. Goal Card
interface GoalCardProps {
  goalName: string;
  investmentType: string;
  institution: string;
  goalTarget: string;
  currentValue: string;
  amountRemaining: string;
  progressPercent: string;
  monthlyRate: string;
  projectedMonths: number | null;
  projectedDate: string | null;
  goalDeadline: string | null;
  onTrack: boolean | null;
}
```

### React Query Hooks (updated)

```typescript
// src/hooks/useDashboard.ts
export function useDashboard(month: number, year: number) {
  return useQuery({
    queryKey: ['dashboard', month, year],
    queryFn: () => getDashboard(month, year),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    // Auto-refetch when user returns to the tab (catches entries added elsewhere)
    refetchOnWindowFocus: true,
  });
}

// src/hooks/useSpendPace.ts
export function useSpendPace(category: string, month: number, year: number) {
  return useQuery({
    queryKey: ['spend-pace', category, month, year],
    queryFn: () => getSpendPace(category, month, year),
    staleTime: 2 * 60 * 1000,  // 2 minutes
  });
}

// src/hooks/useGoals.ts
export function useGoalProjections() {
  return useQuery({
    queryKey: ['goal-projections'],
    queryFn: () => getGoalProjections(),
    staleTime: 10 * 60 * 1000,  // 10 minutes
  });
}

// src/hooks/useSpendingHeatmap.ts
export function useSpendingHeatmap(month: number, year: number) {
  return useQuery({
    queryKey: ['heatmap', month, year],
    queryFn: () => getSpendingHeatmap(month, year),
    staleTime: 3 * 60 * 1000,
  });
}
```

---

## PART 7 — NEW API ENDPOINTS NEEDED

Add these to the existing API:

```
GET  /expenses/pace/          ?category=&month=&year=    → SpendPace data (Chart 2)
GET  /expenses/heatmap/       ?month=&year=              → Heatmap data (Chart 6)
GET  /expenses/trends/        ?months=6                  → Month-over-month by category
GET  /savings/goals/                                     → Goal projections with projected dates
GET  /savings/portfolio/                                 → Full portfolio breakdown
GET  /income/summary/         ?month=&year=              → Income with run rate + achievement
GET  /dashboard/alerts/       ?month=&year=              → Smart alerts only (for notification badge)
```

---

## PART 8 — FINANCIAL ADVISOR SUMMARY

As a senior financial advisor, here is the logic hierarchy I would use:

```
LEVEL 1 — DAILY (every time you open the app)
• Did I stay within my daily budget for each category?
• Am I on track for this month's income target?
• Any urgent alerts?

LEVEL 2 — WEEKLY (end of each week)
• What is my burn rate for each category?
• Which categories are burning too fast?
• What is my projected month-end surplus or deficit?

LEVEL 3 — MONTHLY (end of each month)
• What were my 6 financial health ratios?
• Did I hit my savings target?
• How did I compare to the previous month?
• Which categories consistently overspend?

LEVEL 4 — QUARTERLY (every 3 months)
• Are my savings goals on track?
• Is my emergency fund growing?
• What is the return on my investment portfolio?
• Should I increase or decrease any category budget?
```

This is the logic framework that makes a finance app genuinely useful — not just a digital receipt bin.

---

*Kenya Finance App — Financial Logic & Visualization Spec v2.0 — May 2026*
*This document governs all calculation logic in the app.*
