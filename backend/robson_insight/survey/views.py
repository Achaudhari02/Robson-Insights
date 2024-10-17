from rest_framework import generics, permissions, status
from django.http import HttpResponse
from rest_framework.response import Response

from .serializers import EntrySerializer
from .models import Entry, UserProfile

import csv

class EntryList(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer
    
    def get_queryset(self):
        current_profile = UserProfile.objects.get(user=self.request.user)
        user_group = current_profile.group
        queryset = Entry.objects.filter(user__group=user_group)
        return queryset
    
    def perform_create(self, serializer):
        current_profile = UserProfile.objects.get(user=self.request.user)
        serializer.save(user=current_profile)
    

class EntryDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer
    
    def get_queryset(self):
        current_profile = UserProfile.objects.get(user=self.request.user)
        user_group = current_profile.group
        queryset = Entry.objects.filter(user__group=user_group)
        return queryset

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