"""Factory definitions for dashboard tests.

Using factory_boy to generate test data consistently and efficiently.
"""
import factory
from decimal import Decimal
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from faker import Faker

from income.models import IncomeEntry
from expenses.models import ExpenseEntry
from savings.models import InvestmentEntry
from budgets.models import CategoryBudget

User = get_user_model()
fake = Faker()


class UserFactory(factory.django.DjangoModelFactory):
    """Factory for creating test User instances."""

    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    display_name = factory.Faker('name')
    expected_monthly_income = Decimal('100000.00')
    is_active = True
    is_staff = False

    @classmethod
    def create(cls, **kwargs):
        """Override create to set password properly."""
        password = kwargs.pop('password', 'testpass123')
        instance = super().create(**kwargs)
        instance.set_password(password)
        instance.save()
        return instance


class IncomeEntryFactory(factory.django.DjangoModelFactory):
    """Factory for creating test IncomeEntry instances."""

    class Meta:
        model = IncomeEntry

    user = factory.SubFactory(UserFactory)
    date = factory.LazyFunction(lambda: date.today())
    income_source = 'salary'
    description = factory.Faker('sentence', nb_words=3)
    actual_amount = Decimal('100000.00')
    expected_amount = Decimal('100000.00')
    payment_method = 'bank_transfer'
    notes = ''


class ExpenseEntryFactory(factory.django.DjangoModelFactory):
    """Factory for creating test ExpenseEntry instances."""

    class Meta:
        model = ExpenseEntry

    user = factory.SubFactory(UserFactory)
    date = factory.LazyFunction(lambda: date.today())
    category = 'food'
    subcategory = 'Groceries'
    description = factory.Faker('sentence', nb_words=3)
    amount = Decimal('5000.00')
    payment_method = 'mpesa'
    notes = ''


class InvestmentEntryFactory(factory.django.DjangoModelFactory):
    """Factory for creating test InvestmentEntry instances."""

    class Meta:
        model = InvestmentEntry

    user = factory.SubFactory(UserFactory)
    date = factory.LazyFunction(lambda: date.today())
    investment_type = 'sacco'
    institution = factory.Faker('company')
    amount_contributed = Decimal('10000.00')
    current_value = Decimal('10000.00')
    goal_target = Decimal('100000.00')
    notes = ''


class CategoryBudgetFactory(factory.django.DjangoModelFactory):
    """Factory for creating test CategoryBudget instances."""

    class Meta:
        model = CategoryBudget

    user = factory.SubFactory(UserFactory)
    category = 'food'
    monthly_budget_ksh = Decimal('15000.00')
    priority = 'essential'
    notes = ''
