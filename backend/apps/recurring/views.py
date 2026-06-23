from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RecurringTransaction
from .serializers import RecurringTransactionSerializer
from .services import RecurringProcessor

class RecurringTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing recurring transaction templates."""
    
    serializer_class = RecurringTransactionSerializer
    
    def get_queryset(self):
        return RecurringTransaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def trigger_processing(self, request):
        """Manually trigger the processing of due transactions."""
        processor = RecurringProcessor(request.user)
        created_count = processor.process_all()
        return Response({
            'status': 'success',
            'message': f'Processed due transactions. Created {created_count} new entries.',
            'count': created_count
        })
