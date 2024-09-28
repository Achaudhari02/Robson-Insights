from django.contrib.auth.models import User
from django.db.utils import IntegrityError
from django.db import transaction

from django.core.exceptions import ValidationError
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import UserProfile, Group
from .permissions import IsGroupAdmin

from .serializers import UserProfileSerializer, GroupSerializer
from .models import UserProfile, Group
from .permissions import IsInGroup, IsGroupAdmin


class UserProfileListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        return UserProfile.objects.all()


class UserProfileDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        queryset = UserProfile.objects.filter(pk=pk)
        return queryset


class GroupListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupSerializer

    def get_queryset(self):
        queryset = Group.objects.all()
        return queryset

    def perform_create(self, serializer):
        group = serializer.save()

        UserProfile.objects.create(
            user=self.request.user,
            group=group,
            is_admin=True
        )

class CreateGroup(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        group_name = request.data.get('group_name', '').strip()
        if not group_name:
            return Response({'error': 'Group name is required'}, status=status.HTTP_400_BAD_REQUEST)
        if len(group_name) > 100:
            return Response({'error': 'Group name cannot exceed 100 characters'}, status=status.HTTP_400_BAD_REQUEST)
        if len(group_name) < 5:
            return Response({'error': 'Group name must be at least 5 characters'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if Group.objects.filter(name__iexact=group_name).exists():
                return Response({'error': 'A group with this name already exists'}, status=status.HTTP_400_BAD_REQUEST)

            group = Group.objects.create(name=group_name)
            UserProfile.objects.create(user=request.user, group=group, is_admin=True)

            return Response(
                {'success': f'Group "{group.name}" created. You are now an administrator of this group.'},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print('Error:', str(e))
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsGroupAdmin]
    serializer_class = GroupSerializer

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        queryset = Group.objects.filter(pk=pk)
        return queryset


class UserProfileInGroupListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsInGroup]
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        group_pk = self.kwargs.get('pk')
        queryset = UserProfile.objects.filter(group=group_pk)
        return queryset


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

            requesting_user_admin = UserProfile.objects.get(user=request.user, group=group).is_admin
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

class RemoveUserFromGroup(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get('username')
        group_id = request.data.get('group_id')

        if not username or not group_id:
            return Response({'error': 'Username and group_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
            group = Group.objects.get(id=group_id)
            user_profile = UserProfile.objects.get(user=user, group=group)

            requesting_user_admin = UserProfile.objects.get(user=request.user, group=group).is_admin
            if not requesting_user_admin:
                return Response({'error': 'You are not authorized to remove users from this group.'}, status=status.HTTP_403_FORBIDDEN)

            user_profile.delete()

            return Response({'success': f'User {username} removed from group {group.name}'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User is not in this group'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChangeGroupAdminView(APIView):
    permission_classes = [IsAuthenticated, IsGroupAdmin]

    def post(self, request, pk):
        new_admin_username = request.data.get('username')

        if not new_admin_username:
            return Response(
                {'error': 'New admin username is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            group = Group.objects.get(pk=pk)
            new_admin_user = User.objects.get(username__iexact=new_admin_username)
            new_admin_profile = UserProfile.objects.get(user=new_admin_user, group=group)
        except Group.DoesNotExist:
            return Response(
                {'error': 'Group not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'User is not a member of the group.'},
                status=status.HTTP_404_NOT_FOUND
            )

        current_admin_profile = UserProfile.objects.get(user=request.user, group=group, is_admin=True)

        if current_admin_profile.user != request.user:
            return Response(
                {'error': 'You are not authorized to change the admin of this group.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            with transaction.atomic():
                current_admin_profile.is_admin = False
                current_admin_profile.save()

                new_admin_profile.is_admin = True
                new_admin_profile.save()
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'success': f'User {new_admin_user.username} is now the admin of group {group.name}.'},
            status=status.HTTP_200_OK
        )