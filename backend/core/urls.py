from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static


def health_check(request):
    return HttpResponse('backend active and running')


urlpatterns = [
    path('', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/agencies/', include('agencies.urls')),
    path('api/v1/requests/', include('travel_requests.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/audit/', include('audit.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
