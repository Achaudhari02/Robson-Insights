from rest_framework import permissions
from .models import UserProfile

class IsInGroup(permissions.BasePermission):

    def has_permission(self, request, view):
        group_pk = view.kwargs.get('pk')
        return UserProfile.objects.filter(user=request.user, group_id=group_pk).exists()
    
    
class IsGroupAdmin(permissions.BasePermission):
    
    def has_permission(self, request, view):
        group_pk = view.kwargs.get('pk')
        user_profile = UserProfile.objects.filter(user=request.user, group_id=group_pk)
        if (user_profile.exists()):
            return user_profile.is_admin
        return False
