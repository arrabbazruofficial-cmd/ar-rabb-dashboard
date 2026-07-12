from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import BaseRequest, Attachment
from .serializers import BaseRequestSerializer, AttachmentSerializer
from core.emails import notify_admins_new_request, notify_user_status_change


class RequestViewSet(viewsets.ModelViewSet):
    serializer_class = BaseRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['request_type', 'status', 'agency']
    search_fields = ['id', 'agency__company_name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            return BaseRequest.objects.all()
        elif user.role == 'AGENCY':
            return BaseRequest.objects.filter(agency__user=user)
        elif user.role == 'CUSTOMER':
            return BaseRequest.objects.filter(customer=user)
        return BaseRequest.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'AGENCY':
            agency = getattr(user, 'agency_profile', None)
            serializer.save(agency=agency)
        elif user.role == 'CUSTOMER':
            serializer.save(customer=user)
        else:
            serializer.save()
            
        # Create notification
        from notifications.models import Notification, NotificationType
        Notification.objects.create(
            user=user,
            title='Request Submitted',
            message=f'Your {serializer.instance.get_request_type_display()} request has been successfully submitted.',
            notification_type=NotificationType.REQUEST_SUBMITTED,
            related_request_id=serializer.instance.id
        )
        
        notify_admins_new_request(serializer.instance.request_type, str(serializer.instance.id))

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        obj = self.get_object()
        new_status = request.data.get('status')
        if not new_status:
            return Response({'detail': 'Status is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        obj.status = new_status
        obj.save()

        # Create notification
        from notifications.models import Notification, NotificationType
        user_to_notify = obj.customer if obj.customer else (obj.agency.user if obj.agency else None)
        if user_to_notify:
            Notification.objects.create(
                user=user_to_notify,
                title='Request Status Updated',
                message=f'Your request ({obj.id}) is now {new_status}.',
                notification_type=NotificationType.STATUS_CHANGED,
                related_request_id=obj.id
            )
            notify_user_status_change(user_to_notify.email, str(obj.id), new_status)

        return Response(BaseRequestSerializer(obj).data)


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            return Attachment.objects.all()
        return Attachment.objects.filter(request__agency__user=user) | Attachment.objects.filter(request__customer=user)

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
