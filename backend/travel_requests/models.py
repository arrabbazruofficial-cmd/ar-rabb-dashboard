import uuid
from django.db import models
from django.conf import settings
from agencies.models import Agency


class RequestStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    INCOMPLETE = 'INCOMPLETE', 'Incomplete'
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
    agency = models.ForeignKey(
        Agency, on_delete=models.SET_NULL, null=True, blank=True, related_name='requests'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='customer_requests'
    )
    status = models.CharField(
        max_length=20, choices=RequestStatus.choices, default=RequestStatus.DRAFT
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_requests'
    )
    current_phase = models.IntegerField(default=1)
    admin_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'requests'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.request_type} - {self.id}'


class GroupVisa(models.Model):
    request = models.OneToOneField(
        BaseRequest, on_delete=models.CASCADE, primary_key=True, related_name='group_visa_details'
    )
    number_of_passengers = models.IntegerField(null=True, blank=True)
    flight_itinerary = models.TextField(null=True, blank=True)
    flight_code = models.CharField(max_length=100, null=True, blank=True)
    travel_date = models.DateField(null=True, blank=True)
    country_code = models.CharField(max_length=10, null=True, blank=True)
    group_leader_name = models.CharField(max_length=255, null=True, blank=True)
    india_number = models.CharField(max_length=50, null=True, blank=True)
    saudi_number = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'group_visas'


class HotelDetail(models.Model):
    CITY_CHOICES = [('MAKKAH', 'Makkah'), ('MADINAH', 'Madinah')]
    ROOM_TYPE_CHOICES = [
        ('QUAD', 'Quad'), ('PENTAGONAL', 'Pentagonal'), ('HEXAGONAL', 'Hexagonal')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group_visa = models.ForeignKey(
        GroupVisa, on_delete=models.CASCADE, related_name='hotels'
    )
    city = models.CharField(max_length=10, choices=CITY_CHOICES, null=True, blank=True)
    hotel_name = models.CharField(max_length=255, null=True, blank=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, null=True, blank=True)
    room_count = models.IntegerField(null=True, blank=True)
    check_in = models.DateField(null=True, blank=True)
    check_out = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'hotel_details'


class TransportDetail(models.Model):
    TRANSPORT_TYPES = [
        ('AIRPORT_PICKUP', 'Airport Pickup'),
        ('MAKKAH_ZIYARAH', 'Makkah Ziyarah'),
        ('MAKKAH_TO_MADINAH', 'Makkah to Madinah'),
        ('MADINAH_ZIYARAH', 'Madinah Ziyarah / Rawdah'),
    ]
    PERIOD_CHOICES = [('FN', 'Forenoon'), ('AN', 'Afternoon')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group_visa = models.ForeignKey(
        GroupVisa, on_delete=models.CASCADE, related_name='transports'
    )
    transport_type = models.CharField(max_length=30, choices=TRANSPORT_TYPES, null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
    period = models.CharField(max_length=2, choices=PERIOD_CHOICES, null=True, blank=True)

    class Meta:
        db_table = 'transport_details'


class IndividualVisa(models.Model):
    VISA_SUBTYPE_CHOICES = [('NORMAL', 'Normal Visa'), ('IQAMA', 'Iqama Visa')]

    request = models.OneToOneField(
        BaseRequest, on_delete=models.CASCADE, primary_key=True, related_name='individual_visa_details'
    )
    visa_subtype = models.CharField(max_length=10, choices=VISA_SUBTYPE_CHOICES, default='NORMAL')
    number_of_passengers = models.IntegerField(default=1)
    arrival_flight = models.CharField(max_length=255, blank=True, default='')
    departure_flight = models.CharField(max_length=255, blank=True, default='')
    stay_days = models.IntegerField(default=1)
    saudi_number = models.CharField(max_length=50, blank=True, default='')
    india_number = models.CharField(max_length=50, blank=True, default='')
    # Iqama-specific fields
    iqama_holder_name = models.CharField(max_length=255, blank=True, default='')
    iqama_id = models.CharField(max_length=100, blank=True, default='')
    date_of_birth = models.DateField(null=True, blank=True)
    national_address = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'individual_visas'


class AirTicket(models.Model):
    MEAL_CHOICES = [
        ('NONE', 'No Preference'), ('VEG', 'Vegetarian'),
        ('NON_VEG', 'Non-Vegetarian'), ('HALAL', 'Halal'),
    ]

    request = models.OneToOneField(
        BaseRequest, on_delete=models.CASCADE, primary_key=True, related_name='air_ticket_details'
    )
    origin = models.CharField(max_length=100, null=True, blank=True)
    destination = models.CharField(max_length=100, null=True, blank=True)
    arrival_date = models.DateField(null=True, blank=True)
    departure_date = models.DateField(null=True, blank=True)
    passengers = models.IntegerField(null=True, blank=True)
    preferred_airline = models.CharField(max_length=255, blank=True, default='')
    luggage_weight = models.IntegerField(null=True, blank=True, help_text='Weight in KG')
    wheelchair_required = models.BooleanField(default=False)
    meal_preference = models.CharField(
        max_length=10, choices=MEAL_CHOICES, default='NONE'
    )
    additional_notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'air_tickets'


class Attachment(models.Model):
    DOCUMENT_TYPES = [
        ('PASSPORT_FRONT', 'Passport Front'),
        ('PASSPORT_BACK', 'Passport Back'),
        ('PHOTO', 'Photograph'),
        ('TICKET', 'Flight Ticket'),
        ('VISA', 'Visa Copy'),
        ('PAYMENT_RECEIPT', 'Payment Receipt'),
        ('OTHER', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(
        BaseRequest, on_delete=models.CASCADE, related_name='attachments'
    )
    file = models.FileField(upload_to='attachments/', null=True, blank=True)
    file_url = models.URLField(max_length=1024, blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True, null=True)
    file_type = models.CharField(max_length=50, blank=True, null=True)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES, default='OTHER')
    file_size = models.IntegerField(default=0, help_text='Size in bytes')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attachments'
        ordering = ['-created_at']

class Passenger(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(BaseRequest, on_delete=models.CASCADE, related_name='passengers')
    passport_number = models.CharField(max_length=50, null=True, blank=True)
    full_name = models.CharField(max_length=255, null=True, blank=True)
    nationality = models.CharField(max_length=100, null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')], null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    passport_expiry = models.DateField(null=True, blank=True)
    is_lead = models.BooleanField(default=False)
    contact_number = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'passengers'
        ordering = ['-is_lead', 'full_name']

    def __str__(self):
        return f"{self.full_name} ({self.passport_number})"
