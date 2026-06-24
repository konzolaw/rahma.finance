"""
Django REST API URL Configuration.

Routes all API endpoints with SimpleJWT authentication.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import all ViewSets and custom views
from users.views import UserViewSet, PartnerViewSet, CookieTokenObtainPairView, CookieTokenRefreshView
from budgets.views import CategoryBudgetViewSet
from income.views import IncomeEntryViewSet
from expenses.views import ExpenseEntryViewSet
from savings.views import InvestmentEntryViewSet, VaultTransactionViewSet
from dashboard.views import DashboardViewSet
from insights.views import InsightsViewSet
from recurring.views import RecurringTransactionViewSet

# Create API router and register viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'partners', PartnerViewSet, basename='partner')
router.register(r'budgets', CategoryBudgetViewSet, basename='budget')
router.register(r'income', IncomeEntryViewSet, basename='income')
router.register(r'expenses', ExpenseEntryViewSet, basename='expense')
router.register(r'investments', InvestmentEntryViewSet, basename='investment')
router.register(r'vault', VaultTransactionViewSet, basename='vault')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'insights', InsightsViewSet, basename='insights')
router.register(r'recurring', RecurringTransactionViewSet, basename='recurring')

# No longer using CustomTokenObtainPairView here, using CookieTokenObtainPairView

# API URL patterns
api_urlpatterns = [
    # JWT Token endpoints
    path('auth/login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    
    # Auth helpers for consistency with frontend
    path('auth/register/', UserViewSet.as_view({'post': 'register'}), name='auth_register'),
    path('auth/me/', UserViewSet.as_view({'get': 'profile', 'patch': 'update_profile'}), name='auth_me'),
    
    # API v1 endpoints (all registered routers)
    path('', include(router.urls)),
]

from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "status": "healthy",
        "message": "Welcome to Rahma Finance API",
        "version": "v1"
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_urlpatterns)),
]
