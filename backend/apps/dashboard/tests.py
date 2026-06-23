"""Unit tests for Dashboard services."""
from django.test import TestCase
from decimal import Decimal
from datetime import date

from users.models import User
from income.models import IncomeEntry
from expenses.models import ExpenseEntry
from savings.models import InvestmentEntry
from budgets.models import CategoryBudget
from .services import DashboardService


class DashboardServiceTests(TestCase):
    """Tests for DashboardService calculations."""
    
    def setUp(self):
        """Create test user with sample data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            display_name='Test User',
            expected_monthly_income=Decimal('50000.00')
        )
        self.service = DashboardService(self.user)
    
    def test_summary_returns_dict(self):
        """Test get_summary returns a dictionary."""
        summary = self.service.get_summary()
        self.assertIsInstance(summary, dict)
        self.assertIn('income', summary)
        self.assertIn('expenses', summary)
        self.assertIn('savings', summary)
        self.assertIn('budgets', summary)
    
    def test_income_summary(self):
        """Test income summary calculation."""
        IncomeEntry.objects.create(
            user=self.user,
            date=date.today(),
            income_source='salary',
            actual_amount=Decimal('50000.00')
        )
        income_summary = self.service._get_income_summary()
        self.assertIn('month', income_summary)
        self.assertIn('year', income_summary)
    
    def test_expense_summary(self):
        """Test expense summary calculation."""
        ExpenseEntry.objects.create(
            user=self.user,
            category='food',
            date=date.today(),
            subcategory='Groceries',
            amount=Decimal('5000.00')
        )
        expense_summary = self.service._get_expenses_summary()
        self.assertIn('month', expense_summary)
        self.assertIn('year', expense_summary)
    
    def test_savings_summary(self):
        """Test savings summary calculation."""
        InvestmentEntry.objects.create(
            user=self.user,
            date=date.today(),
            investment_type='sacco',
            institution='Test',
            amount_contributed=Decimal('10000.00'),
            current_value=Decimal('10500.00')
        )
        savings_summary = self.service._get_savings_summary()
        self.assertIn('total', savings_summary)
        self.assertIn('by_type', savings_summary)
    
    def test_budget_summary(self):
        """Test budget summary calculation."""
        CategoryBudget.objects.create(
            user=self.user,
            category='food',
            monthly_budget_ksh=Decimal('15000.00')
        )
        budget_summary = self.service._get_budget_summary()
        self.assertIn('total', budget_summary)
        self.assertIn('by_category', budget_summary)
