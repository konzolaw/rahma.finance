"""Expense Entry serializers."""
from rest_framework import serializers
from .models import ExpenseEntry


class ExpenseEntrySerializer(serializers.ModelSerializer):
    """Serialize expense entries."""
    
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = ExpenseEntry
        fields = [
            'id', 'category', 'category_display', 'date', 'day_of_week',
            'description', 'subcategory', 'payment_method', 'payment_method_display',
            'amount', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'day_of_week', 'created_at']
    
    def validate(self, data):
        """Validate that subcategory is valid (relaxed to allow custom subcategories)."""
        # Relaxed validation to allow user-defined custom subcategories
        return data
    
    def validate_amount(self, value):
        """Validate that amount is positive."""
        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )
        return value


class ExpenseEntryListSerializer(serializers.ModelSerializer):
    """Serialize expense entries for list view."""
    
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    time = serializers.DateTimeField(source='created_at', format='%H:%M', read_only=True)
    
    class Meta:
        model = ExpenseEntry
        fields = [
            'id', 'category', 'category_display', 'date', 'time', 'day_of_week',
            'description', 'subcategory', 'amount', 'payment_method', 'payment_method_display'
        ]
        read_only_fields = ['id', 'day_of_week', 'time']



class ExpenseSummarySerializer(serializers.Serializer):
    """Serialize monthly expense summary by category."""
    
    month = serializers.CharField()
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    entries_count = serializers.IntegerField()
    by_category = serializers.DictField(child=serializers.DecimalField(max_digits=12, decimal_places=2))
    by_subcategory = serializers.DictField(child=serializers.DecimalField(max_digits=12, decimal_places=2))
