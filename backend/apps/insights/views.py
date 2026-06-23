"""Financial insights and analysis API endpoints.

Provides financial ratios, trends, alerts, and recommendations.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .services import InsightsService
from .advisor_service import MMFAdvisorService


class InsightsViewSet(viewsets.ViewSet):
    """ViewSet for financial insights and analysis."""
    
    permission_classes = [IsAuthenticated]
    
    def _safe_int_param(self, request, name, default):
        val = request.query_params.get(name)
        if val is None or val == '' or val == 'undefined' or val == 'null':
            return default
        try:
            return int(val)
        except ValueError:
            return default
    
    @action(detail=False, methods=['get'])
    def all(self, request):
        """
        Get all financial insights in ONE call.
        
        Returns:
            - Financial ratios: savings rate, expense ratio, debt-to-income, etc.
            - Trends: 12-month trends for income, expenses, savings
            - Alerts: Budget warnings, low income, no savings
            - Recommendations: Personalized financial advice
        """
        try:
            from django.utils import timezone
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            service = InsightsService(request.user, month=month, year=year)
            insights = service.get_all_insights()
            return Response(
                {
                    'status': 'success',
                    'message': 'All insights retrieved',
                    'data': insights
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
    def ratios(self, request):
        """Get key financial ratios."""
        try:
            from django.utils import timezone
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            service = InsightsService(request.user, month=month, year=year)
            ratios = service.get_financial_ratios()
            return Response(
                {
                    'status': 'success',
                    'message': 'Financial ratios retrieved',
                    'data': ratios
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
    def trends(self, request):
        """Get financial trends for analysis."""
        try:
            from django.utils import timezone
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            service = InsightsService(request.user, month=month, year=year)
            trends = service.get_trends()
            return Response(
                {
                    'status': 'success',
                    'message': 'Financial trends retrieved',
                    'data': trends
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
    def alerts(self, request):
        """Get financial alerts and warnings."""
        try:
            from django.utils import timezone
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            service = InsightsService(request.user, month=month, year=year)
            alerts = service.get_alerts()
            return Response(
                {
                    'status': 'success',
                    'message': 'Financial alerts retrieved',
                    'data': alerts
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
    def recommendations(self, request):
        """Get personalized financial recommendations."""
        try:
            from django.utils import timezone
            month = self._safe_int_param(request, 'month', timezone.now().month)
            year = self._safe_int_param(request, 'year', timezone.now().year)
            service = InsightsService(request.user, month=month, year=year)
            recommendations = service.get_recommendations()
            return Response(
                {
                    'status': 'success',
                    'message': 'Financial recommendations retrieved',
                    'data': recommendations
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
            
    @action(detail=False, methods=['get', 'post'])
    def advisor(self, request):
        """
        Investment Advisor Endpoint.
        
        GET: Returns local/global market options (MMFs, stocks).
        POST: Handles AI Q&A prompt or compound yield simulations.
        """
        try:
            service = MMFAdvisorService(request.user)
            if request.method == 'GET':
                market_data = service.get_market_data()
                return Response({
                    'status': 'success',
                    'data': market_data
                }, status=status.HTTP_200_OK)
                
            elif request.method == 'POST':
                prompt = request.data.get('prompt')
                # If prompt is provided, run AI Advice
                if prompt:
                    advice = service.get_ai_advice(prompt)
                    return Response({
                        'status': 'success',
                        'data': {
                            'advice': advice
                        }
                    }, status=status.HTTP_200_OK)
                
                # Otherwise, run compound interest simulation
                amount = float(request.data.get('amount', 0))
                currency = request.data.get('currency', 'KES')
                period_years = int(request.data.get('period_years', 1))
                rate = float(request.data.get('rate', 0.0))
                asset_type = request.data.get('asset_type', 'mmf')
                
                simulation = service.simulate(amount, currency, period_years, rate, asset_type)
                return Response({
                    'status': 'success',
                    'data': simulation
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
