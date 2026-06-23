"""Expense entry models covering all 8 categories."""
import uuid
from django.db import models
from django.core.exceptions import ValidationError


CATEGORY_CHOICES = [
    ('food', 'Food'),
    ('transport', 'Transport'),
    ('housing', 'Housing'),
    ('personal_care', 'Personal Care'),
    ('entertainment', 'Entertainment'),
    ('insurance', 'Insurance'),
    ('loans_debt', 'Loans & Debt'),
    ('additional', 'Additional'),
    ('miscellaneous', 'Miscellaneous'),
    ('savings', 'Savings'),
]

# Subcategories for each expense category (FIXED - DO NOT CHANGE)
SUBCATEGORIES = {
    'food': ['Groceries', 'Dining Out', 'Snacks', 'Meal Prep', 'Fast Food', 'Coffee', 'Extra 1', 'Extra 2'],
    'transport': ['Matatu', 'Fuel', 'Uber / Bolt', 'Parking', 'Car Maintenance', 'Motorcycle Transport (boda boda)', 'Travel'],
    'housing': ['Rent', 'Electricity (Kenya Power)', 'Water', 'Internet', 'Repairs & Maintenance', 'Furniture & Home Items', 'Cleaning Supplies'],
    'personal_care': ['Haircuts', 'Gym Membership', 'Toiletries', 'Skincare', 'Barber', 'Clothing & Shoes', 'Laundry'],
    'entertainment': ['Netflix', 'Spotify', 'Outings', 'Vacations & Holidays', 'Gaming', 'Movies & Cinema', 'Events & Concerts'],
    'insurance': ['NHIF / SHA', 'Medical Insurance (private)', 'Car Insurance', 'Life Insurance'],
    'loans_debt': ['HELB', 'Fuliza', 'M-Shwari', 'Bank Loan', 'Credit Card', 'Mobile Loan (KCB M-Pesa / Tala / Branch)', 'Extra Loan 1', 'Extra Loan 2'],
    'additional': ['Airtime / Data Bundles', 'Family Support', 'Donations & Church / Tithe', 'Education', 'Business Expenses', 'Medical Emergencies'],
    'miscellaneous': ['General', 'Pocket Money', 'Tips & Gratuities', 'Gifts', 'Other'],
    'savings': ['M-Pesa MMF', 'Bank Savings', 'SACCO Deposit', 'Chama Contribution', 'Chumz', 'Emergency Fund', 'Stocks / Shares', 'Crypto'],
}


PAYMENT_METHOD_CHOICES = [
    ('cash', 'Cash'),
    ('mpesa', 'M-Pesa'),
    ('debit_card', 'Debit Card'),
    ('credit_card', 'Credit Card'),
    ('bank_transfer', 'Bank Transfer'),
]


class ExpenseEntry(models.Model):
    """
    Expense entry for one of 8 fixed categories.
    
    Attributes:
        id: UUID primary key
        user: Foreign key to User
        category: One of 8 fixed categories
        date: Date expense was incurred
        day_of_week: Auto-calculated from date
        description: What was purchased
        subcategory: Specific subcategory within main category
        payment_method: How it was paid
        amount: Amount spent in Ksh
        notes: Optional comments
        created_at: Record creation timestamp
    """
    
    CATEGORY_CHOICES = CATEGORY_CHOICES
    PAYMENT_METHOD_CHOICES = PAYMENT_METHOD_CHOICES
    SUBCATEGORY_DICT = SUBCATEGORIES
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='expense_entries', db_index=True)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        db_index=True,
        help_text="One of 8 fixed categories"
    )
    date = models.DateField(db_index=True)
    day_of_week = models.CharField(
        max_length=3,
        editable=False,
        help_text="Auto-calculated from date: Mon, Tue, etc."
    )
    description = models.CharField(max_length=200)
    subcategory = models.CharField(max_length=100)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Amount spent in Ksh"
    )
    expense_type = models.CharField(
        max_length=20,
        choices=[
            ('fixed', 'Fixed'),           # Rent, NHIF
            ('variable', 'Variable'),     # Groceries, Fuel
            ('one_off', 'One-off'),       # Medical, Repair
            ('discretionary', 'Discretionary'), # Eating out, Netflix
        ],
        default='variable',
        help_text="Classification for financial logic"
    )
    is_recurring = models.BooleanField(
        default=False,
        help_text="Whether this expense happens every month"
    )
    recurrence_day = models.IntegerField(
        null=True,
        blank=True,
        help_text="Day of month"
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Expense Entry'
        verbose_name_plural = 'Expense Entries'
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'category', 'date']),
        ]
    
    def __str__(self) -> str:
        return f"{self.get_category_display()} - {self.subcategory} - Ksh {self.amount} on {self.date.strftime('%d/%m/%Y')}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate day_of_week and default classification."""
        if self.date:
            self.day_of_week = self.date.strftime("%a")
            
        # Default classification logic based on category/subcategory
        if not self.expense_type or self.expense_type == 'variable':
            fixed_subcategories = ['Rent', 'Insurance', 'Netflix', 'Spotify', 'Spotify / Youtube', 'NHIF / SHA']
            if self.subcategory in fixed_subcategories:
                self.expense_type = 'fixed'
            elif self.category == 'entertainment':
                self.expense_type = 'discretionary'
                
        super().save(*args, **kwargs)
    
    def clean(self):
        """Validate that amount is positive."""
        if self.amount < 0:
            raise ValidationError("Amount must be greater than zero.")
