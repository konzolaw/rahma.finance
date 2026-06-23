from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from .models import ExpenseEntry
from savings.models import InvestmentEntry

@receiver(post_save, sender=ExpenseEntry)
def sync_expense_to_investments(sender, instance, created, **kwargs):
    """
    If an expense is logged under the 'savings' category, 
    automatically create or update a corresponding InvestmentEntry.
    """
    if instance.category == 'savings':
        # Map subcategory to investment type
        sub_to_type = {
            'M-Pesa MMF': 'mmf',
            'Bank Savings': 'emergency_fund',
            'SACCO Deposit': 'sacco',
            'Chama Contribution': 'chama',
            'Chumz': 'chumz',
            'Emergency Fund': 'emergency_fund',
            'Stocks / Shares': 'stocks',
            'Crypto': 'crypto'
        }
        
        inv_type = sub_to_type.get(instance.subcategory, 'emergency_fund')
        institution = instance.subcategory
        
        # Try to find an existing investment account for this user/institution
        account = InvestmentEntry.objects.filter(
            user=instance.user,
            institution=institution,
            investment_type=inv_type
        ).first()
        
        if account:
            # Update existing account
            account.amount_contributed += instance.amount
            account.current_value += instance.amount
            account.date = instance.date
            account.save()
        else:
            # Create new investment account
            InvestmentEntry.objects.create(
                user=instance.user,
                date=instance.date,
                investment_type=inv_type,
                institution=institution,
                amount_contributed=instance.amount,
                current_value=instance.amount,
                goal_target=Decimal('0'),
                notes=f"Auto-synced from expense: {instance.description}"
            )
