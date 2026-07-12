from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RequestViewSet, AttachmentViewSet

router = DefaultRouter()
router.register(r'attachments', AttachmentViewSet, basename='attachment')
router.register(r'', RequestViewSet, basename='request')

urlpatterns = [
    path('', include(router.urls)),
]
