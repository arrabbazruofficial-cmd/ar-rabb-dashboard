from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True, default='System')

    class Meta:
        model = AuditLog
        fields = ('id', 'user_email', 'action', 'target_type', 'target_id', 'details', 'ip_address', 'created_at')
