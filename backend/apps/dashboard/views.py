"""Dashboard summary API endpoints.

Exposes aggregated financial data in single API calls.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import datetime

from .services import DashboardService
from .ai_service import GeminiFinanceService


class DashboardViewSet(viewsets.ViewSet):
    """ViewSet for dashboard summary endpoints."""
    
    permission_classes = [IsAuthenticated]

    def _safe_int_param(self, request, name, default):
        val = request.query_params.get(name)
        if val is None or val == '' or val == 'undefined' or val == 'null':
            return default
        try:
            return int(val)
        except ValueError:
            return default

    @action(detail=False, methods=['get'], url_path='export-pdf')
    def export_pdf(self, request):
        """Generate and export a professional financial audit PDF."""
        try:
            from django.http import HttpResponse
            from .export_service import PDFExportService
            
            # 1. Parse Filters
            scope_param = request.query_params.get('scope', 'all')
            period = request.query_params.get('period', 'month')
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            # Use current month if not specified
            month = timezone.now().month
            year = timezone.now().year
            
            # 2. Get Data via DashboardService
            service = DashboardService(request.user, month=month, year=year, period=period)
            
            # If custom range provided, we'll need to manually set boundaries
            if period == 'custom' and start_date and end_date:
                service.current_period_start = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
                service.current_period_end = datetime.datetime.strptime(end_date, '%Y-%m-%d').date()
                service.period_type = 'custom'
            
            statement_data = service.get_statement()
            
            # 3. Filter transactions by scope if not 'all'
            if 'all' not in scope_param:
                scopes = scope_param.split(',')
                filtered_tx = []
                for tx in statement_data['transactions']:
                    if tx['type'] in scopes:
                        filtered_tx.append(tx)
                statement_data['transactions'] = filtered_tx

            # 4. Generate PDF
            export_service = PDFExportService(request.user, statement_data, request.query_params)
            pdf_content = export_service.generate()
            
            # 5. Return as Response
            filename = f"KeshoKwako_Audit_{timezone.now().strftime('%Y%m%d')}.pdf"
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
        except Exception as e:
            return Response(
                {
                    'status': 'error',
                    'message': f"PDF Generation Error: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get complete dashboard summary in ONE API call.
        
        Returns:
            - Current month/year income: expected, actual, variance
            - Current month expenses: total, by category, top 5
            - Savings: total, current value, goals progress
            - Budgets: total budget, utilization, by category status
        """
        try:
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            day = self._safe_int_param(request, 'day', timezone.now().day)
            period = request.query_params.get('period', 'month')
            service = DashboardService(request.user, month=month, year=year, day=day, period=period)
            summary = service.get_summary()

            # Add AI analysis to the summary
            try:
                ai_service = GeminiFinanceService()
                summary['ai_analysis'] = ai_service.analyze_health(summary)
            except Exception as ai_err:
                print(f"AI error during summary: {ai_err}")
                summary['ai_analysis'] = None

            return Response(
                {
                    'status': 'success',
                    'message': f'Dashboard {period} summary retrieved',
                    'data': summary
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
    def income(self, request):
        """Get income summary for month and year."""
        try:
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            service = DashboardService(request.user, month=month, year=year)
            income_data = service._get_income_summary()
            return Response(
                {
                    'status': 'success',
                    'message': 'Income summary retrieved',
                    'data': income_data
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
    def expenses(self, request):
        """Get expense summary with category breakdown."""
        try:
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            service = DashboardService(request.user, month=month, year=year)
            expenses_data = service._get_expenses_summary()
            return Response(
                {
                    'status': 'success',
                    'message': 'Expense summary retrieved',
                    'data': expenses_data
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
    def savings(self, request):
        """Get savings and investment summary."""
        try:
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            service = DashboardService(request.user, month=month, year=year)
            savings_data = service._get_savings_summary()
            return Response(
                {
                    'status': 'success',
                    'message': 'Savings summary retrieved',
                    'data': savings_data
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
    def budgets(self, request):
        """Get budget tracking and utilization (transformed for frontend list view)."""
        try:
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            day = self._safe_int_param(request, 'day', timezone.now().day)
            period = request.query_params.get('period', 'month')
            service = DashboardService(request.user, month=month, year=year, day=day, period=period)
            budgets_data = service._get_budget_summary()
            income_data = service._get_income_summary()
            
            # Transform by_category dict into a list for easier frontend consumption
            categories_list = []
            for cat_label, data in budgets_data.get('by_category', {}).items():
                categories_list.append({
                    'category_label': cat_label,
                    **data
                })
            
            return Response(
                {
                    'status': 'success',
                    'message': 'Budget summary retrieved',
                    'data': categories_list,
                    'summary': budgets_data.get('total', {}),
                    'income': income_data.get('month', {})
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
    def statement(self, request):
        """Generate a full financial statement for the selected period."""
        try:
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            day = self._safe_int_param(request, 'day', timezone.now().day)
            period = request.query_params.get('period', 'month')
            service = DashboardService(request.user, month=month, year=year, day=day, period=period)
            statement = service.get_statement()
            return Response(
                {
                    'status': 'success',
                    'message': 'Statement generated',
                    'data': statement
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
    
    @action(detail=False, methods=['get'], url_path='ai-analysis')
    def ai_analysis(self, request):
        """Get AI-driven financial insights using FinBERT and local ML analysis."""
        try:
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            day = self._safe_int_param(request, 'day', timezone.now().day)
            period = request.query_params.get('period', 'month')
            
            # 1. Get the current dashboard data
            service = DashboardService(request.user, month=month, year=year, day=day, period=period)
            summary = service.get_summary()
            
            # 2. Send to FinBERT AI service
            ai_service = GeminiFinanceService()
            analysis = ai_service.analyze_health(summary)
            
            return Response(
                {
                    'status': 'success',
                    'message': 'AI analysis completed',
                    'data': analysis
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'status': 'error',
                    'message': f"AI Analysis Error: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
