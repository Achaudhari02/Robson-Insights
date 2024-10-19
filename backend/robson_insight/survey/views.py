from django.core.exceptions import PermissionDenied
from rest_framework import generics, permissions

from .serializers import EntrySerializer, FilterSerializer, FilterIDSerializer
from .models import Entry, Filter
from users.models import User
from .permissions import CanReadEntry
from users.models import Group, UserProfile
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.views import APIView


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

class CreateConfiguration(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        configuration_name = request.data.get('configuration_name', '').strip()
        
        if not configuration_name:
            return Response({'error': 'Configuration name is required'}, status=status.HTTP_400_BAD_REQUEST)
        if len(configuration_name) > 100:
            return Response({'error': 'Group name cannot exceed 100 characters'}, status=status.HTTP_400_BAD_REQUEST)
        if len(configuration_name) < 5:
            return Response({'error': 'Group name must be at least 5 characters'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if Filter.objects.filter(name__iexact=configuration_name).exists():
                return Response({'error': 'A group with this name already exists'}, status=status.HTTP_400_BAD_REQUEST)

            configuration = Filter.objects.create(name=configuration_name, user=self.request.user)

            return Response(
                {'success': f'Configuration "{configuration.name}" created.'},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print('Error:', str(e))
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AddGroupToConfiguration(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        group_id = request.data.get('group_id')
        configuration_id = request.data.get('configuration_id')

        if not group_id or not configuration_id:
            return Response({'error': 'group_name and confuguration_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            configuration = Filter.objects.get(id=configuration_id)
            group = Group.objects.get(id=group_id)
            configuration.groups.add(group)

            return Response({'success': f'{group.name} added to configuration {configuration.name}'}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class RemoveGroupFromConfiguration(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        group_id = request.data.get('group_id')
        configuration_id = request.data.get('configuration_id')

        if not group_id or not configuration_id:
            return Response({'error': 'group_id and confuguration_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            configuration = Filter.objects.get(id=configuration_id)
            group = Group.objects.get(id=group_id)
            configuration.groups.remove(group)

            return Response({'success': f'{group.name} removed from configuration {configuration.name}'}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FilterConfigurationDetailView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        return Filter.objects.filter(pk=pk).prefetch_related('groups')

    def get(self, *args, **kwargs):
        pk = self.kwargs.get('pk')
        filter_instance = self.get_queryset().first()

        group_ids = list(filter_instance.groups.values_list('id', flat=True))
        
        return Response(group_ids)