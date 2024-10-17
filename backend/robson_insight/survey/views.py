from django.core.exceptions import PermissionDenied
from rest_framework import generics, permissions

from .serializers import EntrySerializer, FilterSerializer
from .models import Entry, Filter
from .permissions import CanReadEntry
from users.models import Group, UserProfile


class EntryListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer
    
    def get_queryset(self):
        
        user_profiles = UserProfile.objects.filter(user=self.request.user, can_view=True)
        allowed_groups = user_profiles.values_list('group', flat=True)
        return Entry.objects.filter(group__in=allowed_groups)
    
    def perform_create(self, serializer):
        group = serializer.validated_data.get('group')

        try:
            user_profile = UserProfile.objects.get(user=self.request.user, group=group)

            if not user_profile.can_add:
                raise PermissionDenied("You do not have permission to add entries to this group.")
            
            serializer.save(user=self.request.user)
        
        except UserProfile.DoesNotExist:
            raise PermissionDenied("You are not a member of this group.")
        
        
class EntryFilterListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer
    
    def get_queryset(self):
        
        filter_pk = self.kwargs.get('pk')
        try:
            user_filter = Filter.objects.get(pk=filter_pk, user=self.request.user)
            groups_in_filter = user_filter.groups.all()
            return Entry.objects.filter(group__in=groups_in_filter)
        except Filter.DoesNotExist:
            return Entry.objects.none()
    

class EntryDetailView(generics.RetrieveAPIView):
    permission_classes = [CanReadEntry]
    serializer_class = EntrySerializer
    
    def get_queryset(self):
        
        pk = self.kwargs.get('pk')
        queryset = Entry.objects.get(pk=pk)
        return queryset
    
    
class FilterConfigurationListCreateView(generics.ListCreateAPIView):
    serializer_class = FilterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Filter.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        groups = serializer.validated_data.get('groups', [])

        user_groups = Group.objects.filter(userprofile__user=self.request.user)

        if not all(group in user_groups for group in groups):
            raise PermissionDenied("You can only add groups you belong to.")

        serializer.save(user=self.request.user)


class FilterConfigurationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FilterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        queryset = Filter.objects.filter(pk=pk)
        return queryset
    