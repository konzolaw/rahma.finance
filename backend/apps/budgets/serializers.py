"""Category Budget serializers."""
from rest_framework import serializers
from .models import CategoryBudget


class CategoryBudgetSerializer(serializers.ModelSerializer):
    """Serialize budget limits for expense categories."""
    
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = CategoryBudget
        fields = [
            'id', 'category', 'category_display', 'monthly_budget_ksh',
            'priority', 'priority_display', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_monthly_budget_ksh(self, value):
        """Validate that budget is non-negative."""
        if value < 0:
            raise serializers.ValidationError(
                "Monthly budget cannot be negative."
            )
        return value
    
    def validate_category(self, value):
        """Validate that category is one of the 8 fixed choices."""
        valid_choices = [choice[0] for choice in CategoryBudget.CATEGORY_CHOICES]
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"Category must be one of: {', '.join(valid_choices)}"
            )
        return value


class CategoryBudgetListSerializer(serializers.ModelSerializer):
    """Serialize all budgets for a user in list view."""
    
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = CategoryBudget
        fields = [
            'id', 'category', 'category_display', 'monthly_budget_ksh',
            'priority', 'priority_display'
        ]
        read_only_fields = ['id']
