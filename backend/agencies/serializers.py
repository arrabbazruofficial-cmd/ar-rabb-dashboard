from rest_framework import serializers
from .models import Agency

class AgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = ('id', 'user', 'company_name', 'contact_person', 'phone_number', 'address', 'logo_url', 'status', 'created_at')
        read_only_fields = ('id', 'user', 'status', 'created_at')
