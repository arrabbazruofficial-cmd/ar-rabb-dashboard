from django.contrib import admin
from .models import BaseRequest, GroupVisa, AirTicket, IndividualVisa, HotelDetail, TransportDetail, Attachment


class HotelDetailInline(admin.TabularInline):
    model = HotelDetail
    extra = 0

class TransportDetailInline(admin.TabularInline):
    model = TransportDetail
    extra = 0

class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 0
    readonly_fields = ('file_url', 'file_name', 'file_type', 'file_size', 'uploaded_by', 'created_at')


@admin.register(BaseRequest)
class BaseRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'request_type', 'agency', 'status', 'assigned_to', 'created_at')
    list_filter = ('request_type', 'status')
    search_fields = ('id', 'agency__company_name')
    ordering = ('-created_at',)
    inlines = [AttachmentInline]


@admin.register(GroupVisa)
class GroupVisaAdmin(admin.ModelAdmin):
    list_display = ('request', 'number_of_passengers', 'group_leader_name', 'travel_date')
    inlines = [HotelDetailInline, TransportDetailInline]


@admin.register(AirTicket)
class AirTicketAdmin(admin.ModelAdmin):
    list_display = ('request', 'origin', 'destination', 'passengers', 'arrival_date')


@admin.register(IndividualVisa)
class IndividualVisaAdmin(admin.ModelAdmin):
    list_display = ('request', 'visa_subtype', 'number_of_passengers', 'stay_days')


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'request', 'file_type', 'uploaded_by', 'created_at')
    readonly_fields = ('id', 'file_url', 'file_name', 'file_type', 'file_size', 'uploaded_by', 'created_at')
