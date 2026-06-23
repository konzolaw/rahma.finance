"""Unit tests for IncomeEntry model."""
from django.test import TestCase
from decimal import Decimal
from datetime import date

from users.models import User
from .models import IncomeEntry


class IncomeEntryModelTests(TestCase):
    """Tests for IncomeEntry model."""
    
    def setUp(self):
        """Create test user."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            display_name='Test User'
        )
    
    def test_income_entry_creation(self):
        """Test creating an income entry."""
        entry = IncomeEntry.objects.create(
            user=self.user,
            date=date.today(),
            income_source='salary',
            actual_amount=Decimal('50000.00'),
            payment_method='mpesa'
        )
        self.assertEqual(entry.income_source, 'salary')
        self.assertEqual(entry.actual_amount, Decimal('50000.00'))
    
    def test_day_of_week_auto_calculated(self):
        """Test that day_of_week is auto-calculated from date."""
        entry = IncomeEntry.objects.create(
            user=self.user,
            date=date(2026, 5, 6),
            income_source='salary',
            actual_amount=Decimal('50000.00')
        )
        self.assertIsNotNone(entry.day_of_week)
    
    def test_all_income_sources(self):
        """Test all 7 income sources."""
        sources = ['salary', 'freelance', 'side_hustles', 'trading',
                  'business', 'dividends', 'online_work']
        for source in sources:
            entry = IncomeEntry.objects.create(
                user=self.user,
                date=date.today(),
                income_source=source,
                actual_amount=Decimal('10000.00')
            )
            self.assertEqual(entry.income_source, source)
    
    def test_expected_amount_optional(self):
        """Test expected_amount is optional."""
        entry = IncomeEntry.objects.create(
            user=self.user,
            date=date.today(),
            income_source='salary',
            actual_amount=Decimal('50000.00')
        )
        self.assertIsNone(entry.expected_amount)
