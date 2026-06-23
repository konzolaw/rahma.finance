from django.contrib import admin
from .models import ExpenseEntry

@admin.register(ExpenseEntry)
class ExpenseEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'subcategory', 'amount', 'date', 'payment_method')
    list_filter = ('category', 'payment_method', 'date')
    search_fields = ('user__email', 'description', 'subcategory')
    ordering = ('-date',)
