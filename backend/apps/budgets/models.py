"""Budget models for managing monthly spending limits."""
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
    ('savings', 'Savings & Investments'),
]

PRIORITY_CHOICES = [
    ('essential', 'Essential'),
    ('important', 'Important'),
    ('optional', 'Optional'),
    ('variable', 'Variable'),
]


class CategoryBudget(models.Model):
    """
    User's monthly budget for each expense category.
    
    Attributes:
        id: UUID primary key
        user: Foreign key to User
        category: One of the 8 fixed categories (NEVER change)
        monthly_budget_ksh: User-defined monthly limit in Ksh
        priority: Essential / Important / Optional / Variable
        notes: Optional user reminder note
        created_at: Record creation timestamp
        updated_at: Last modification timestamp
    """
    
    CATEGORY_CHOICES = CATEGORY_CHOICES
    PRIORITY_CHOICES = PRIORITY_CHOICES
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='category_budgets', db_index=True)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        db_index=True,
        help_text="One of 8 fixed categories"
    )
    monthly_budget_ksh = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Monthly budget limit in Ksh"
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='optional'
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category']
        unique_together = ('user', 'category')
        verbose_name = 'Category Budget'
        verbose_name_plural = 'Category Budgets'
        indexes = [
            models.Index(fields=['user', 'category']),
        ]
    
    def __str__(self) -> str:
        return f"{self.get_category_display()} - Ksh {self.monthly_budget_ksh}"
    
    def clean(self):
        """Validate that monthly_budget_ksh is positive."""
        if self.monthly_budget_ksh < 0:
            raise ValidationError("Monthly budget must be greater than or equal to zero.")
