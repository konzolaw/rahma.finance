"""Financial insights and ratio calculations.

Calculate financial health metrics, ratios, trends, and alerts.
All calculations use Decimal for precision.
"""
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, Count, Q
from datetime import timedelta
from dateutil.relativedelta import relativedelta

from users.models import User
from income.models import IncomeEntry
from expenses.models import ExpenseEntry
from savings.models import InvestmentEntry, VaultTransaction
from budgets.models import CategoryBudget


class InsightsService:
    """Calculate financial insights and analysis metrics."""
    
    def __init__(self, user: User, month: int = None, year: int = None):
        """Initialize service with user context and specific period."""
        self.user = user
        self.today = timezone.now().date()
        
        # Use provided month/year or default to current
        target_month = month or self.today.month
        target_year = year or self.today.year
        
        import datetime
        self.current_month_start = datetime.date(target_year, target_month, 1)
        # Rule 9: Calendar month boundaries (1st to last day)
        next_month = self.current_month_start + timedelta(days=32)
        self.current_month_end = next_month.replace(day=1) - timedelta(days=1)
        self.current_year_start = self.current_month_start.replace(month=1, day=1)
    
    def get_all_insights(self) -> dict:
        """Get all financial insights in one call."""
        return {
            'ratios': self.get_financial_ratios(),
            'trends': self.get_trends(),
            'alerts': self.get_alerts(),
            'recommendations': self.get_recommendations(),
            'emergency_fund_months': float(self._calculate_emergency_fund_months()),
            'generated_at': timezone.now().isoformat(),
        }
    
    def _calculate_raw_ratios(self) -> dict:
        """Calculate raw numeric ratios for internal logic."""
        expected_monthly = self.user.expected_monthly_income or Decimal('0')
        yearly_expected = expected_monthly * Decimal('12')
        
        year_expenses = ExpenseEntry.objects.filter(
            user=self.user,
            date__gte=self.current_year_start,
            date__lt=self.today + timedelta(days=1)
        )
        
        investments = InvestmentEntry.objects.filter(user=self.user)
        vault = VaultTransaction.objects.filter(user=self.user)
        
        def calc_ratio(numerator, denominator):
            if denominator == 0 or denominator is None:
                return Decimal('0')
            return (numerator / denominator) * Decimal('100')

        total_contributed_yearly = investments.filter(
            date__gte=self.current_year_start
        ).aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or Decimal('0')
        
        # Include Vault Net in savings rate
        vault_saves_yearly = vault.filter(type='save', date__gte=self.current_year_start).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        vault_withdraws_yearly = vault.filter(type='withdraw', date__gte=self.current_year_start).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        vault_net_yearly = vault_saves_yearly - vault_withdraws_yearly

        savings_rate = calc_ratio(total_contributed_yearly + vault_net_yearly, yearly_expected)
        
        total_yearly_expenses = year_expenses.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        expense_ratio = calc_ratio(total_yearly_expenses, yearly_expected)
        
        debt_payments = year_expenses.filter(category='loans_debt').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        debt_to_income = calc_ratio(debt_payments, yearly_expected)
        
        total_current = investments.aggregate(Sum('current_value'))['current_value__sum'] or Decimal('0')
        total_goal = investments.aggregate(Sum('goal_target'))['goal_target__sum'] or Decimal('0')
        goal_progress = calc_ratio(total_current, total_goal)
        
        # Calculate budget variance (simplified for this context)
        month_expenses = ExpenseEntry.objects.filter(
            user=self.user,
            date__gte=self.current_month_start,
            date__lte=self.current_month_end
        ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        
        budgets = CategoryBudget.objects.filter(user=self.user).aggregate(Sum('monthly_budget_ksh'))['monthly_budget_ksh__sum'] or Decimal('0')
        budget_variance = calc_ratio(month_expenses - budgets, budgets) if month_expenses > budgets else Decimal('0')

        return {
            'savings_rate': savings_rate,
            'expense_ratio': expense_ratio,
            'debt_to_income': debt_to_income,
            'goal_progress': goal_progress,
            'budget_variance': budget_variance,
        }

    def get_financial_ratios(self) -> list:
        """
        Calculate key financial ratios with detailed breakdowns.
        """
        raw = self._calculate_raw_ratios()
        expected_monthly = self.user.expected_monthly_income or Decimal('0')
        yearly_expected = expected_monthly * Decimal('12')
        
        ratios = []
        
        # Savings Rate
        ratios.append({
            'id': 'ratio_savings_rate',
            'type': 'ratio',
            'ratio_name': 'Savings Rate',
            'title': 'Savings Rate',
            'percentage': str(raw['savings_rate'].quantize(Decimal('0.1'))),
            'benchmark': '20%',
            'status': 'good' if raw['savings_rate'] >= 20 else 'warning' if raw['savings_rate'] >= 10 else 'critical',
            'description': 'Portion of expected income being saved/invested.',
            'formula': '(Total Savings / Expected Income) x 100',
            'inputs': {
                'numerator': str(InvestmentEntry.objects.filter(user=self.user, date__gte=self.current_year_start).aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or 0),
                'denominator': str(yearly_expected),
                'label': 'Year-to-Date'
            }
        })
        
        # Expense Ratio
        ratios.append({
            'id': 'ratio_expense_ratio',
            'type': 'ratio',
            'ratio_name': 'Expense Ratio',
            'title': 'Expense Ratio',
            'percentage': str(raw['expense_ratio'].quantize(Decimal('0.1'))),
            'benchmark': '50%',
            'status': 'good' if raw['expense_ratio'] <= 50 else 'warning' if raw['expense_ratio'] <= 80 else 'critical',
            'description': 'Percentage of expected income spent on expenses.',
            'formula': '(Total Expenses / Expected Income) x 100',
            'inputs': {
                'numerator': str(ExpenseEntry.objects.filter(user=self.user, date__gte=self.current_year_start).aggregate(Sum('amount'))['amount__sum'] or 0),
                'denominator': str(yearly_expected),
                'label': 'Year-to-Date'
            }
        })
        
        # Debt to Income
        ratios.append({
            'id': 'ratio_dti',
            'type': 'ratio',
            'ratio_name': 'Debt-to-Income',
            'title': 'Debt-to-Income',
            'percentage': str(raw['debt_to_income'].quantize(Decimal('0.1'))),
            'benchmark': '15%',
            'status': 'good' if raw['debt_to_income'] <= 15 else 'warning' if raw['debt_to_income'] <= 35 else 'critical',
            'description': 'Ratio of debt repayments to expected monthly income.',
            'formula': '(Debt Payments / Expected Monthly Income) x 100',
            'inputs': {
                'numerator': str(ExpenseEntry.objects.filter(user=self.user, category='loans_debt', date__gte=self.current_month_start).aggregate(Sum('amount'))['amount__sum'] or 0),
                'denominator': str(expected_monthly),
                'label': 'Monthly'
            }
        })
        
        # Goal Progress
        ratios.append({
            'id': 'ratio_goal_progress',
            'type': 'ratio',
            'ratio_name': 'Goal Progress',
            'title': 'Goal Progress',
            'percentage': str(min(raw['goal_progress'], Decimal('100')).quantize(Decimal('0.1'))),
            'benchmark': '100%',
            'status': 'good' if raw['goal_progress'] >= 80 else 'warning' if raw['goal_progress'] >= 40 else 'critical',
            'description': 'Overall progress towards defined savings targets.',
            'formula': '(Current Value / Target Goal) x 100',
            'inputs': {
                'numerator': str(InvestmentEntry.objects.filter(user=self.user, date__gte=self.current_year_start).aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or 0),
                'denominator': str(InvestmentEntry.objects.filter(user=self.user).aggregate(Sum('goal_target'))['goal_target__sum'] or 1),
                'label': 'Portfolio Wide'
            }
        })
        
        return ratios

    def _calculate_emergency_fund_months(self) -> Decimal:
        """Calculate how many months of expenses are covered by emergency fund."""
        # Total Emergency Fund
        emergency_savings = InvestmentEntry.objects.filter(
            user=self.user,
            investment_type='emergency_fund'
        ).aggregate(Sum('current_value'))['current_value__sum'] or Decimal('0')
        
        # Average Monthly Expenses (Last 3 months)
        three_months_ago = self.current_month_start - relativedelta(months=2)
        expenses = ExpenseEntry.objects.filter(
            user=self.user,
            date__gte=three_months_ago,
            date__lt=self.today + timedelta(days=1)
        ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        
        avg_expenses = expenses / Decimal('3') if expenses > 0 else (self.user.expected_monthly_income * Decimal('0.7'))
        
        if avg_expenses <= 0:
            return Decimal('0')
            
        return (emergency_savings / avg_expenses).quantize(Decimal('0.1'))
    
    def get_trends(self) -> dict:
        """Calculate 6-month and 12-month trends."""
        return {
            'income_trend': self._calculate_income_trend(),
            'expense_trend': self._calculate_expense_trend(),
            'savings_trend': self._calculate_savings_trend(),
            'category_trends': self._calculate_category_trends(),
        }
    
    def _calculate_income_trend(self) -> list:
        """Calculate monthly income trend for last 12 months."""
        trend = []
        
        for months_back in range(11, -1, -1):
            month_date = self.today - relativedelta(months=months_back)
            month_start = month_date.replace(day=1)
            month_end = (month_start + relativedelta(months=1)) - timedelta(days=1)
            
            total = IncomeEntry.objects.filter(
                user=self.user,
                date__gte=month_start,
                date__lte=month_end
            ).aggregate(Sum('actual_amount'))['actual_amount__sum'] or Decimal('0')
            
            trend.append({
                'month': month_start.strftime('%Y-%m'),
                'amount': str(total),
            })
        
        return trend
    
    def _calculate_expense_trend(self) -> list:
        """Calculate monthly expense trend for last 12 months."""
        trend = []
        
        for months_back in range(11, -1, -1):
            month_date = self.today - relativedelta(months=months_back)
            month_start = month_date.replace(day=1)
            month_end = (month_start + relativedelta(months=1)) - timedelta(days=1)
            
            total = ExpenseEntry.objects.filter(
                user=self.user,
                date__gte=month_start,
                date__lte=month_end
            ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            
            trend.append({
                'month': month_start.strftime('%Y-%m'),
                'amount': str(total),
            })
        
        return trend
    
    def _calculate_savings_trend(self) -> list:
        """Calculate monthly savings contribution trend."""
        trend = []
        
        for months_back in range(11, -1, -1):
            month_date = self.today - relativedelta(months=months_back)
            month_start = month_date.replace(day=1)
            month_end = (month_start + relativedelta(months=1)) - timedelta(days=1)
            
            total_inv = InvestmentEntry.objects.filter(
                user=self.user,
                date__gte=month_start,
                date__lte=month_end
            ).aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or Decimal('0')
            
            saves = VaultTransaction.objects.filter(user=self.user, type='save', date__gte=month_start, date__lte=month_end).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            withdraws = VaultTransaction.objects.filter(user=self.user, type='withdraw', date__gte=month_start, date__lte=month_end).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            
            trend.append({
                'month': month_start.strftime('%Y-%m'),
                'contributed': str(total_inv + (saves - withdraws)),
            })
        
        return trend
    
    def _calculate_category_trends(self) -> dict:
        """Calculate expense trends by category."""
        trends = {}
        
        for category_code, category_name in ExpenseEntry.CATEGORY_CHOICES:
            category_trend = []
            
            for months_back in range(5, -1, -1):  # 6 months
                month_date = self.today - relativedelta(months=months_back)
                month_start = month_date.replace(day=1)
                month_end = (month_start + relativedelta(months=1)) - timedelta(days=1)
                
                total = ExpenseEntry.objects.filter(
                    user=self.user,
                    category=category_code,
                    date__gte=month_start,
                    date__lte=month_end
                ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
                
                category_trend.append({
                    'month': month_start.strftime('%Y-%m'),
                    'amount': str(total),
                })
            
            # Only include if has any spending
            if any(Decimal(m['amount']) > 0 for m in category_trend):
                trends[category_name] = category_trend
        
        return trends
    
    def get_alerts(self) -> list:
        """Generate financial alerts based on current state."""
        alerts = []
        
        month_expenses = ExpenseEntry.objects.filter(
            user=self.user,
            date__gte=self.current_month_start,
            date__lt=self.today + timedelta(days=1)
        )
        
        budgets = CategoryBudget.objects.filter(user=self.user)
        
        # Alert: Over budget categories
        for budget in budgets:
            spent = month_expenses.filter(category=budget.category).aggregate(
                Sum('amount')
            )['amount__sum'] or Decimal('0')
            
            if spent > budget.monthly_budget_ksh:
                percentage = (spent / budget.monthly_budget_ksh) * Decimal('100')
                alerts.append({
                    'type': 'budget_exceeded',
                    'severity': 'high',
                    'category': budget.get_category_display(),
                    'message': f"Budget exceeded by {percentage - Decimal('100'):.1f}%",
                    'spent': str(spent),
                    'budget': str(budget.monthly_budget_ksh),
                })
            elif spent > (budget.monthly_budget_ksh * Decimal('0.8')):
                percentage = (spent / budget.monthly_budget_ksh) * Decimal('100')
                alerts.append({
                    'type': 'budget_warning',
                    'severity': 'medium',
                    'category': budget.get_category_display(),
                    'message': f"At {percentage:.1f}% of budget",
                    'spent': str(spent),
                    'budget': str(budget.monthly_budget_ksh),
                })
        
        # Alert: No savings/investments this month
        investments_this_month = InvestmentEntry.objects.filter(
            user=self.user,
            date__gte=self.current_month_start,
            date__lt=self.today + timedelta(days=1)
        ).aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or Decimal('0')
        
        vault_saves_this_month = VaultTransaction.objects.filter(
            user=self.user,
            type='save',
            date__gte=self.current_month_start,
            date__lt=self.today + timedelta(days=1)
        ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')

        if (investments_this_month + vault_saves_this_month) == 0 and self.today.day > 7:
            alerts.append({
                'type': 'no_savings',
                'severity': 'low',
                'message': 'No money moved to Vault or Investments this month',
            })
        
        # Alert: Income below expected
        month_income = IncomeEntry.objects.filter(
            user=self.user,
            date__gte=self.current_month_start,
            date__lt=self.today + timedelta(days=1)
        ).aggregate(Sum('actual_amount'))['actual_amount__sum'] or Decimal('0')
        
        expected_month = self.user.expected_monthly_income or Decimal('0')
        if month_income < expected_month and self.today.day > 15 and expected_month > 0:
            variance = ((month_income - expected_month) / expected_month * Decimal('100')).quantize(Decimal('0.01'))
            alerts.append({
                'type': 'low_income',
                'severity': 'medium',
                'message': f'Income {variance}% below expected',
                'expected': str(expected_month),
                'actual': str(month_income),
            })
        
        return alerts
    
    def get_recommendations(self) -> list:
        """Generate personalized financial recommendations."""
        recommendations = []
        raw = self._calculate_raw_ratios()
        
        # Recommendation: Improve savings rate
        savings_rate = raw['savings_rate']
        if savings_rate < Decimal('20'):
            recommendations.append({
                'id': 'increase_savings',
                'priority': 'high',
                'title': 'Increase Savings Rate',
                'description': f'Your savings rate is {savings_rate:.1f}%. Financial experts recommend saving 20-30% of income.',
                'action': 'Review spending in discretionary categories and redirect savings to investments.',
            })
        
        # Recommendation: High expense ratio
        expense_ratio = raw['expense_ratio']
        if expense_ratio > Decimal('80'):
            recommendations.append({
                'id': 'reduce_expenses',
                'priority': 'high',
                'title': 'Reduce Expenses',
                'description': f'Expenses are {expense_ratio:.1f}% of expected income. Consider a detailed budget review.',
                'action': 'Analyze spending patterns and identify areas to cut back.',
            })
        
        # Recommendation: Negative budget variance
        budget_variance = raw['budget_variance']
        if budget_variance > Decimal('10'):
            recommendations.append({
                'id': 'adjust_budgets',
                'priority': 'medium',
                'title': 'Adjust Budget Limits',
                'description': f'Actual spending exceeds budgeted amounts by {budget_variance:.1f}%. Update budgets to match reality.',
                'action': 'Review and adjust monthly budget limits based on recent spending patterns.',
            })
        
        # Recommendation: High debt-to-income
        debt_ratio = raw['debt_to_income']
        if debt_ratio > Decimal('15'):
            recommendations.append({
                'id': 'reduce_debt',
                'priority': 'high',
                'title': 'Reduce Debt Payments',
                'description': f'Debt payments are {debt_ratio:.1f}% of expected income. High debt burden detected.',
                'action': 'Create a debt repayment plan to reduce outstanding loans.',
            })
        
        # Recommendation: Set savings goals
        investments = InvestmentEntry.objects.filter(user=self.user)
        goals_with_targets = investments.filter(goal_target__isnull=False, goal_target__gt=0).count()
        total_investments = investments.count()
        
        if total_investments == 0:
            recommendations.append({
                'id': 'start_saving',
                'priority': 'high',
                'title': 'Start Investing',
                'description': 'No investment records found. Start building wealth through regular growth assets.',
                'action': 'Open investment accounts (SACCO, MMF, etc.) and make regular contributions.',
            })
        elif goals_with_targets == 0:
            recommendations.append({
                'id': 'set_goals',
                'priority': 'medium',
                'title': 'Set Investment Goals',
                'description': 'You have investments but no specific targets. Goals keep you focused.',
                'action': 'Define clear targets for each investment (home, education, retirement, etc.)',
            })
        
        return recommendations
