from django.contrib import admin
from .models import IncomeEntry

@admin.register(IncomeEntry)
class IncomeEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'income_source', 'actual_amount', 'date', 'payment_method')
    list_filter = ('income_source', 'payment_method', 'date')
    search_fields = ('user__email', 'income_source', 'description')
    ordering = ('-date',)
