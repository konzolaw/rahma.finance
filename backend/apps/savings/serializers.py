"""Investment and Vault serializers."""
from rest_framework import serializers
from decimal import Decimal

from .models import InvestmentEntry, VaultTransaction


class InvestmentEntrySerializer(serializers.ModelSerializer):
    """Serialize investment entries (formerly savings)."""
    
    investment_type_display = serializers.CharField(source='get_investment_type_display', read_only=True)
    profit_or_loss = serializers.SerializerMethodField()
    goal_progress_percent = serializers.SerializerMethodField()
    
    class Meta:
        model = InvestmentEntry
        fields = [
            'id', 'date', 'investment_type', 'investment_type_display',
            'institution', 'amount_contributed', 'current_value',
            'goal_target', 'profit_or_loss', 'goal_progress_percent',
            'notes', 'created_at'
        ]
        read_only_fields = ['id', 'profit_or_loss', 'goal_progress_percent', 'created_at']
    
    def get_profit_or_loss(self, obj):
        """Calculate profit or loss (current_value - amount_contributed)."""
        if obj.current_value and obj.amount_contributed:
            return obj.current_value - obj.amount_contributed
        return None
    
    def get_goal_progress_percent(self, obj):
        """Calculate goal progress percentage (current_value / goal_target * 100)."""
        if obj.goal_target and obj.goal_target > 0:
            progress = (obj.current_value / obj.goal_target) * Decimal('100')
            return min(progress, Decimal('100'))  # Cap at 100%
        return None
    
    def validate(self, data):
        """Validate amounts are non-negative."""
        if data.get('amount_contributed', 0) < 0:
            raise serializers.ValidationError({
                'amount_contributed': 'Amount contributed cannot be negative.'
            })
        if data.get('current_value', 0) < 0:
            raise serializers.ValidationError({
                'current_value': 'Current value cannot be negative.'
            })
        if data.get('goal_target') and data['goal_target'] < 0:
            raise serializers.ValidationError({
                'goal_target': 'Goal target cannot be negative.'
            })
        return data


class VaultTransactionSerializer(serializers.ModelSerializer):
    """Serialize vault movements."""
    
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = VaultTransaction
        fields = ['id', 'date', 'type', 'type_display', 'amount', 'description', 'created_at']
        read_only_fields = ['id', 'type_display', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class InvestmentSummarySerializer(serializers.Serializer):
    """Serialize total investment summary."""
    
    total_contributed = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_current_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_profit_loss = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_goal_target = serializers.DecimalField(max_digits=12, decimal_places=2)
    entries_count = serializers.IntegerField()
    by_investment_type = serializers.DictField(child=serializers.DecimalField(max_digits=12, decimal_places=2))
    vault_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
