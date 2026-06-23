"""Income entry models."""
import uuid
from django.db import models
from django.core.exceptions import ValidationError


INCOME_SOURCE_CHOICES = [
    ('salary', 'Salary'),
    ('freelance', 'Freelance Income'),
    ('side_hustles', 'Side Hustles'),
    ('trading', 'Trading Income'),
    ('business', 'Business Income'),
    ('dividends', 'Dividends'),
    ('online_work', 'Online Work'),
]

PAYMENT_METHOD_CHOICES = [
    ('cash', 'Cash'),
    ('mpesa', 'M-Pesa'),
    ('debit_card', 'Debit Card'),
    ('credit_card', 'Credit Card'),
    ('bank_transfer', 'Bank Transfer'),
]


class IncomeEntry(models.Model):
    """
    Record of income received by the user.
    
    Attributes:
        id: UUID primary key
        user: Foreign key to User
        date: Date income was received
        day_of_week: Auto-calculated from date (Mon, Tue, etc.)
        income_source: Selected from dropdown list
        description: Free-text description
        expected_amount: What user expected to receive (Ksh)
        actual_amount: What was actually received (Ksh)
        payment_method: How the money arrived
        notes: Optional comments
        created_at: Record creation timestamp
    """
    
    INCOME_SOURCE_CHOICES = INCOME_SOURCE_CHOICES
    PAYMENT_METHOD_CHOICES = PAYMENT_METHOD_CHOICES
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='income_entries', db_index=True)
    date = models.DateField(db_index=True)
    day_of_week = models.CharField(
        max_length=3,
        editable=False,
        help_text="Auto-calculated from date: Mon, Tue, etc."
    )
    income_source = models.CharField(
        max_length=20,
        choices=INCOME_SOURCE_CHOICES,
        db_index=True
    )
    description = models.CharField(max_length=200)
    expected_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Expected amount in Ksh"
    )
    actual_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Actual amount received in Ksh"
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES
    )
    income_layer = models.CharField(
        max_length=20,
        choices=[('committed', 'Committed'), ('expected', 'Expected'), ('actual', 'Actual')],
        default='actual',
        help_text="Layer 1: Committed, Layer 2: Expected, Layer 3: Actual"
    )
    is_recurring = models.BooleanField(
        default=False,
        help_text="Whether this income happens every month"
    )
    recurrence_day = models.IntegerField(
        null=True,
        blank=True,
        help_text="Day of month (e.g. 25 for salary)"
    )
    variance_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        editable=False,
        help_text="Auto-computed: actual - expected"
    )
    variance_percent = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        editable=False,
        help_text="Auto-computed: variance / expected * 100"
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Income Entry'
        verbose_name_plural = 'Income Entries'
        indexes = [
            models.Index(fields=['user', 'date']),
        ]
    
    def __str__(self) -> str:
        return f"{self.get_income_source_display()} - Ksh {self.actual_amount} on {self.date.strftime('%d/%m/%Y')}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate day_of_week and variance."""
        if self.date:
            self.day_of_week = self.date.strftime("%a")
            
        if self.expected_amount and self.actual_amount:
            self.variance_amount = self.actual_amount - self.expected_amount
            if self.expected_amount > 0:
                from decimal import Decimal
                self.variance_percent = (self.variance_amount / self.expected_amount * 100).quantize(Decimal("0.01"))
            else:
                self.variance_percent = 0
                
        super().save(*args, **kwargs)
    
    def clean(self):
        """Validate that actual_amount is positive."""
        if self.actual_amount and self.actual_amount < 0:
            raise ValidationError("Actual amount must be greater than or equal to zero.")
