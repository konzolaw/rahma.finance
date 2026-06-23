"""Expense entry views."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

from .models import ExpenseEntry
from .serializers import ExpenseEntrySerializer, ExpenseEntryListSerializer


class ExpenseEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing expense entries."""
    
    serializer_class = ExpenseEntrySerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']
    filterset_fields = ['date', 'category']
    ordering_fields = ['date', 'created_at', 'amount']
    ordering = ['-date']
    
    def get_queryset(self):
        """Return authenticated user's expense entries, with optional period filtering."""
        queryset = ExpenseEntry.objects.filter(user=self.request.user)
        
        # Period-based filtering for logs
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        day = self.request.query_params.get('day')
        period = self.request.query_params.get('period', 'month')
        
        if year and month:
            from datetime import date, timedelta
            target_date = date(int(year), int(month), int(day) if day else 1)
            
            if period == 'day' and day:
                queryset = queryset.filter(date=target_date)
            elif period == 'week':
                start_of_week = target_date - timedelta(days=target_date.weekday())
                end_of_week = start_of_week + timedelta(days=6)
                queryset = queryset.filter(date__gte=start_of_week, date__lte=end_of_week)
            else: # month
                queryset = queryset.filter(date__year=year, date__month=month)
        elif year:
            queryset = queryset.filter(date__year=year)
            
        return queryset
    
    def get_serializer_class(self):
        """Use list serializer for list view."""
        if self.action == 'list':
            return ExpenseEntryListSerializer
        return ExpenseEntrySerializer
    
    def perform_create(self, serializer):
        """Create expense entry for the authenticated user."""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Unified summary endpoint (defaults to monthly)."""
        return self.monthly_summary(request)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get expense summary for the current month."""
        try:
            today = timezone.now().date()
            first_day = today.replace(day=1)
            
            entries = self.get_queryset().filter(date__gte=first_day, date__lt=today + timedelta(days=1))
            
            total_spent = entries.aggregate(Sum('amount'))['amount__sum'] or 0
            
            by_category = {}
            for category_code, category_name in ExpenseEntry.CATEGORY_CHOICES:
                category_total = entries.filter(category=category_code).aggregate(Sum('amount'))['amount__sum'] or 0
                if category_total > 0:
                    by_category[category_name] = str(category_total)
            
            by_subcategory = {}
            for entry in entries:
                key = f"{entry.get_category_display()} > {entry.subcategory}"
                if key not in by_subcategory:
                    by_subcategory[key] = 0
                by_subcategory[key] += float(entry.amount)
            
            by_subcategory = {k: str(v) for k, v in by_subcategory.items()}
            
            return Response(
                {
                    'status': 'success',
                    'message': 'Monthly expense summary retrieved',
                    'data': {
                        'month': first_day.strftime('%Y-%m'),
                        'total_spent': str(total_spent),
                        'entries_count': entries.count(),
                        'by_category': by_category,
                        'by_subcategory': by_subcategory,
                    }
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'status': 'error',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def yearly_summary(self, request):
        """Get expense summary for the current year."""
        today = timezone.now().date()
        first_day = today.replace(month=1, day=1)
        
        entries = self.get_queryset().filter(date__gte=first_day, date__lt=today + timedelta(days=1))
        
        total_spent = entries.aggregate(Sum('amount'))['amount__sum'] or 0
        monthly_avg = total_spent / (today.timetuple().tm_yday / 30) if today.timetuple().tm_yday > 0 else 0
        
        return Response(
            {
                'status': 'success',
                'message': 'Yearly expense summary retrieved',
                'data': {
                    'year': today.year,
                    'total_spent': str(total_spent),
                    'monthly_average': str(monthly_avg),
                    'entries_count': entries.count(),
                }
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get detailed expenses breakdown by category."""
        entries = self.get_queryset()
        
        breakdown = {}
        for category_code, category_name in ExpenseEntry.CATEGORY_CHOICES:
            category_entries = entries.filter(category=category_code)
            if category_entries.exists():
                breakdown[category_name] = {
                    'total': str(category_entries.aggregate(Sum('amount'))['amount__sum']),
                    'count': category_entries.count(),
                    'average': str(category_entries.aggregate(avg=Sum('amount') / Count('id'))['avg'] or 0),
                }
        
        return Response(
            {
                'status': 'success',
                'message': 'Expenses by category breakdown retrieved',
                'data': breakdown
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export all expenses to CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="expenses_export_{timezone.now().date()}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Category', 'Subcategory', 'Description', 'Amount', 'Payment Method', 'Status'])
        
        for entry in self.get_queryset():
            writer.writerow([
                entry.date,
                entry.get_category_display(),
                entry.subcategory,
                entry.description,
                entry.amount,
                entry.get_payment_method_display(),
                entry.get_status_display()
            ])
            
        return response
