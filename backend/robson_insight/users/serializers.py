from rest_framework import serializers

from .models import UserProfile, Group, Invite


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'group', 'can_add', 'can_view']        

class GroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = '__all__'
        
        
class SmallInviteSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Invite
        fields = ['email']
        
        
class InviteSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)
    group_members = serializers.SerializerMethodField()

    class Meta:
        model = Invite
        fields = ['id', 'token', 'email', 'created_on', 'group_name', 'group_members']

    def get_group_members(self, obj):
        return obj.group.userprofile_set.values_list('user__username', flat=True)
