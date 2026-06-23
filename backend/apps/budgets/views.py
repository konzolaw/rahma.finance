"""Budget management views."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import CategoryBudget
from .serializers import CategoryBudgetSerializer, CategoryBudgetListSerializer


class CategoryBudgetViewSet(viewsets.ModelViewSet):
    """ViewSet for managing category budgets."""
    
    serializer_class = CategoryBudgetSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']
    
    def get_queryset(self):
        """Return only the authenticated user's budgets."""
        return CategoryBudget.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Use list serializer for list view."""
        if self.action == 'list':
            return CategoryBudgetListSerializer
        return CategoryBudgetSerializer
    
    def create(self, request, *args, **kwargs):
        """Create or update budget (Upsert)."""
        category = request.data.get('category')
        user = request.user
        
        # Check if budget already exists for this category
        existing_budget = CategoryBudget.objects.filter(user=user, category=category).first()
        
        if existing_budget:
            serializer = self.get_serializer(existing_budget, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(
                {
                    'status': 'success',
                    'message': 'Budget updated successfully',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        # Otherwise create new
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)
        return Response(
            {
                'status': 'success',
                'message': 'Budget created successfully',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary of all budgets for the user."""
        budgets = self.get_queryset()
        total_budget = sum(b.monthly_budget_ksh for b in budgets)
        
        return Response({
            'total_monthly_budget': str(total_budget),
            'budgets_count': budgets.count(),
            'by_priority': {
                'essential': str(sum(b.monthly_budget_ksh for b in budgets if b.priority == 'essential')),
                'important': str(sum(b.monthly_budget_ksh for b in budgets if b.priority == 'important')),
                'optional': str(sum(b.monthly_budget_ksh for b in budgets if b.priority == 'optional')),
                'variable': str(sum(b.monthly_budget_ksh for b in budgets if b.priority == 'variable')),
            }
        })
