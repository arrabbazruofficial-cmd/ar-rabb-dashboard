from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import Agency
from .serializers import AgencySerializer

User = get_user_model()


class AgencyListView(generics.ListCreateAPIView):
    serializer_class = AgencySerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['company_name', 'contact_person']
    ordering_fields = ['created_at', 'company_name']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            queryset = Agency.objects.all()
            status_param = self.request.query_params.get('status')
            if status_param:
                queryset = queryset.filter(status=status_param)
            return queryset
        return Agency.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AgencyDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AgencySerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            return Agency.objects.all()
        return Agency.objects.filter(user=user)


class AgencyStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, id):
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            agency = Agency.objects.get(id=id)
            new_status = request.data.get('status')
            if new_status not in ['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED']:
                return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
            
            agency.status = new_status
            agency.save()

            # Create notification
            from notifications.models import Notification, NotificationType
            title = 'Agency Status Updated'
            message = f'Your agency account has been {new_status.lower()}.'
            Notification.objects.create(
                user=agency.user, title=title, message=message, notification_type=NotificationType.AGENCY_APPROVED
            )
            return Response({'status': agency.status})
        except Agency.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
