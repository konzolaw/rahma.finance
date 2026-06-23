"""Income entry views."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

from .models import IncomeEntry
from .serializers import IncomeEntrySerializer, IncomeEntryListSerializer


class IncomeEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing income entries."""
    
    serializer_class = IncomeEntrySerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']
    filterset_fields = ['date', 'income_source']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']
    
    def get_queryset(self):
        """Return authenticated user's income entries, with optional period filtering."""
        queryset = IncomeEntry.objects.filter(user=self.request.user)
        
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
            return IncomeEntryListSerializer
        return IncomeEntrySerializer
    
    def perform_create(self, serializer):
        """Create income entry for the authenticated user."""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Unified summary endpoint (defaults to monthly)."""
        return self.monthly_summary(request)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get income summary for the current month."""
        try:
            today = timezone.now().date()
            first_day = today.replace(day=1)
            
            entries = self.get_queryset().filter(date__gte=first_day, date__lt=today + timedelta(days=1))
            
            total_expected = entries.aggregate(Sum('expected_amount'))['expected_amount__sum'] or 0
            total_actual = entries.aggregate(Sum('actual_amount'))['actual_amount__sum'] or 0
            
            by_source = {}
            for source_code, source_name in IncomeEntry.INCOME_SOURCE_CHOICES:
                source_total = entries.filter(income_source=source_code).aggregate(Sum('actual_amount'))['actual_amount__sum'] or 0
                if source_total > 0:
                    by_source[source_name] = str(source_total)
            
            return Response(
                {
                    'status': 'success',
                    'message': 'Monthly income summary retrieved',
                    'data': {
                        'month': first_day.strftime('%Y-%m'),
                        'total_expected': str(total_expected),
                        'total_actual': str(total_actual),
                        'entries_count': entries.count(),
                        'by_source': by_source,
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
        """Get income summary for the current year."""
        today = timezone.now().date()
        first_day = today.replace(month=1, day=1)
        
        entries = self.get_queryset().filter(date__gte=first_day, date__lt=today + timedelta(days=1))
        
        total_actual = entries.aggregate(Sum('actual_amount'))['actual_amount__sum'] or 0
        monthly_avg = total_actual / (today.timetuple().tm_yday / 30) if today.timetuple().tm_yday > 0 else 0
        
        return Response(
            {
                'status': 'success',
                'message': 'Yearly income summary retrieved',
                'data': {
                    'year': today.year,
                    'total_actual': str(total_actual),
                    'monthly_average': str(monthly_avg),
                    'entries_count': entries.count(),
                }
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export all income to CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="income_export_{timezone.now().date()}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Source', 'Description', 'Expected Amount', 'Actual Amount', 'Status'])
        
        for entry in self.get_queryset():
            writer.writerow([
                entry.date,
                entry.get_income_source_display(),
                entry.description,
                entry.expected_amount,
                entry.actual_amount,
                entry.get_status_display()
            ])
            
        return response
