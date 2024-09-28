from rest_framework import serializers

from .models import UserProfile, Group, Invite


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'group']        

class GroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = '__all__'
        
        
class InviteSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Invite
        fields = '__all__'