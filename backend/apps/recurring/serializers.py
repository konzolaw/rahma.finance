from rest_framework import serializers
from .models import RecurringTransaction

class RecurringTransactionSerializer(serializers.ModelSerializer):
    """Serialize recurring transaction templates."""
    
    class Meta:
        model = RecurringTransaction
        fields = [
            'id', 'type', 'category', 'description', 'amount', 
            'frequency', 'day_of_period', 'is_active', 
            'last_processed_date', 'payment_method', 'created_at'
        ]
        read_only_fields = ['id', 'last_processed_date', 'created_at']

    def validate_day_of_period(self, value):
        frequency = self.initial_data.get('frequency', 'monthly')
        if frequency == 'monthly' and not (1 <= value <= 31):
            raise serializers.ValidationError("Day of month must be between 1 and 31.")
        if frequency == 'weekly' and not (0 <= value <= 6):
            raise serializers.ValidationError("Day of week must be between 0 and 6.")
        return value
