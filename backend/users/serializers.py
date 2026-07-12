from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        token['is_verified'] = user.is_verified
        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'is_active', 'is_verified', 'created_at', 'updated_at')
        read_only_fields = ('id', 'email', 'role', 'is_active', 'is_verified', 'created_at', 'updated_at')


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admins to manage users — can update role, is_active, is_verified."""
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'company_name', 'is_active', 'is_verified', 'is_staff', 'created_at', 'updated_at')
        read_only_fields = ('id', 'email', 'company_name', 'created_at', 'updated_at')
        
    def get_company_name(self, obj):
        if obj.role == 'AGENCY':
            agency = getattr(obj, 'agency_profile', None)
            return agency.company_name if agency else 'Unknown Agency'
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'role', 'company_name')

    def create(self, validated_data):
        company_name = validated_data.pop('company_name', None)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'AGENCY')
        )
        if user.role == 'AGENCY' and company_name:
            from agencies.models import Agency
            Agency.objects.create(user=user, company_name=company_name, contact_person="Owner", phone_number="")
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    code = serializers.CharField(max_length=6, required=True)

class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
