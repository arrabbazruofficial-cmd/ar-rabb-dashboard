from rest_framework import serializers
from .models import BaseRequest, GroupVisa, AirTicket

class GroupVisaSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupVisa
        fields = '__all__'

class AirTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = AirTicket
        fields = '__all__'

class BaseRequestSerializer(serializers.ModelSerializer):
    group_visa_details = GroupVisaSerializer(read_only=True)
    air_ticket_details = AirTicketSerializer(read_only=True)

    class Meta:
        model = BaseRequest
        fields = ('id', 'request_type', 'agency', 'status', 'assigned_to', 'created_at', 'updated_at', 'group_visa_details', 'air_ticket_details')
        read_only_fields = ('id', 'status', 'created_at', 'updated_at', 'assigned_to')
