from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
import openpyxl
from .models import BaseRequest, GroupVisa, AirTicket, RequestType
from .serializers import BaseRequestSerializer, GroupVisaSerializer, AirTicketSerializer

class RequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BaseRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            return BaseRequest.objects.all().order_by('-created_at')
        if hasattr(user, 'agency_profile'):
            return BaseRequest.objects.filter(agency=user.agency_profile).order_by('-created_at')
        return BaseRequest.objects.none() # Customers don't have access to this endpoint directly for now

    @action(detail=False, methods=['post'], url_path='group-visa')
    def create_group_visa(self, request):
        if not hasattr(request.user, 'agency_profile'):
            return Response({'error': 'Only agencies can submit group visas'}, status=status.HTTP_403_FORBIDDEN)
        
        base_req = BaseRequest.objects.create(request_type=RequestType.GROUP_VISA, agency=request.user.agency_profile)
        
        visa_data = request.data.copy()
        visa_data['request'] = base_req.id
        serializer = GroupVisaSerializer(data=visa_data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(BaseRequestSerializer(base_req).data, status=status.HTTP_201_CREATED)
        
        base_req.delete()
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='air-ticket')
    def create_air_ticket(self, request):
        agency = getattr(request.user, 'agency_profile', None)
        base_req = BaseRequest.objects.create(request_type=RequestType.AIR_TICKET, agency=agency)
        
        ticket_data = request.data.copy()
        ticket_data['request'] = base_req.id
        serializer = AirTicketSerializer(data=ticket_data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(BaseRequestSerializer(base_req).data, status=status.HTTP_201_CREATED)
        
        base_req.delete()
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='export-excel')
    def export_excel(self, request):
        if request.user.role != 'SUPER_ADMIN':
            return Response({'error': 'Only Super Admins can export data'}, status=status.HTTP_403_FORBIDDEN)
            
        wb = openpyxl.Workbook()
        
        # Sheet 1: Group Visas
        ws_group = wb.active
        ws_group.title = "Group Visas"
        ws_group.append(['ID', 'Agency', 'Status', 'Passengers', 'Flight Code', 'Travel Date', 'Country Code', 'Group Leader', 'Created At'])
        
        group_reqs = BaseRequest.objects.filter(request_type=RequestType.GROUP_VISA).select_related('group_visa_details', 'agency')
        for req in group_reqs:
            details = getattr(req, 'group_visa_details', None)
            if not details: continue
            agency_name = req.agency.company_name if req.agency else 'N/A'
            ws_group.append([
                str(req.id), agency_name, req.status, details.number_of_passengers, details.flight_code,
                str(details.travel_date), details.country_code, details.group_leader_name, req.created_at.strftime("%Y-%m-%d %H:%M")
            ])

        # Sheet 2: Air Tickets
        ws_air = wb.create_sheet(title="Air Tickets")
        ws_air.append(['ID', 'Agency', 'Status', 'Origin', 'Destination', 'Arrival', 'Departure', 'Passengers', 'Airline', 'Created At'])
        
        air_reqs = BaseRequest.objects.filter(request_type=RequestType.AIR_TICKET).select_related('air_ticket_details', 'agency')
        for req in air_reqs:
            details = getattr(req, 'air_ticket_details', None)
            if not details: continue
            agency_name = req.agency.company_name if req.agency else 'N/A'
            ws_air.append([
                str(req.id), agency_name, req.status, details.origin, details.destination,
                str(details.arrival_date), str(details.departure_date), details.passengers, details.preferred_airline or 'N/A', req.created_at.strftime("%Y-%m-%d %H:%M")
            ])

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=alrabb_requests_export.xlsx'
        wb.save(response)
        
        return response
