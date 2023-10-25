from core.constants import ROLE_ADMIN
from core.constants import ROLE_PROJECT_MANAGER
from core.models import User
from rest_framework.permissions import BasePermission


class IsProjectManager(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        try:
            # Check if the user has the role of 'Project Manager'
            if user.role == ROLE_PROJECT_MANAGER:
                return True
        except User.DoesNotExist:
            pass
        return False


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        try:
            # Check if the user has the role of 'Project Manager'
            if user.role == ROLE_ADMIN:
                return True
        except User.DoesNotExist:
            pass
        return False
