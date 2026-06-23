"""Dashboard summary calculation services.

All financial calculations happen here (backend only).
Frontend receives pre-computed values and displays them (read-only).
"""
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, Count
from datetime import timedelta
import datetime

from users.models import User
from income.models import IncomeEntry
from expenses.models import ExpenseEntry
from savings.models import InvestmentEntry, VaultTransaction
from budgets.models import CategoryBudget
from recurring.services import RecurringProcessor


class DashboardService:
    """Calculate all dashboard summary metrics."""
    
    def __init__(self, user: User, month: int = None, year: int = None, day: int = None, period: str = 'month'):
        """Initialize service with user context and specific period."""
        self.user = user
        self.today = timezone.now().date()
        self.period_type = period # 'day', 'week', 'month'
        
        # Use provided date components or default to today
        target_month = month or self.today.month
        target_year = year or self.today.year
        target_day = day or self.today.day
        
        self.target_date = datetime.date(target_year, target_month, target_day)
        
        if period == 'day':
            self.current_period_start = self.target_date
            self.current_period_end = self.target_date
        elif period == 'week':
            # Kenya standard: Week starts on Monday
            self.current_period_start = self.target_date - datetime.timedelta(days=self.target_date.weekday())
            self.current_period_end = self.current_period_start + datetime.timedelta(days=6)
        else: # month
            self.current_period_start = datetime.date(target_year, target_month, 1)
            # Rule 9: Calendar month boundaries
            next_month = self.current_period_start + datetime.timedelta(days=32)
            self.current_period_end = next_month.replace(day=1) - datetime.timedelta(days=1)
            
        self.current_month_start = datetime.date(target_year, target_month, 1)
        next_month_calc = self.current_month_start + datetime.timedelta(days=32)
        self.current_month_end = next_month_calc.replace(day=1) - datetime.timedelta(days=1)
        self.current_year_start = self.current_month_start.replace(month=1, day=1)
    
    def get_summary(self) -> dict:
        """
        Get complete dashboard summary in ONE call.
        """
        # Automatically process due recurring transactions when dashboard is accessed
        RecurringProcessor(self.user).process_all()
        
        # Calculate high-level expert relations
        income_summary = self._get_income_summary()
        expense_summary = self._get_expenses_summary()
        savings_summary = self._get_savings_summary()
        budget_summary = self._get_budget_summary()
        
        # Financial Components
        capacity = Decimal(income_summary['month']['total_available'])
        planned = Decimal(budget_summary['total']['monthly_budget'])
        actual_expenses = Decimal(expense_summary['month']['total']) - Decimal(expense_summary['month']['categories'].get('Savings', {}).get('amount', '0'))
        actual_outflow = actual_expenses + Decimal(savings_summary['total']['contributed_this_period'])

        # REAL-TIME LIQUIDITY (Cash on Hand) - Filtered up to current period end for consistency
        total_income_all_time = IncomeEntry.objects.filter(user=self.user, date__lte=self.current_period_end, actual_amount__gt=0).aggregate(Sum('actual_amount'))['actual_amount__sum'] or Decimal('0')
        total_expenses_all_time = ExpenseEntry.objects.filter(user=self.user, date__lte=self.current_period_end).exclude(category='savings').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        total_investments_all_time = InvestmentEntry.objects.filter(user=self.user, date__lte=self.current_period_end).aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or Decimal('0')
        
        # Vault Logic: Saves decrease Cash on Hand, Withdraws increase it
        total_vault_saves = VaultTransaction.objects.filter(user=self.user, date__lte=self.current_period_end, type='save').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        total_vault_withdraws = VaultTransaction.objects.filter(user=self.user, date__lte=self.current_period_end, type='withdraw').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        vault_balance = total_vault_saves - total_vault_withdraws

        # Cash on Hand = All Income - All Expenses - All Investments - Net Saved in Vault
        real_time_balance = total_income_all_time - total_expenses_all_time - total_investments_all_time - vault_balance

        # CONTROL TOWER CALCULATIONS
        days_passed = max((self.today - self.current_period_start).days + 1, 1)
        days_in_period = (self.current_period_end - self.current_period_start).days + 1
        
        burn_rate = actual_outflow / Decimal(days_passed)

        runway_days = int(real_time_balance / burn_rate) if burn_rate > 0 and real_time_balance > 0 else (999 if real_time_balance > 0 else 0)
        
        # Health Score (0-100)
        # Factors: Utilization (40%), Buffer Status (40%), Savings Rate (20%)
        utilization = (actual_outflow / capacity * 100) if capacity > 0 else 100
        utilization_score = max(0, 100 - utilization)
        buffer_score = 100 if real_time_balance > (capacity * Decimal('0.2')) else (50 if real_time_balance > 0 else 0)
        savings_rate = (Decimal(savings_summary['total']['contributed_this_period']) / capacity * 100) if capacity > 0 else 0
        savings_score = min(100, savings_rate * 5) # 20% savings = 100 score
        
        health_score = (Decimal(utilization_score) * Decimal('0.4')) + (Decimal(buffer_score) * Decimal('0.4')) + (Decimal(savings_score) * Decimal('0.2'))

        return {
            'date': self.today.isoformat(),
            'income': income_summary,
            'expenses': expense_summary,
            'savings': savings_summary,
            'budgets': budget_summary,
            'daily_spending': self._get_daily_spending(),
            'comparison_spending': self._get_comparison_spending(),
            'notifications': self._get_notifications(),
            'recent_transactions': self._get_recent_transactions(),
            'upcoming_recurring': self._get_upcoming_recurring(),
            'matrix': {
                'capacity': str(capacity),
                'planned': str(planned),
                'actual': str(actual_outflow),
                'buffer': str(real_time_balance),
                'vault_balance': str(vault_balance),
                'utilization_rate': str(utilization),
                'burn_rate': str(burn_rate),
                'runway_days': runway_days,
                'health_score': int(health_score),
                'savings_rate': str(savings_rate)
            },
            'period': {
                'current_month': self.current_month_start.strftime('%Y-%m'),
                'current_year': self.current_year_start.year,
                'days_passed': days_passed,
                'days_total': days_in_period
            },
            'ai_analysis': self._get_ai_analysis()
        }
    
    def _get_comparison_spending(self) -> list:
        """Calculate spending for the PREVIOUS equivalent period for comparison."""
        # Calculate start and end of previous period
        delta = (self.current_period_end - self.current_period_start) + timedelta(days=1)
        prev_start = self.current_period_start - delta
        prev_end = self.current_period_end - delta
        
        period_entries = ExpenseEntry.objects.filter(
            user=self.user,
            date__gte=prev_start,
            date__lte=prev_end
        )
        
        daily_data = []
        current = prev_start
        while current <= prev_end:
            day_total = period_entries.filter(date=current).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            daily_data.append({
                'date': current.isoformat(),
                'day': current.day,
                'amount': str(day_total)
            })
            current += timedelta(days=1)
            
        return daily_data
    
    def _get_ai_analysis(self) -> dict:
        """Fetch AI analysis for the current summary."""
        try:
            from .ai_service import GeminiFinanceService
            # We recreate a lightweight summary for the AI
            # to avoid circular logic or passing too much redundant data
            ai_service = GeminiFinanceService()
            # We can't call get_summary() recursively, so we pass a snapshot
            # of what we've already calculated if needed, or just let it fetch 
            # the data it needs. For now, let's pass the context.
            # But wait, it's easier to just call it from the view.
            return None # We will handle this in the view to keep the service clean
        except:
            return None

    
    def _get_daily_spending(self) -> list:
        """Calculate total spending for each day in the current selected period."""
        period_entries = ExpenseEntry.objects.filter(
            user=self.user,
            date__gte=self.current_period_start,
            date__lte=self.current_period_end
        )
        
        daily_data = []
        current = self.current_period_start
        while current <= self.current_period_end:
            # For month view, we might want to stop at 'today' to avoid empty future bars
            if self.period_type == 'month' and current > self.today:
                break
                
            day_total = period_entries.filter(date=current).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            daily_data.append({
                'date': current.isoformat(),
                'day': current.day,
                'amount': str(day_total)
            })
            current += timedelta(days=1)
            
        return daily_data
    
    def _get_carry_forward(self) -> Decimal:
        """Calculate net surplus carried forward from all time before current period."""
        # Total historical income
        historical_income = IncomeEntry.objects.filter(
            user=self.user,
            date__lt=self.current_period_start
        ).aggregate(Sum('actual_amount'))['actual_amount__sum'] or Decimal('0')
        
        # Total historical expenses (excluding savings category to avoid double counting with SavingsEntry)
        historical_expenses = ExpenseEntry.objects.filter(
            user=self.user,
            date__lt=self.current_period_start
        ).exclude(category='savings').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        
        # Total historical investments (contributions)
        historical_investments = InvestmentEntry.objects.filter(
            user=self.user,
            date__lt=self.current_period_start
        ).aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or Decimal('0')
        
        # Total historical vault movements
        hist_vault_saves = VaultTransaction.objects.filter(user=self.user, type='save', date__lt=self.current_period_start).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        hist_vault_withdraws = VaultTransaction.objects.filter(user=self.user, type='withdraw', date__lt=self.current_period_start).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        hist_vault_net = hist_vault_saves - hist_vault_withdraws

        return historical_income - historical_expenses - historical_investments - hist_vault_net

    def _get_income_summary(self) -> dict:
        """Calculate income metrics for current month and year."""
        # Use month boundaries for the main summary even if period is day/week
        # because income is generally perceived on a monthly basis
        month_entries = IncomeEntry.objects.filter(
            user=self.user,
            date__gte=self.current_month_start,
            date__lte=self.current_month_end
        )
        
        # Also track what happened specifically in the selected period (day/week)
        period_entries = IncomeEntry.objects.filter(
            user=self.user,
            date__gte=self.current_period_start,
            date__lte=self.current_period_end
        )
        
        year_entries = IncomeEntry.objects.filter(
            user=self.user,
            date__gte=self.current_year_start,
            date__lt=self.today + timedelta(days=1)
        )
        
        # Use self.target_date (the date being viewed) as the reference for 'today' and 'week'
        reference_date = self.target_date
        
        # Month summation (Actuals)
        month_actual = month_entries.filter(actual_amount__gt=0).aggregate(Sum('actual_amount'))['actual_amount__sum'] or Decimal('0')
        month_expected_total = month_entries.aggregate(Sum('expected_amount'))['expected_amount__sum'] or Decimal('0')
        month_committed = month_entries.filter(income_layer='committed').aggregate(Sum('expected_amount'))['expected_amount__sum'] or Decimal('0')
        
        # Day summation for the viewed day
        day_entries = IncomeEntry.objects.filter(user=self.user, date=reference_date, actual_amount__gt=0)
        day_actual = day_entries.aggregate(Sum('actual_amount'))['actual_amount__sum'] or Decimal('0')
        
        # Week summation for the viewed week
        week_start = reference_date - datetime.timedelta(days=reference_date.weekday())
        week_entries = IncomeEntry.objects.filter(user=self.user, date__gte=week_start, date__lte=reference_date, actual_amount__gt=0)
        week_actual = week_entries.aggregate(Sum('actual_amount'))['actual_amount__sum'] or Decimal('0')
        
        # Period summation (Day/Week/Month depending on selection)
        period_actual = period_entries.filter(actual_amount__gt=0).aggregate(Sum('actual_amount'))['actual_amount__sum'] or Decimal('0')
        year_actual = year_entries.filter(actual_amount__gt=0).aggregate(Sum('actual_amount'))['actual_amount__sum'] or Decimal('0')
        
        # Calculate carry forward
        carry_forward = self._get_carry_forward()
        
        # Calculate monthly average
        monthly_avg = year_actual / Decimal('12') if year_actual > 0 else Decimal('0')
        
        # Variance: actual vs expected for current month
        variance = month_actual - month_expected_total
        variance_percent = Decimal('0')
        if month_expected_total > 0:
            variance_percent = (variance / month_expected_total) * Decimal('100')
            
        return {
            'month': { 
                'expected': str(month_expected_total),
                'committed': str(month_committed),
                'actual': str(month_actual),
                'day_actual': str(day_actual),
                'week_actual': str(week_actual),
                'period_actual': str(period_actual),
                'carry_forward': str(carry_forward),
                'total_available': str(month_actual + carry_forward),
                'variance': str(variance),
                'variance_percent': str(variance_percent),
                'entries_count': month_entries.count(),
                'label': self.period_type
            },

            'year': {
                'actual': str(year_actual),
                'monthly_average': str(monthly_avg),
                'entries_count': year_entries.count(),
            },
        }
    
    def _get_expenses_summary(self) -> dict:
        """Calculate expense metrics by category and overall."""
        month_entries = ExpenseEntry.objects.filter(
            user=self.user,
            date__gte=self.current_period_start,
            date__lte=self.current_period_end
        )
        
        year_entries = ExpenseEntry.objects.filter(
            user=self.user,
            date__gte=self.current_year_start,
            date__lt=self.today + timedelta(days=1)
        )
        
        month_total = month_entries.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        year_total = year_entries.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        
        # Bucket breakdown (Expert logic)
        buckets = {
            'fixed': str(month_entries.filter(expense_type='fixed').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')),
            'variable': str(month_entries.filter(expense_type='variable').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')),
            'discretionary': str(month_entries.filter(expense_type='discretionary').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')),
            'one_off': str(month_entries.filter(expense_type='one_off').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')),
        }
        
        # Calculate monthly average (safe division)
        monthly_avg = year_total / Decimal('12') if year_total > 0 else Decimal('0')
        
        # Category breakdown
        categories_breakdown = {}
        for category_code, category_name in ExpenseEntry.CATEGORY_CHOICES:
            category_total = month_entries.filter(category=category_code).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            if category_total > 0 or month_entries.filter(category=category_code).exists():
                categories_breakdown[category_name] = {
                    'amount': str(category_total),
                    'percentage': str(
                        (category_total / month_total * Decimal('100')) if month_total > 0 else Decimal('0')
                    ),
                    'entries': month_entries.filter(category=category_code).count(),
                }
        
        # Top spending categories
        top_categories = sorted(
            [(cat, float(data['amount'])) for cat, data in categories_breakdown.items()],
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        return {
            'month': { 
                'total': str(month_total),
                'buckets': buckets,
                'entries_count': month_entries.count(),
                'categories': categories_breakdown,
                'top_5_categories': [
                    {'category': cat, 'amount': str(amt)}
                    for cat, amt in top_categories
                ],
                'label': self.period_type
            },
            'year': {
                'total': str(year_total),
                'monthly_average': str(monthly_avg),
                'entries_count': year_entries.count(),
            },
        }
    
    def _get_savings_summary(self) -> dict:
        """Calculate investment and vault metrics."""
        # Filter entries up to the end of the current period for consistency
        all_entries = InvestmentEntry.objects.filter(user=self.user, date__lte=self.current_period_end)
        
        total_contributed = all_entries.aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or Decimal('0')
        total_current_value = all_entries.aggregate(Sum('current_value'))['current_value__sum'] or Decimal('0')
        total_goal_target = all_entries.aggregate(Sum('goal_target'))['goal_target__sum'] or Decimal('0')
        total_profit_loss = total_current_value - total_contributed
        
        # Vault balance (total up to the end of the current period)
        total_saves = VaultTransaction.objects.filter(user=self.user, date__lte=self.current_period_end, type='save').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        total_withdraws = VaultTransaction.objects.filter(user=self.user, date__lte=self.current_period_end, type='withdraw').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        vault_balance = total_saves - total_withdraws

        # Calculate goal progress (safe division)
        goal_progress_percent = Decimal('0')
        if total_goal_target > 0:
            goal_progress_percent = (total_current_value / total_goal_target) * Decimal('100')
        goal_progress_percent = min(goal_progress_percent, Decimal('100'))  # Cap at 100%
        
        # Breakdown by investment type
        types_breakdown = {}
        for type_code, type_name in InvestmentEntry.INVESTMENT_TYPE_CHOICES:
            type_entries = all_entries.filter(investment_type=type_code)
            if type_entries.exists():
                current = type_entries.aggregate(Sum('current_value'))['current_value__sum'] or Decimal('0')
                contributed = type_entries.aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or Decimal('0')
                
                types_breakdown[type_name] = {
                    'current_value': str(current),
                    'contributed': str(contributed),
                    'profit_loss': str(current - contributed),
                    'percentage': str(
                        (current / total_current_value * Decimal('100')) if total_current_value > 0 else Decimal('0')
                    ),
                    'entries': type_entries.count(),
                }
        
        # Contribution specifically in this period
        period_contributions = all_entries.filter(
            date__gte=self.current_period_start,
            date__lte=self.current_period_end
        ).aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or Decimal('0')
        
        return {
            'total': {
                'contributed': str(total_contributed),
                'contributed_this_period': str(period_contributions),
                'current_value': str(total_current_value),
                'profit_loss': str(total_profit_loss),
                'goal_target': str(total_goal_target),
                'goal_progress_percent': str(goal_progress_percent),
                'vault_balance': str(vault_balance),
                'entries_count': all_entries.count(),
            },
            'by_type': types_breakdown,
        }
    
    def _get_budget_summary(self) -> dict:
        """Calculate budget utilization and tracking for the selected period."""
        budgets = CategoryBudget.objects.filter(user=self.user)
        
        period_expenses = ExpenseEntry.objects.filter(
            user=self.user,
            date__gte=self.current_period_start,
            date__lte=self.current_period_end
        )
        
        # Merged budgets by category
        merged_budgets = {}
        for b in budgets:
            if b.category not in merged_budgets:
                merged_budgets[b.category] = {
                    'monthly_budget': b.monthly_budget_ksh,
                    'label': b.get_category_display(),
                    'priority': b.priority
                }
            else:
                merged_budgets[b.category]['monthly_budget'] += b.monthly_budget_ksh
                # Keep the highest priority if different
                priority_map = {'essential': 3, 'important': 2, 'optional': 1, 'variable': 0}
                if priority_map.get(b.priority, 0) > priority_map.get(merged_budgets[b.category]['priority'], 0):
                    merged_budgets[b.category]['priority'] = b.priority

        # Calculate scaling factor based on number of days in period vs month
        period_days = (self.current_period_end - self.current_period_start).days + 1
        month_days = (self.current_month_end - self.current_month_start).days + 1
        scaling_factor = Decimal(str(period_days)) / Decimal(str(month_days))
        
        total_monthly_budget = sum(b['monthly_budget'] for b in merged_budgets.values())
        total_scaled_budget = total_monthly_budget * scaling_factor
        total_spent = period_expenses.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        remaining = total_scaled_budget - total_spent
        
        budget_utilization = Decimal('0')
        if total_scaled_budget > 0:
            budget_utilization = (total_spent / total_scaled_budget) * Decimal('100')
        
        # Category-level tracking
        category_tracking = {}
        for cat_code, b_data in merged_budgets.items():
            scaled_cat_budget = b_data['monthly_budget'] * scaling_factor
            
            # Special case for investments (formerly savings): actual comes from InvestmentEntry
            if cat_code == 'savings':
                spent = InvestmentEntry.objects.filter(
                    user=self.user,
                    date__gte=self.current_period_start,
                    date__lte=self.current_period_end
                ).aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or Decimal('0')
                
                monthly_spent = InvestmentEntry.objects.filter(
                    user=self.user,
                    date__gte=self.current_month_start,
                    date__lte=self.current_month_end
                ).aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or Decimal('0')
            else:
                period_cat_expenses = period_expenses.filter(category=cat_code)
                spent = period_cat_expenses.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
                
                monthly_cat_expenses = ExpenseEntry.objects.filter(
                    user=self.user,
                    category=cat_code,
                    date__gte=self.current_month_start,
                    date__lte=self.current_month_end
                )
                monthly_spent = monthly_cat_expenses.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            
            monthly_utilization = (monthly_spent / b_data['monthly_budget'] * 100) if b_data['monthly_budget'] > 0 else Decimal('0')
            
            remaining_cat = scaled_cat_budget - spent
            utilization = (spent / scaled_cat_budget * 100) if scaled_cat_budget > 0 else 0
            
            status = 'on_track'
            if utilization > 100:
                status = 'exceeded'
            elif utilization > 80:
                status = 'warning'

            category_tracking[b_data['label']] = {
                'category': cat_code,
                'budget': str(scaled_cat_budget),
                'monthly_budget': str(b_data['monthly_budget']),
                'spent': str(spent),
                'monthly_spent': str(monthly_spent),
                'remaining': str(remaining_cat),
                'utilization_percent': str(utilization),
                'monthly_utilization_percent': str(monthly_utilization),
                'priority': b_data['priority'],
                'status': status,
            }
        
        # Categories exceeding budget or burning too fast
        exceeded_categories = [
            cat for cat, data in category_tracking.items()
            if data['status'] in ['exceeded', 'warning']
        ]
        
        return {
            'total': {
                'budget': str(total_scaled_budget),
                'monthly_budget': str(total_monthly_budget),
                'spent': str(total_spent),
                'remaining': str(remaining),
                'utilization_percent': str(budget_utilization),
                'days_in_period': period_days,
            },
            'by_category': category_tracking,
            'status': 'on_track' if budget_utilization <= Decimal('100') else 'exceeded',
            'exceeded_categories': exceeded_categories,
            'budgets_count': budgets.count(),
        }


    def _get_notifications(self) -> list:
        """
        Unified notification engine for the dashboard.
        """
        notifications = []
        
        # 1. Upcoming Bills (Next 3 Days)
        upcoming = self._get_upcoming_recurring()
        for u in upcoming:
            days_until = u['day'] - self.today.day
            if 0 <= days_until <= 3:
                notifications.append({
                    'type': 'alert',
                    'severity': 'high' if days_until <= 1 else 'medium',
                    'title': 'Upcoming Automation',
                    'message': f"{u['description']} (KSh {u['amount']}) is due in {days_until} days.",
                    'amount': u['amount'],
                    'date': self.today.isoformat(),
                    'icon': 'alert'
                })

        # 2. Recently Processed (Last 24 Hours)
        from recurring.models import RecurringTransaction
        recently_done = RecurringTransaction.objects.filter(
            user=self.user,
            last_processed_date=self.today
        )
        for r in recently_done:
            notifications.append({
                'type': 'budget',
                'severity': 'low',
                'title': 'Automation Processed',
                'message': f"Successfully logged {r.description} for KSh {r.amount}.",
                'amount': str(r.amount),
                'date': self.today.isoformat(),
                'icon': 'budget'
            })

        # 3. Spending Velocity Alert
        capacity = Decimal(self._get_income_summary()['month']['total_available'])
        expense_total = Decimal(self._get_expenses_summary()['month']['total'])
        if capacity > 0:
            utilization = (expense_total / capacity) * 100
            month_progress = (self.today.day / 30) * 100 # Approx
            if utilization > month_progress + 15:
                notifications.append({
                    'type': 'alert',
                    'severity': 'high',
                    'title': 'High Spending Velocity',
                    'message': f"You've used {utilization:.1f}% of your budget while only {month_progress:.1f}% of the month has passed.",
                    'date': self.today.isoformat(),
                    'icon': 'alert'
                })

        return notifications


    def get_statement(self) -> dict:
        """
        Generate a professional financial statement for the selected period.
        """
        # 1. Opening Balance (All time before current_period_start)
        opening_balance = self._get_carry_forward()
        
        # 2. Period Activity
        expenses = ExpenseEntry.objects.filter(
            user=self.user,
            date__gte=self.current_period_start,
            date__lte=self.current_period_end
        ).order_by('date', 'created_at')
        
        income = IncomeEntry.objects.filter(
            user=self.user,
            date__gte=self.current_period_start,
            date__lte=self.current_period_end
        ).order_by('date', 'created_at')
        
        savings = InvestmentEntry.objects.filter(
            user=self.user,
            date__gte=self.current_period_start,
            date__lte=self.current_period_end
        ).order_by('date', 'created_at')
        
        vault = VaultTransaction.objects.filter(
            user=self.user,
            date__gte=self.current_period_start,
            date__lte=self.current_period_end
        ).order_by('date', 'created_at')
        
        # Merge and sort transactions
        transactions = []
        for e in expenses:
            transactions.append({
                'id': str(e.id),
                'date': e.date.isoformat(),
                'time': e.created_at.strftime('%H:%M'),
                'created_at': e.created_at.isoformat(),
                'description': e.description,
                'category': e.get_category_display(),
                'type': 'expense',
                'amount': str(e.amount),
                'reference': f"EXP-{str(e.id)[:8].upper()}"
            })

        for i in income:
            transactions.append({
                'id': str(i.id),
                'date': i.date.isoformat(),
                'time': i.created_at.strftime('%H:%M'),
                'created_at': i.created_at.isoformat(),
                'description': i.description or i.get_income_source_display(),
                'category': 'Income',
                'type': 'income',
                'amount': str(i.actual_amount),
                'reference': f"INC-{str(i.id)[:8].upper()}"
            })

        for s in savings:
            transactions.append({
                'id': str(s.id),
                'date': s.date.isoformat(),
                'time': s.created_at.strftime('%H:%M'),
                'created_at': s.created_at.isoformat(),
                'description': f"Investment: {s.institution}",
                'category': 'Investment',
                'type': 'investment',
                'amount': str(s.amount_contributed),
                'reference': f"INV-{str(s.id)[:8].upper()}"
            })

        for v in vault:
            transactions.append({
                'id': str(v.id),
                'date': v.date.isoformat(),
                'time': v.created_at.strftime('%H:%M'),
                'created_at': v.created_at.isoformat(),
                'description': f"Vault: {v.get_type_display()}",
                'category': 'Vault',
                'type': 'vault',
                'sub_type': v.type, # 'save' or 'withdraw'
                'amount': str(v.amount),
                'reference': f"VLT-{str(v.id)[:8].upper()}"
            })
            
        transactions.sort(key=lambda x: (x['date'], x['created_at']))

        
        # Calculate running balance
        running = opening_balance
        for tx in transactions:
            if tx['type'] == 'income' or (tx['type'] == 'vault' and tx['sub_type'] == 'withdraw'):
                running += Decimal(tx['amount'])
            else:
                running -= Decimal(tx['amount'])
            tx['balance'] = str(running)
            
        return {
            'period': {
                'start': self.current_period_start.isoformat(),
                'end': self.current_period_end.isoformat(),
                'type': self.period_type,
                'label': self.current_period_start.strftime('%B %Y') if self.period_type == 'month' else f"{self.current_period_start} to {self.current_period_end}"
            },
            'opening_balance': str(opening_balance),
            'closing_balance': str(running),
            'total_income': str(sum(Decimal(tx['amount']) for tx in transactions if tx['type'] == 'income')),
            'total_expenses': str(sum(Decimal(tx['amount']) for tx in transactions if tx['type'] == 'expense')),
            'total_savings': str(sum(Decimal(tx['amount']) for tx in transactions if tx['type'] == 'investment')),
            'transactions': transactions,
            'user': {
                'name': self.user.display_name or self.user.email,
                'account_id': str(self.user.id)[:12].upper()
            }
        }
        
    def _get_recent_transactions(self, count=30) -> list:
        """Get recent transactions for AI to analyze patterns."""
        expenses = ExpenseEntry.objects.filter(user=self.user).order_by('-date')[:count]
        income = IncomeEntry.objects.filter(user=self.user).order_by('-date')[:count]
        
        txs = []
        for e in expenses:
            txs.append({
                'date': e.date.isoformat() if e.date else None,
                'type': 'expense',
                'category': e.category,
                'amount': str(e.amount),
                'description': e.description
            })
            
        for i in income:
            txs.append({
                'date': i.date.isoformat() if i.date else None,
                'type': 'income',
                'category': 'Income',
                'amount': str(i.actual_amount),
                'description': i.description
            })
            
        # Sort by date and take the most recent
        txs.sort(key=lambda x: x['date'] or '', reverse=True)
        return txs[:count]

    def _get_upcoming_recurring(self) -> list:
        """Identify active recurring templates that haven't fired yet this month."""
        from recurring.models import RecurringTransaction
        
        active = RecurringTransaction.objects.filter(user=self.user, is_active=True)
        upcoming = []
        
        for rec in active:
            # Check if processed this month
            already_done = False
            if rec.last_processed_date:
                if rec.frequency == 'monthly':
                    already_done = rec.last_processed_date.month == self.today.month and \
                                   rec.last_processed_date.year == self.today.year
                elif rec.frequency == 'weekly':
                    # If done in last 6 days
                    already_done = (self.today - rec.last_processed_date).days < 7

            if not already_done:
                upcoming.append({
                    'id': str(rec.id),
                    'description': rec.description,
                    'amount': str(rec.amount),
                    'type': rec.type,
                    'category': rec.category,
                    'day': rec.day_of_period,
                    'frequency': rec.frequency
                })
        
        # Sort by day
        upcoming.sort(key=lambda x: x['day'])
        return upcoming

