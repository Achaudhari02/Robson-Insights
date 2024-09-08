from rest_framework import generics, permissions,status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken, APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer, GroupSerializer
from .models import UserProfile, Group, Administrator
from django.contrib.auth.models import User
from django.db.utils import IntegrityError
from django.http import Http404


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
        username = request.data.get('username', '').lower()
        group_id = request.data.get('group_id')

        if not username or not group_id:
            return Response({'error': 'Username and group_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(username__iexact=username)
            group = Group.objects.get(id=group_id)

            requesting_user_admin = Administrator.objects.filter(user=request.user, group=group).exists()
            if not requesting_user_admin:
                return Response({'error': 'You are not authorized to add users to this group.'}, status=status.HTTP_403_FORBIDDEN)
            
            user_profile, created = UserProfile.objects.get_or_create(user=user, group=group)
            if created:
                return Response({'success': f'User {user.username} was added to group {group.name}'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': f'User {user.username} is already in group {group.name}'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError:
            return Response({'error': 'An error occurred while adding the user to the group.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            
    
class GroupDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupSerializer
    
    def get_queryset(self):
        queryset = Group.objects.all()
        return queryset
    

class GroupsUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get(self, request, pk):
        try:
            group = Group.objects.get(pk=pk)
            user_profile = request.user.userprofile_set.filter(group=group).first()
            if not user_profile:
                return Response({'error': 'You do not have permission to view this group'}, status=status.HTTP_403_FORBIDDEN)
            queryset = UserProfile.objects.filter(group=group)
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)