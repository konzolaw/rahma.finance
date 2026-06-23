"""Investment and Vault entry views."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from decimal import Decimal
from django.utils import timezone

from .models import InvestmentEntry, VaultTransaction
from .serializers import InvestmentEntrySerializer, VaultTransactionSerializer


class InvestmentEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing investment entries."""
    
    serializer_class = InvestmentEntrySerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']
    filterset_fields = ['date', 'investment_type']
    ordering_fields = ['date', 'created_at', 'current_value']
    ordering = ['-date']
    
    def get_queryset(self):
        """Return authenticated user's investment entries."""
        queryset = InvestmentEntry.objects.filter(user=self.request.user)
        
        # Period-based filtering
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        
        if year and month:
            queryset = queryset.filter(date__year=year, date__month=month)
        elif year:
            queryset = queryset.filter(date__year=year)
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get complete investment summary."""
        try:
            entries = self.get_queryset()
            
            total_contributed = entries.aggregate(Sum('amount_contributed'))['amount_contributed__sum'] or Decimal('0')
            total_current_value = entries.aggregate(Sum('current_value'))['current_value__sum'] or Decimal('0')
            total_goal_target = entries.aggregate(Sum('goal_target'))['goal_target__sum'] or Decimal('0')
            
            # Calculate vault balance
            saves = VaultTransaction.objects.filter(user=request.user, type='save').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            withdraws = VaultTransaction.objects.filter(user=request.user, type='withdraw').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            vault_balance = saves - withdraws

            return Response({
                'status': 'success',
                'data': {
                    'total': {
                        'contributed': str(total_contributed),
                        'current_value': str(total_current_value),
                        'profit_loss': str(total_current_value - total_contributed),
                        'goal_target': str(total_goal_target),
                        'entries_count': entries.count(),
                    },
                    'vault_balance': str(vault_balance)
                }
            })
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=500)


class VaultTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Vault movements (Save/Withdraw)."""
    
    serializer_class = VaultTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return VaultTransaction.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def balance(self, request):
        """Get current vault balance."""
        saves = self.get_queryset().filter(type='save').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        withdraws = self.get_queryset().filter(type='withdraw').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        balance = saves - withdraws
        return Response({
            'status': 'success',
            'balance': str(balance)
        })
