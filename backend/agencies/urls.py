from django.urls import path
from .views import AgencyListView, AgencyDetailView, AgencyStatusUpdateView

urlpatterns = [
    path('', AgencyListView.as_view(), name='agency-list'),
    path('<uuid:id>/', AgencyDetailView.as_view(), name='agency-detail'),
    path('<uuid:id>/status/', AgencyStatusUpdateView.as_view(), name='agency-status'),
]
