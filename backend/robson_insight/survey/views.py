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

import pandas as pd
import os
from openpyxl import load_workbook
from datetime import datetime
import re

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
            if group:
                user_profile = UserProfile.objects.get(user=self.request.user, group=group)
            
                if not user_profile.can_add:
                    raise PermissionDenied("You do not have permission to add entries to this group.")
            
            serializer.save(user=self.request.user)
        
        except UserProfile.DoesNotExist:
            raise PermissionDenied("You are not a member of this group.")
    
    def post(self, request, *args, **kwargs):
        if 'file' in request.FILES:
            return self.upload_file(request.FILES['file'])
        else:
            return super().post(request, *args, **kwargs)
    
    def upload_file(self, file):
        try:
            _, file_extension = os.path.splitext(file.name)
            df = pd.DataFrame()
            if file_extension == '.csv':
                with open(file, 'r') as file:
                    lines = file.readlines()
                    
                start_row = next(i for i, line in enumerate(lines) if line.strip().lower().startswith("group"))
                df = pd.read_csv(file, skiprows=start_row, header=None)
                
            elif file_extension == '.xlsx':
                workbook = load_workbook(file, read_only=True)
                sheet = workbook.active
                
                start_row = next(i for i, row in enumerate(sheet.iter_rows(values_only=True)) 
                                if str(row[0]).strip().lower().startswith("group"))
                df = pd.read_excel(file, skiprows=start_row, header=None)
            i = 1
            count = 0

            try:
                if df.iat[0, i][:7] != "Quarter":
                    raise Exception
            except:
                return Response({'error': 'Invalid format'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            while df.iat[0, i][:7] == "Quarter":
                date = min(datetime.strptime(re.sub(r'(\d+)(st|nd|rd|th)', r'\1', df.iat[0, i].split("- ")[1]), '%d %B %Y'), datetime.now())
                j = 2

                try:
                    if df.iat[j, 0][:5] != "Group":
                        raise Exception
                except:
                    return Response({'error': 'Invalid format'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
                
                while df.iat[j, 0][:5] == "Group":
                    v = df.iat[j, i]
                    if not pd.isna(v):
                        for k in range(df.iat[j, i]):
                            self._create_entry(df.iat[j, 0].split(' ')[1], 'n', date)
                            count += 1
                    c = df.iat[j, i + 1]
                    if not pd.isna(c):
                        for k in range(df.iat[j, i + 1]):
                            df.iat[j, 0].split(' ')[1], 'y', date
                            self._create_entry(df.iat[j, 0].split(' ')[1], 'y', date)
                            count += 1
                    j += 1
                i += 2
            return Response({"message": f"{count} entries uploaded successfully."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _create_entry(self, classification, csection, date):
        try:
            entry_data = {
                'classification': classification,
                'csection': csection,
                'date': date,
                'group': None,
            }
            serializer = self.get_serializer(data=entry_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class EntryFilterListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer
    
    def get_queryset(self):
        filter_pk = self.kwargs.get('pk')
        try:
            user_filter = Filter.objects.get(pk=filter_pk, user=self.request.user)
            # only gettign groups the user has can_view permission for
            user_profiles = UserProfile.objects.filter(user=self.request.user, can_view=True)
            allowed_groups = user_profiles.values_list('group', flat=True)

            groups_in_filter = user_filter.groups.filter(id__in=allowed_groups)
            return Entry.objects.filter(group__in=groups_in_filter)
        
        except Filter.DoesNotExist:
            return Entry.objects.none()

class DownloadSurveyCSVView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer

    def get(self, request):
        try:
            current_profile = UserProfile.objects.get(user=request.user)
            user_group = current_profile.group
            queryset = Entry.objects.filter(user__group=user_group)
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