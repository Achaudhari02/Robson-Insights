from rest_framework import generics, permissions,status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken, APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer, GroupSerializer
from .models import UserProfile, Group, Administrator
from django.contrib.auth.models import User
from django.db.utils import IntegrityError


class UserProfileList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_queryset(self):
        user_group = self.request.user.userprofile.group
        queryset = UserProfile.objects.filter(group=user_group)
        return queryset


class UserProfileDetail(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_queryset(self):
        user_group = self.request.user.userprofile.group
        queryset = UserProfile.objects.filter(group=user_group)
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
    
    
class GroupListCreate(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupSerializer
    
    def get_queryset(self):
        queryset = Group.objects.all()
        return queryset
    
    def perform_create(self, serializer):
        serializer.save()
        

        
class AddUserToGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        username = request.data.get('username')
        group_id = request.data.get('group_id')

        if not username or not group_id:
            return Response({'error': 'Username and group_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(username=username)
            group = Group.objects.get(id=group_id)

            requesting_user_profile = request.user.userprofile
            if not isinstance(requesting_user_profile,Administrator) or requesting_user_profile.group != group:
                return Response({'error': 'You are not authorized to add users to this group.'}, status=status.HTTP_403_FORBIDDEN)
            
            if UserProfile.objects.filter(user=user).exists():
                user_profile = UserProfile.objects.get(user=user)
                if user_profile.group == group:
                    return Response({'message': f'User {username} is already in group {group.name}'}, status=status.HTTP_200_OK)
                
                user_profile.group = group
                user_profile.save()
                return Response({'success': f'User {username} was moved to group {group.name}'}, status=status.HTTP_200_OK)
            else:
                user_profile = UserProfile.objects.create(user=user, group=group)
                return Response({'success': f'User {username} was created and added to group {group.name}'}, status=status.HTTP_201_CREATED)

        
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError:
            return Response({'error': 'A profile already exists for this user.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    
class GroupDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupSerializer
    
    def get_queryset(self):
        queryset = Group.objects.all()
        return queryset
    
