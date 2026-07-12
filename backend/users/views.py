from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer, UserSerializer, AdminUserSerializer, ChangePasswordSerializer,
    VerifyOTPSerializer, SendOTPSerializer
)
from .models import OTP
from core.emails import send_otp_email, notify_admins_new_user

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        otp = OTP.objects.create(user=user)
        send_otp_email(user.email, otp.code)
        notify_admins_new_user(user.email, user.role)


class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    search_fields = ['email']
    ordering_fields = ['created_at', 'email', 'role']
    ordering = ['-created_at']

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return User.objects.none()
        queryset = User.objects.all().order_by('-created_at')
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUserSerializer
    lookup_field = 'id'

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return User.objects.none()
        return User.objects.all()

class SendOTPView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.create(user=user)
            send_otp_email(user.email, otp.code)
            return Response({'message': 'OTP sent successfully.'})
        except User.DoesNotExist:
            return Response({'message': 'OTP sent successfully.'}) # silent fail

class VerifyOTPView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.filter(user=user, code=code).last()
            if otp and otp.is_valid():
                user.is_verified = True
                user.save()
                otp.delete()
                return Response({'message': 'Email verified successfully.'})
            return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
