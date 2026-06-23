from django.contrib import admin
from .models import InvestmentEntry, VaultTransaction

@admin.register(InvestmentEntry)
class InvestmentEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'institution', 'investment_type', 'current_value', 'amount_contributed', 'date')
    list_filter = ('investment_type', 'institution', 'date')
    search_fields = ('user__email', 'institution', 'investment_type')
    ordering = ('-date',)

@admin.register(VaultTransaction)
class VaultTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'amount', 'date', 'created_at')
    list_filter = ('type', 'date')
    search_fields = ('user__email', 'description')
    ordering = ('-date', '-created_at')
