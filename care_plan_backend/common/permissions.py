from rest_framework.permissions import BasePermission
from companies.models import CompanyUser
from .rbac import ROLE_PERMISSIONS

class RBACPermission(BasePermission):

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            company_user = CompanyUser.objects.get(user=request.user)
            role = company_user.role
        except CompanyUser.DoesNotExist:
            return False

        model_name = view.queryset.model.__name__
        action = view.action  # create, retrieve, update, destroy, list

        # normalize DRF actions
        action_map = {
            'list': 'retrieve',
            'retrieve': 'retrieve',
            'create': 'create',
            'update': 'update',
            'partial_update': 'update',
            'destroy': 'delete'
        }

        action = action_map.get(action)
        if not action:
            return False

        allowed_roles = ROLE_PERMISSIONS.get(model_name, {}).get(action, [])
        return role in allowed_roles
