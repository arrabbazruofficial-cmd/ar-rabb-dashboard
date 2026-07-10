from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Agency
from .serializers import AgencySerializer

class AgencyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AgencySerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPER_ADMIN' or user.role == 'ADMIN':
            return Agency.objects.all()
        return Agency.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
