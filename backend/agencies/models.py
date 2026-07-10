import uuid
from django.db import models
from django.conf import settings

class Agency(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='agency_profile')
    company_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=50)
    address = models.TextField(blank=True, null=True)
    logo_url = models.URLField(max_length=1024, blank=True, null=True)
    status = models.CharField(max_length=50, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'agencies'

    def __str__(self):
        return self.company_name
