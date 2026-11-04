from rest_framework import permissions


class IsTeacherUserRole(permissions.BasePermission):
    """
    Allows access to verified Teacher and Admin users.
    Only active and approved teachers can access protected teacher functions.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == 'ADMIN' or request.user.is_superuser or request.user.is_staff:
            return True
        if request.user.role == 'TEACHER':
            return bool(
                request.user.is_verified and
                request.user.verification_status == 'APPROVED' and
                request.user.is_active
            )
        return False


class IsParentUserRole(permissions.BasePermission):
    """
    Allows access only to active and approved Parent users.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == 'PARENT':
            return bool(
                request.user.is_verified and
                request.user.verification_status == 'APPROVED' and
                request.user.is_active
            )
        return False


class IsTeacherOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access for any authenticated/public user,
    write access to verified Teachers and Admins.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == 'ADMIN' or request.user.is_superuser or request.user.is_staff:
            return True
        if request.user.role == 'TEACHER':
            return bool(
                request.user.is_verified and
                request.user.verification_status == 'APPROVED' and
                request.user.is_active
            )
        return False


class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to Admin users or Django superusers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_superuser or request.user.is_staff)
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to all, write access only to Admin.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_superuser or request.user.is_staff)
        )
