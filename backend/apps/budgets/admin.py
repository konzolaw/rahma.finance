from django.contrib import admin
from .models import CategoryBudget

@admin.register(CategoryBudget)
class CategoryBudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'monthly_budget_ksh', 'priority', 'created_at')
    list_filter = ('category', 'priority')
    search_fields = ('user__email', 'category')
    ordering = ('-created_at',)
