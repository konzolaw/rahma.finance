"""Unit tests for Insights services."""
from django.test import TestCase
from decimal import Decimal
from datetime import date

from users.models import User
from income.models import IncomeEntry
from expenses.models import ExpenseEntry
from budgets.models import CategoryBudget
from .services import InsightsService
from .advisor_service import MMFAdvisorService


class InsightsServiceTests(TestCase):
    """Tests for InsightsService calculations."""
    
    def setUp(self):
        """Create test user."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            display_name='Test User',
            expected_monthly_income=Decimal('50000.00')
        )
        self.service = InsightsService(self.user)
    
    def test_get_all_insights_returns_dict(self):
        """Test get_all_insights returns complete insights."""
        insights = self.service.get_all_insights()
        self.assertIsInstance(insights, dict)
        self.assertIn('ratios', insights)
        self.assertIn('trends', insights)
        self.assertIn('alerts', insights)
        self.assertIn('recommendations', insights)
    
    def test_financial_ratios(self):
        """Test financial ratios calculation."""
        ratios = self.service.get_financial_ratios()
        ratio_ids = [r['id'] for r in ratios]
        self.assertIn('ratio_savings_rate', ratio_ids)
        self.assertIn('ratio_expense_ratio', ratio_ids)
        self.assertIn('ratio_dti', ratio_ids)
        self.assertIn('ratio_goal_progress', ratio_ids)

    
    def test_trends_returns_data(self):
        """Test trends calculation returns required fields."""
        trends = self.service.get_trends()
        self.assertIn('income_trend', trends)
        self.assertIn('expense_trend', trends)
        self.assertIn('savings_trend', trends)
        self.assertIn('category_trends', trends)
    
    def test_alerts_empty_with_no_data(self):
        """Test alerts are empty when no concerning data."""
        alerts = self.service.get_alerts()
        self.assertIsInstance(alerts, list)
    
    def test_budget_exceeded_alert(self):
        """Test alert generated when budget exceeded."""
        CategoryBudget.objects.create(
            user=self.user,
            category='food',
            monthly_budget_ksh=Decimal('5000.00')
        )
        ExpenseEntry.objects.create(
            user=self.user,
            category='food',
            date=date.today(),
            subcategory='Groceries',
            amount=Decimal('6000.00')
        )
        alerts = self.service.get_alerts()
        self.assertGreater(len(alerts), 0)
        self.assertEqual(alerts[0]['type'], 'budget_exceeded')
    
    def test_recommendations_returns_list(self):
        """Test recommendations returns a list."""
        recommendations = self.service.get_recommendations()
        self.assertIsInstance(recommendations, list)


class MMFAdvisorServiceTests(TestCase):
    """Tests for MMFAdvisorService logic."""

    def test_get_market_data(self):
        """Test market data retrieves local and global data structures."""
        data = MMFAdvisorService.get_market_data()
        self.assertIn('local', data)
        self.assertIn('global', data)
        self.assertGreater(len(data['local']['mmfs']), 0)
        self.assertGreater(len(data['global']['mmfs']), 0)

    def test_calculate_simulation_local(self):
        """Test local asset compounding simulation."""
        result = MMFAdvisorService.calculate_simulation(
            region='local',
            asset_code='ICEA_MMF',
            principal=100000.0,
            years=3
        )
        self.assertIsNotNone(result)
        self.assertIn('net_value', result)
        self.assertEqual(result['tax_rate_percent'], 15)  # local wht is 15%
        self.assertGreater(result['net_value'], 100000.0)

    def test_calculate_simulation_global(self):
        """Test global asset compounding simulation with hedging message."""
        result = MMFAdvisorService.calculate_simulation(
            region='global',
            asset_code='VMFXX',
            principal=1000.0,
            years=1
        )
        self.assertIsNotNone(result)
        self.assertIn('forex_message', result)
        self.assertEqual(result['tax_rate_percent'], 30)  # global wht is 30%

    def test_generate_nlp_advice(self):
        """Test intent-based NLP advisor responses."""
        response = MMFAdvisorService.generate_nlp_advice(
            query="Which local MMF yields the most?",
            user_financials={'savings': 50000, 'monthly_income': 120000}
        )
        self.assertIn("CIC Money Market Fund", response)
        self.assertIn("15% withholding tax", response)


from rest_framework.test import APITestCase
from rest_framework import status

class InsightsAdvisorAPITests(APITestCase):
    """API endpoint tests for the investment advisor."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='advisor_test@example.com',
            password='securepassword123',
            display_name='Advisor Client'
        )
        self.client.force_authenticate(user=self.user)

    def test_get_advisor_market_data(self):
        """Test GET /insights/advisor/ returns the full database."""
        response = self.client.get('/api/v1/insights/advisor/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('local', response.data)
        self.assertIn('global', response.data)

    def test_post_simulation(self):
        """Test POST /insights/advisor/ for yield simulations."""
        payload = {
            'action': 'simulation',
            'region': 'local',
            'asset_code': 'CIC_MMF',
            'principal': 50000,
            'years': 5
        }
        response = self.client.post('/api/v1/insights/advisor/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('net_value', response.data)

    def test_post_advice(self):
        """Test POST /insights/advisor/ for chat guidance."""
        payload = {
            'action': 'advice',
            'query': 'Where can I invest my KSh 50,000 savings?'
        }
        response = self.client.post('/api/v1/insights/advisor/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('response', response.data)


