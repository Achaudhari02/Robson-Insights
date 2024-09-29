from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken, APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import UserRegistrationSerializer
from users.models import Invite


class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.serializer_class(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Login failed', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            Token.objects.filter(user=request.user).delete()
            return Response({'detail': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Logout failed', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class RegisterView(APIView):
    serializer_class = UserRegistrationSerializer
    
    def post(self, request, token):
        try:
            invite = Invite.objects.get(token=token)
        except Invite.DoesNotExist:
           return Response(
            {
                "error": "Invite not found."
            },
            status=status.HTTP_201_CREATED
        ) 
        
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": serializer.data,
                "message": "User created successfully."
            },
            status=status.HTTP_201_CREATED
        )