from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_health_check(request):
    return JsonResponse({
        "status": "online",
        "service": "SchoolFest Backend API",
        "version": "1.0",
        "endpoints": {
            "api_root": "/api/",
            "events": "/api/events/",
            "scoreboard": "/api/scoreboard/",
            "results": "/api/results/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('fest_api.urls')),
    path('health/', api_health_check, name='api_health_check'),
    path('', api_health_check, name='root_health_check'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
