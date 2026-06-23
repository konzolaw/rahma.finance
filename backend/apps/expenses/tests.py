"""Unit tests for ExpenseEntry model."""
from django.test import TestCase
from decimal import Decimal
from datetime import date

from users.models import User
from .models import ExpenseEntry


class ExpenseEntryModelTests(TestCase):
    """Tests for ExpenseEntry model."""
    
    def setUp(self):
        """Create test user."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            display_name='Test User'
        )
    
    def test_expense_entry_creation(self):
        """Test creating an expense entry."""
        entry = ExpenseEntry.objects.create(
            user=self.user,
            category='food',
            date=date.today(),
            description='Groceries',
            subcategory='Groceries',
            amount=Decimal('5000.00'),
            payment_method='mpesa'
        )
        self.assertEqual(entry.category, 'food')
        self.assertEqual(entry.amount, Decimal('5000.00'))
    
    def test_day_of_week_auto_calculated(self):
        """Test that day_of_week is auto-calculated."""
        entry = ExpenseEntry.objects.create(
            user=self.user,
            category='food',
            date=date(2026, 5, 6),
            subcategory='Groceries',
            amount=Decimal('5000.00')
        )
        self.assertIsNotNone(entry.day_of_week)
    
    def test_all_categories(self):
        """Test all 8 categories."""
        categories = ['food', 'transport', 'housing', 'personal_care',
                     'entertainment', 'insurance', 'loans_debt', 'additional']
        for category in categories:
            entry = ExpenseEntry.objects.create(
                user=self.user,
                category=category,
                date=date.today(),
                subcategory='Test',
                amount=Decimal('1000.00')
            )
            self.assertEqual(entry.category, category)
    
    def test_valid_subcategory(self):
        """Test valid subcategory for food."""
        valid_subcategories = ExpenseEntry.SUBCATEGORY_DICT['food']
        self.assertGreater(len(valid_subcategories), 0)
        
        entry = ExpenseEntry.objects.create(
            user=self.user,
            category='food',
            date=date.today(),
            subcategory=valid_subcategories[0],
            amount=Decimal('1000.00')
        )
        self.assertEqual(entry.subcategory, valid_subcategories[0])
