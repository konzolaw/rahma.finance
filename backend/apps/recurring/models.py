import uuid
from django.db import models
from django.core.exceptions import ValidationError

class RecurringTransaction(models.Model):
    """
    Template for transactions that occur regularly (e.g., Rent, Spotify, NHIF).
    
    Attributes:
        type: income / expense
        frequency: monthly / weekly
        day_of_period: day of month (1-31) or day of week (0-6)
    """
    
    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    FREQUENCY_CHOICES = [
        ('monthly', 'Monthly'),
        ('weekly', 'Weekly'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='recurring_transactions')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.CharField(max_length=50) # e.g. 'housing', 'entertainment'
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='monthly')
    day_of_period = models.IntegerField(default=1, help_text="Day of month (1-31) or day of week (0-6)")
    payment_method = models.CharField(max_length=30, default='bank_transfer')
    
    is_active = models.BooleanField(default=True)
    last_processed_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Recurring Transaction'
        verbose_name_plural = 'Recurring Transactions'

    def __str__(self) -> str:
        return f"{self.description} ({format(self.amount, '.2f')} Ksh) - {self.frequency}"

    def clean(self):
        if self.amount <= 0:
            raise ValidationError("Amount must be greater than zero.")
        if self.frequency == 'monthly' and not (1 <= self.day_of_period <= 31):
            raise ValidationError("Day of month must be between 1 and 31.")
        if self.frequency == 'weekly' and not (0 <= self.day_of_period <= 6):
            raise ValidationError("Day of week must be between 0 and 6 (Monday is 0).")
