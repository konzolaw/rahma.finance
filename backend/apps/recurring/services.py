from django.utils import timezone
from datetime import date, timedelta
from .models import RecurringTransaction
from income.models import IncomeEntry
from expenses.models import ExpenseEntry
from django.db import transaction

class RecurringProcessor:
    """Logic to generate entries from recurring templates."""
    
    def __init__(self, user):
        self.user = user
        self.today = timezone.now().date()

    def process_all(self):
        """Check and create all due recurring transactions for the user."""
        active_recurring = RecurringTransaction.objects.filter(user=self.user, is_active=True)
        created_count = 0
        
        with transaction.atomic():
            for rec in active_recurring:
                if self._is_due(rec):
                    self._create_entry(rec)
                    rec.last_processed_date = self.today
                    rec.save()
                    created_count += 1
        
        return created_count

    def _is_due(self, rec) -> bool:
        """Determine if a recurring transaction is due for processing today."""
        if not rec.last_processed_date:
            # If never processed, it's due if the current month's target day has passed or is today
            return self._day_passed_this_month(rec.day_of_period)
            
        # If already processed this month, it's not due
        if rec.frequency == 'monthly':
            return rec.last_processed_date.month != self.today.month or rec.last_processed_date.year != self.today.year
        
        if rec.frequency == 'weekly':
            # Simplified: if last processed more than 6 days ago and today is the target day of week
            days_since = (self.today - rec.last_processed_date).days
            return days_since >= 7 and self.today.weekday() == rec.day_of_period
            
        return False

    def _day_passed_this_month(self, target_day) -> bool:
        """Check if the target day of the current month has been reached."""
        return self.today.day >= target_day

    def _create_entry(self, rec):
        """Create the actual IncomeEntry or ExpenseEntry from the template."""
        if rec.type == 'income':
            IncomeEntry.objects.create(
                user=self.user,
                date=self.today,
                income_source=rec.category, # IncomeEntry uses income_source
                description=f"[Recurring] {rec.description}",
                expected_amount=rec.amount,
                actual_amount=rec.amount,
                payment_method=rec.payment_method, # Use template payment method
                income_layer='actual'
            )
        else:
            # For expenses, we need a subcategory. 
            # We'll use 'General' or the first available for that category.
            from expenses.models import SUBCATEGORIES
            category_subs = SUBCATEGORIES.get(rec.category, ['General'])
            subcategory = category_subs[0] if category_subs else 'General'
            
            ExpenseEntry.objects.create(
                user=self.user,
                date=self.today,
                category=rec.category,
                subcategory=subcategory,
                description=f"[Recurring] {rec.description}",
                amount=rec.amount,
                payment_method=rec.payment_method, # Use template payment method
                expense_type='fixed' # Recurring are usually fixed
            )

