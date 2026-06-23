"""Unit tests for InvestmentEntry model."""
from django.test import TestCase
from decimal import Decimal
from datetime import date

from users.models import User
from .models import InvestmentEntry


class InvestmentEntryModelTests(TestCase):
    """Tests for InvestmentEntry model."""
    
    def setUp(self):
        """Create test user."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            display_name='Test User'
        )
    
    def test_investment_entry_creation(self):
        """Test creating an investment entry."""
        entry = InvestmentEntry.objects.create(
            user=self.user,
            date=date.today(),
            investment_type='sacco',
            institution='Juhudi SACCO',
            amount_contributed=Decimal('10000.00'),
            current_value=Decimal('10500.00')
        )
        self.assertEqual(entry.investment_type, 'sacco')
        self.assertEqual(entry.institution, 'Juhudi SACCO')
    
    def test_all_investment_types(self):
        """Test all 9 investment types."""
        types = ['sacco', 'mmf', 'chama', 'chumz', 'emergency_fund',
                'stocks', 'treasury_bills', 'treasury_bonds', 'crypto']
        for inv_type in types:
            entry = InvestmentEntry.objects.create(
                user=self.user,
                date=date.today(),
                investment_type=inv_type,
                institution='Test',
                amount_contributed=Decimal('5000.00'),
                current_value=Decimal('5000.00')
            )
            self.assertEqual(entry.investment_type, inv_type)
    
    def test_goal_target_optional(self):
        """Test goal_target is optional."""
        entry = InvestmentEntry.objects.create(
            user=self.user,
            date=date.today(),
            investment_type='sacco',
            institution='Test',
            amount_contributed=Decimal('5000.00'),
            current_value=Decimal('5000.00')
        )
        self.assertIsNone(entry.goal_target)
    
    def test_goal_target_with_value(self):
        """Test goal_target can be set."""
        entry = InvestmentEntry.objects.create(
            user=self.user,
            date=date.today(),
            investment_type='sacco',
            institution='Test',
            amount_contributed=Decimal('5000.00'),
            current_value=Decimal('5000.00'),
            goal_target=Decimal('100000.00')
        )
        self.assertEqual(entry.goal_target, Decimal('100000.00'))
