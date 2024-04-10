from rest_framework import generics, permissions,status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken, APIView
from rest_framework.permissions import IsAuthenticated
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
    
class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'detail': 'Logout successful'})
