import csv
from django.core.exceptions import PermissionDenied
from django.db.models import Q

from django.http import HttpResponse
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.views import APIView

from .serializers import EntrySerializer, FilterSerializer
from .models import Entry, Filter
from .permissions import CanReadEntry
from users.models import Group, UserProfile

class EntryListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer
    
    def get_queryset(self):
        user_profiles = UserProfile.objects.filter(
            user=self.request.user
        ).filter(Q(can_view=True) | Q(is_admin=True))
        allowed_groups = user_profiles.values_list('group', flat=True)
        return Entry.objects.filter(groups__in=allowed_groups).distinct()
    
    def perform_create(self, serializer):
        # Fetch all user profiles where the user has can_add permissions
        user_profiles = UserProfile.objects.filter(
            user=self.request.user
        ).filter(Q(can_add=True) | Q(is_admin=True))

        if not user_profiles.exists():
            raise PermissionDenied("You do not have permission to add entries to any group.")

        # Collect all groups the user can add to
        allowed_groups = user_profiles.values_list('group', flat=True)

        # Save the entry and associate it with all allowed groups
        entry = serializer.save(user=self.request.user)
        entry.groups.set(allowed_groups)
    
    
class EntryFilterListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer

    def get_serializer(self, *args, **kwargs):
        # Exclude 'groups' field from the serializer
        kwargs['exclude_groups'] = True
        return super().get_serializer(*args, **kwargs)
    
    def get_queryset(self):
        pk = self.kwargs.get('pk')
        
        # Determine if the pk is prefixed with 'filter-' or 'group-'
        if pk.startswith('filter-'):
            filter_id = pk.split('-')[1]
            return self.get_entries_by_filter(filter_id)
        elif pk.startswith('group-'):
            group_id = pk.split('-')[1]
            return self.get_entries_by_group(group_id)
        else:
            return Entry.objects.none()

    def get_entries_by_filter(self, filter_id):
        try:
            user_filter = Filter.objects.get(pk=filter_id, user=self.request.user)
            user_profiles = UserProfile.objects.filter(
                user=self.request.user
            ).filter(Q(can_view=True) | Q(is_admin=True))
            allowed_groups = user_profiles.values_list('group', flat=True)

            groups_in_filter = user_filter.groups.filter(id__in=allowed_groups)
            return Entry.objects.filter(groups__in=groups_in_filter).distinct()
        
        except Filter.DoesNotExist:
            return Entry.objects.none()

    def get_entries_by_group(self, group_id):
        try:
            user_profiles = UserProfile.objects.filter(
                user=self.request.user
            ).filter(Q(can_view=True) | Q(is_admin=True), group__id=group_id)

            if not user_profiles.exists():
                raise PermissionDenied("You do not have permission to view entries for this group.")

            return Entry.objects.filter(groups__id=group_id).distinct()
        
        except Group.DoesNotExist:
            return Entry.objects.none()

class DownloadSurveyCSVView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer

    def get(self, request):
        try:
            queryset = Entry.objects.filter(user__in=UserProfile.objects.filter(group__in=UserProfile.objects.filter(user=request.user, can_view=True).values_list('group', flat=True)).values_list('user', flat=True).distinct())
            model = queryset.model
            model_fields = model._meta.fields + model._meta.many_to_many
            field_names = [field.name for field in model_fields]

            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="survey_data.csv"'

            writer = csv.writer(response, delimiter=";")
            writer.writerow(field_names)

            for row in queryset:
                values = []
                for field in field_names:
                    values.append(getattr(row, field))
                writer.writerow(values)

            return response
            
        except Exception as e:
           return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

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
        user_filters = Filter.objects.filter(user=self.request.user)
        # removing groups user does not have can_view permission for 
        user_profiles = UserProfile.objects.filter(user=self.request.user, can_view=True)
        allowed_groups = user_profiles.values_list('group', flat=True)
        return user_filters.filter(groups__in=allowed_groups)    
        #return Filter.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        groups = serializer.validated_data.get('groups', [])

        user_groups = Group.objects.filter(userprofile__user=self.request.user)
        
        user_profiles = UserProfile.objects.filter(user=self.request.user, can_view=True)
        allowed_groups = user_profiles.values_list('group', flat=True)

        if not all(group in allowed_groups for group in groups):
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
