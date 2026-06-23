"""Savings and investment entry models."""
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone


INVESTMENT_TYPE_CHOICES = [
    ('sacco', 'SACCO'),
    ('mmf', 'MMF (Money Market Fund)'),
    ('chama', 'Chama'),
    ('chumz', 'CHUMZ'),
    ('emergency_fund', 'Emergency Fund'),
    ('stocks', 'Stocks'),
    ('treasury_bills', 'Treasury Bills'),
    ('treasury_bonds', 'Treasury Bonds'),
    ('crypto', 'Crypto'),
]


class InvestmentEntry(models.Model):
    """
    Investment entry (MMF, SACCO, etc.)
    """
    
    INVESTMENT_TYPE_CHOICES = INVESTMENT_TYPE_CHOICES
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='investment_entries', db_index=True)
    date = models.DateField(db_index=True)
    investment_type = models.CharField(
        max_length=20,
        choices=INVESTMENT_TYPE_CHOICES,
        db_index=True
    )
    institution = models.CharField(
        max_length=200,
        help_text="Name of institution or account (e.g. CIC MMF, Stanbic SACCO)"
    )
    amount_contributed = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Amount deposited in Ksh"
    )
    current_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Current market or book value in Ksh"
    )
    goal_target = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Target amount for this investment in Ksh"
    )
    goal_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="e.g. 'House Deposit', 'Education Fund'"
    )
    goal_deadline = models.DateField(
        null=True,
        blank=True,
        help_text="Target date to reach the goal"
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Investment Entry'
        verbose_name_plural = 'Investment Entries'
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'investment_type']),
        ]
    
    def __str__(self) -> str:
        return f"{self.institution} ({self.get_investment_type_display()}) - Ksh {self.current_value}"

class VaultTransaction(models.Model):
    """
    Liquid Savings Vault movements (Save/Withdraw).
    """
    TYPE_CHOICES = [
        ('save', 'Save (Move to Vault)'),
        ('withdraw', 'Withdraw (Take from Vault)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='vault_transactions')
    date = models.DateField(default=timezone.now, db_index=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Vault Transaction'
        verbose_name_plural = 'Vault Transactions'

    def __str__(self):
        return f"{self.type.upper()} - KSh {self.amount}"
