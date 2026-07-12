import uuid
from django.db import models
from django.conf import settings


class NotificationType(models.TextChoices):
    REQUEST_SUBMITTED = 'REQUEST_SUBMITTED', 'Request Submitted'
    REQUEST_APPROVED = 'REQUEST_APPROVED', 'Request Approved'
    REQUEST_REJECTED = 'REQUEST_REJECTED', 'Request Rejected'
    REQUEST_PROCESSING = 'REQUEST_PROCESSING', 'Request Processing'
    REQUEST_COMPLETED = 'REQUEST_COMPLETED', 'Request Completed'
    STATUS_CHANGED = 'STATUS_CHANGED', 'Status Changed'
    NEW_AGENCY = 'NEW_AGENCY', 'New Agency Registration'
    AGENCY_APPROVED = 'AGENCY_APPROVED', 'Agency Approved'
    AGENCY_SUSPENDED = 'AGENCY_SUSPENDED', 'Agency Suspended'
    GENERAL = 'GENERAL', 'General'


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30, choices=NotificationType.choices, default=NotificationType.GENERAL
    )
    is_read = models.BooleanField(default=False)
    related_request_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} - {self.user.email}'
