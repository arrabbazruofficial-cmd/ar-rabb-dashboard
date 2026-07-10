import uuid
from django.db import models
from django.conf import settings
from agencies.models import Agency

class RequestStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    SUBMITTED = 'SUBMITTED', 'Submitted'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    PROCESSING = 'PROCESSING', 'Processing'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    COMPLETED = 'COMPLETED', 'Completed'

class RequestType(models.TextChoices):
    GROUP_VISA = 'GROUP_VISA', 'Group Visa'
    INDIVIDUAL_VISA = 'INDIVIDUAL_VISA', 'Individual Visa'
    AIR_TICKET = 'AIR_TICKET', 'Air Ticket'

class BaseRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request_type = models.CharField(max_length=50, choices=RequestType.choices)
    agency = models.ForeignKey(Agency, on_delete=models.SET_NULL, null=True, blank=True, related_name='requests')
    # customer = models.ForeignKey('users.Customer', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.DRAFT)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'requests'

class GroupVisa(models.Model):
    request = models.OneToOneField(BaseRequest, on_delete=models.CASCADE, primary_key=True, related_name='group_visa_details')
    number_of_passengers = models.IntegerField()
    flight_itinerary = models.TextField()
    flight_code = models.CharField(max_length=100)
    travel_date = models.DateField()
    country_code = models.CharField(max_length=10)
    group_leader_name = models.CharField(max_length=255)
    india_number = models.CharField(max_length=50)
    saudi_number = models.CharField(max_length=50)

    class Meta:
        db_table = 'group_visas'

class AirTicket(models.Model):
    request = models.OneToOneField(BaseRequest, on_delete=models.CASCADE, primary_key=True, related_name='air_ticket_details')
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    arrival_date = models.DateField()
    departure_date = models.DateField()
    passengers = models.IntegerField()
    preferred_airline = models.CharField(max_length=255, blank=True, null=True)
    additional_notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'air_tickets'
