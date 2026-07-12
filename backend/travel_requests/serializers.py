from rest_framework import serializers
from .models import (
    BaseRequest, GroupVisa, HotelDetail, TransportDetail, 
    IndividualVisa, AirTicket, Attachment
)
from users.serializers import UserSerializer
from agencies.serializers import AgencySerializer


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'uploaded_by')


class HotelDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelDetail
        fields = ('id', 'city', 'hotel_name', 'room_type', 'room_count', 'check_in', 'check_out')


class TransportDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportDetail
        fields = ('id', 'transport_type', 'date', 'time', 'period')


class GroupVisaSerializer(serializers.ModelSerializer):
    hotels = HotelDetailSerializer(many=True, required=False)
    transports = TransportDetailSerializer(many=True, required=False)

    class Meta:
        model = GroupVisa
        fields = (
            'number_of_passengers', 'flight_itinerary', 'flight_code', 
            'travel_date', 'country_code', 'group_leader_name', 
            'india_number', 'saudi_number', 'hotels', 'transports'
        )


class IndividualVisaSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndividualVisa
        fields = (
            'visa_subtype', 'number_of_passengers', 'arrival_flight', 
            'departure_flight', 'stay_days', 'saudi_number', 'india_number',
            'iqama_holder_name', 'iqama_id', 'date_of_birth', 'national_address'
        )


class AirTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = AirTicket
        fields = (
            'origin', 'destination', 'arrival_date', 'departure_date', 
            'passengers', 'preferred_airline', 'luggage_weight', 
            'wheelchair_required', 'meal_preference', 'additional_notes'
        )


class BaseRequestSerializer(serializers.ModelSerializer):
    group_visa = GroupVisaSerializer(source='group_visa_details', required=False)
    individual_visa = IndividualVisaSerializer(source='individual_visa_details', required=False)
    air_ticket = AirTicketSerializer(source='air_ticket_details', required=False)
    attachments = AttachmentSerializer(many=True, read_only=True)
    agency_details = AgencySerializer(source='agency', read_only=True)
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)

    class Meta:
        model = BaseRequest
        fields = (
            'id', 'request_type', 'agency', 'customer', 'status', 'assigned_to', 
            'admin_notes', 'created_at', 'updated_at', 'group_visa', 'individual_visa', 
            'air_ticket', 'attachments', 'agency_details', 'assigned_to_details'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'agency', 'customer')

    def create(self, validated_data):
        group_visa_data = validated_data.pop('group_visa_details', None)
        individual_visa_data = validated_data.pop('individual_visa_details', None)
        air_ticket_data = validated_data.pop('air_ticket_details', None)

        request = BaseRequest.objects.create(**validated_data)

        if request.request_type == 'GROUP_VISA' and group_visa_data:
            hotels_data = group_visa_data.pop('hotels', [])
            transports_data = group_visa_data.pop('transports', [])
            group_visa = GroupVisa.objects.create(request=request, **group_visa_data)
            for hotel in hotels_data:
                HotelDetail.objects.create(group_visa=group_visa, **hotel)
            for transport in transports_data:
                TransportDetail.objects.create(group_visa=group_visa, **transport)
        
        elif request.request_type == 'INDIVIDUAL_VISA' and individual_visa_data:
            IndividualVisa.objects.create(request=request, **individual_visa_data)
            
        elif request.request_type == 'AIR_TICKET' and air_ticket_data:
            AirTicket.objects.create(request=request, **air_ticket_data)

        return request

    def update(self, instance, validated_data):
        # Allow updating admin notes and status via this serializer if admin
        if 'status' in validated_data:
            instance.status = validated_data['status']
        if 'admin_notes' in validated_data:
            instance.admin_notes = validated_data['admin_notes']
        if 'assigned_to' in validated_data:
            instance.assigned_to = validated_data['assigned_to']
            
        # Handle deep updates for edit requests
        group_visa_data = validated_data.pop('group_visa_details', None)
        individual_visa_data = validated_data.pop('individual_visa_details', None)
        air_ticket_data = validated_data.pop('air_ticket_details', None)

        if group_visa_data and instance.request_type == 'GROUP_VISA':
            if hasattr(instance, 'group_visa_details'):
                instance.group_visa_details.delete()
            GroupVisaSerializer().create({**group_visa_data, 'request': instance})

        if individual_visa_data and instance.request_type == 'INDIVIDUAL_VISA':
            if hasattr(instance, 'individual_visa_details'):
                instance.individual_visa_details.delete()
            IndividualVisaSerializer().create({**individual_visa_data, 'request': instance})

        if air_ticket_data and instance.request_type == 'AIR_TICKET':
            if hasattr(instance, 'air_ticket_details'):
                instance.air_ticket_details.delete()
            AirTicketSerializer().create({**air_ticket_data, 'request': instance})

        instance.save()
        return instance
