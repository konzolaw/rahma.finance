"""Unit tests for User model."""
from django.test import TestCase
from django.contrib.auth import authenticate
from decimal import Decimal

from .models import User


class UserModelTests(TestCase):
    """Tests for the custom User model."""
    
    def setUp(self):
        """Create test user."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            display_name='Test User',
            expected_monthly_income=Decimal('50000.00')
        )
    
    def test_user_creation(self):
        """Test basic user creation."""
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.display_name, 'Test User')
        self.assertEqual(self.user.expected_monthly_income, Decimal('50000.00'))
        self.assertTrue(self.user.check_password('testpass123'))
    
    def test_email_is_username(self):
        """Test that email is used as username field."""
        self.assertEqual(self.user.username, self.user.email)
    
    def test_user_str(self):
        """Test string representation."""
        self.assertEqual(str(self.user), 'Test User (test@example.com)')
    
    def test_expected_income_zero(self):
        """Test expected monthly income can be zero."""
        user = User.objects.create_user(
            email='zero@example.com',
            password='pass123',
            display_name='Zero Income',
            expected_monthly_income=Decimal('0.00')
        )
        self.assertEqual(user.expected_monthly_income, Decimal('0.00'))
    
    def test_uuid_primary_key(self):
        """Test that user has UUID primary key."""
        self.assertIsNotNone(self.user.id)
        self.assertEqual(len(str(self.user.id)), 36)  # UUID format: 8-4-4-4-12
    
    def test_timestamps(self):
        """Test created_at and updated_at timestamps."""
        self.assertIsNotNone(self.user.created_at)
        self.assertIsNotNone(self.user.updated_at)
