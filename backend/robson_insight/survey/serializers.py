from rest_framework import serializers

from .models import Entry, Filter
from users.models import Group

class EntrySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Entry
        fields = '__all__'

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']
        
class FilterSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = Filter
        fields = ['id', 'name', 'user', 'groups']
        
class FilterIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filter
        fields = ['id']