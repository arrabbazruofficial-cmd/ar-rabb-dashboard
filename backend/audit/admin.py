from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'target_type', 'target_id', 'created_at')
    list_filter = ('action', 'target_type')
    search_fields = ('action', 'user__email', 'target_type')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'user', 'action', 'target_type', 'target_id', 'details', 'ip_address', 'created_at')
