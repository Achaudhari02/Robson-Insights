from rest_framework import generics, permissions

from .serializers import UserProfileSerializer
from .models import UserProfile


class UserProfileList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_queryset(self):
        user_hospital = self.request.user.userprofile.hospital
        queryset = UserProfile.objects.filter(hospital=user_hospital)
        return queryset


class UserProfileDetail(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_queryset(self):
        user_hospital = self.request.user.userprofile.hospital
        queryset = UserProfile.objects.filter(hospital=user_hospital)
        return queryset