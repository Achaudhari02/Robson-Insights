from rest_framework import generics, permissions

from .serializers import EntrySerializer
from .models import Entry

class EntryList(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer
    
    def get_queryset(self):
        user_group = self.request.user.userprofile.group
        queryset = Entry.objects.filter(user__group=user_group)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user.userprofile)
    

class EntryDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer
    
    def get_queryset(self):
        user_group = self.request.user.userprofile.group
        queryset = Entry.objects.filter(user__group=user_group)
        return queryset
    