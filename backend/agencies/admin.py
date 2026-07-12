from django.contrib import admin
from .models import Agency


@admin.register(Agency)
class AgencyAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'contact_person', 'phone_number', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('company_name', 'contact_person', 'user__email')
    ordering = ('-created_at',)
