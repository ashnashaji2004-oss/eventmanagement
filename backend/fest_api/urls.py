from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomTokenObtainPairView, me_view, admin_change_credentials, dashboard_stats_view, scoreboard_data_view,
    StudentViewSet, HouseViewSet,
    EventCategoryViewSet, EventViewSet, EventParticipantViewSet,
    ResultViewSet, CertificateViewSet, public_verify_certificate,
    parent_children_view, parent_child_achievements_view,
    NotificationViewSet, SchoolSettingsViewSet, AuditLogViewSet,
    export_house_standings_csv, export_event_results_csv,
    AdminUserViewSet, admin_stats_view, register_view,
    ParentChildLinkRequestViewSet, AcademicYearViewSet,
    register_teacher_view, register_parent_view, registration_status_view,
    seed_live_database_view
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='students')
router.register(r'houses', HouseViewSet, basename='houses')
router.register(r'categories', EventCategoryViewSet, basename='categories')
router.register(r'events', EventViewSet, basename='events')
router.register(r'participants', EventParticipantViewSet, basename='participants')
router.register(r'results', ResultViewSet, basename='results')
router.register(r'certificates', CertificateViewSet, basename='certificates')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'settings', SchoolSettingsViewSet, basename='settings')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-logs')
router.register(r'academic-years', AcademicYearViewSet, basename='academic-years')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/child-link-requests', ParentChildLinkRequestViewSet, basename='admin-child-links')

urlpatterns = [
    # Auth
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair_alias'),
    path('auth/register/', register_view, name='auth_register'),
    path('auth/register/teacher/', register_teacher_view, name='auth_register_teacher'),
    path('auth/register/parent/', register_parent_view, name='auth_register_parent'),
    path('auth/registration-status/', registration_status_view, name='auth_registration_status'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh_alias'),
    path('auth/me/', me_view, name='auth_me'),
    path('auth/change-credentials/', admin_change_credentials, name='admin_change_credentials'),

    # Admin verification & management
    path('admin/stats/', admin_stats_view, name='admin_stats'),

    # Public & Common
    path('seed-live-data/', seed_live_database_view, name='seed_live_data'),
    path('dashboard/stats/', dashboard_stats_view, name='dashboard_stats'),
    path('scoreboard/', scoreboard_data_view, name='scoreboard_data'),
    path('certificates/verify/<str:token>/', public_verify_certificate, name='public_verify_certificate'),
    path('certificates/verify/<str:token>', public_verify_certificate, name='public_verify_certificate_noslash'),

    # Parent-specific
    path('parent/children/', parent_children_view, name='parent_children'),
    path('parent/child-achievements/<int:student_id>/', parent_child_achievements_view, name='parent_child_achievements'),

    # Exports
    path('reports/house-standings/export/', export_house_standings_csv, name='export_house_standings'),
    path('reports/events/<int:event_id>/export/', export_event_results_csv, name='export_event_results'),

    # Router
    path('', include(router.urls)),
]

