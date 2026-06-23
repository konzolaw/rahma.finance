"""Income Entry serializers."""
from rest_framework import serializers
from .models import IncomeEntry


class IncomeEntrySerializer(serializers.ModelSerializer):
    """Serialize income entries."""
    
    income_source_display = serializers.CharField(source='get_income_source_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = IncomeEntry
        fields = [
            'id', 'date', 'day_of_week', 'income_source', 'income_source_display',
            'description', 'expected_amount', 'actual_amount', 'payment_method',
            'payment_method_display', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'day_of_week', 'created_at']
    
    def validate_actual_amount(self, value):
        """Validate that actual amount is non-negative."""
        if value < 0:
            raise serializers.ValidationError(
                "Actual amount cannot be negative."
            )
        return value
    
    def validate_expected_amount(self, value):
        """Validate that expected amount (if provided) is non-negative."""
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Expected amount cannot be negative."
            )
        return value


class IncomeEntryListSerializer(serializers.ModelSerializer):
    """Serialize income entries for list view."""
    
    income_source_display = serializers.CharField(source='get_income_source_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    time = serializers.DateTimeField(source='created_at', format='%H:%M', read_only=True)
    
    class Meta:
        model = IncomeEntry
        fields = [
            'id', 'date', 'time', 'day_of_week', 'income_source', 'income_source_display',
            'actual_amount', 'payment_method', 'payment_method_display', 'description', 'income_layer'
        ]
        read_only_fields = ['id', 'day_of_week', 'time']



class IncomeSummarySerializer(serializers.Serializer):
    """Serialize monthly income summary."""
    
    month = serializers.CharField()
    total_expected = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_actual = serializers.DecimalField(max_digits=12, decimal_places=2)
    entries_count = serializers.IntegerField()
    by_source = serializers.DictField(child=serializers.DecimalField(max_digits=12, decimal_places=2))
