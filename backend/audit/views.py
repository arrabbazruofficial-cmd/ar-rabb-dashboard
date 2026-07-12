from rest_framework import generics, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['action', 'target_type', 'user__email']
    ordering_fields = ['created_at', 'action']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return AuditLog.objects.none()
        queryset = AuditLog.objects.all()
        target_type = self.request.query_params.get('target_type')
        if target_type:
            queryset = queryset.filter(target_type=target_type)
        return queryset
