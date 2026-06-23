"""Unit tests for CategoryBudget model."""
from django.test import TestCase
from decimal import Decimal
from django.db import IntegrityError

from users.models import User
from .models import CategoryBudget


class CategoryBudgetModelTests(TestCase):
    """Tests for CategoryBudget model."""
    
    def setUp(self):
        """Create test user."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            display_name='Test User'
        )
    
    def test_budget_creation(self):
        """Test creating a budget."""
        budget = CategoryBudget.objects.create(
            user=self.user,
            category='food',
            monthly_budget_ksh=Decimal('15000.00'),
            priority='essential'
        )
        self.assertEqual(budget.category, 'food')
        self.assertEqual(budget.monthly_budget_ksh, Decimal('15000.00'))
    
    def test_one_budget_per_category(self):
        """Test unique constraint: one budget per user per category."""
        CategoryBudget.objects.create(
            user=self.user,
            category='food',
            monthly_budget_ksh=Decimal('15000.00')
        )
        with self.assertRaises(IntegrityError):
            CategoryBudget.objects.create(
                user=self.user,
                category='food',
                monthly_budget_ksh=Decimal('20000.00')
            )
    
    def test_all_categories_supported(self):
        """Test all 8 categories can be created."""
        categories = ['food', 'transport', 'housing', 'personal_care', 
                     'entertainment', 'insurance', 'loans_debt', 'additional']
        for category in categories:
            budget = CategoryBudget.objects.create(
                user=self.user,
                category=category,
                monthly_budget_ksh=Decimal('10000.00')
            )
            self.assertEqual(budget.category, category)
