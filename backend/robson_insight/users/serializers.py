from django.core.signing import Signer
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
    
    class Meta:
        model = Invite
        fields = '__all__'
        
        
class MassInviteSerializer(serializers.Serializer):
    emails = serializers.ListField(
        child=serializers.EmailField(),
        allow_empty=False,
        write_only=True
    )
    
    def validate_emails(self, emails):
        if len(emails) != len(set(emails)):
            raise serializers.ValidationError("Duplicate emails are not allowed.")
        return emails
