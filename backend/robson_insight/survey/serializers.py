from rest_framework import serializers

from .models import Entry

class EntrySerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.user.username')
    
    class Meta:
        model = Entry
        fields = '__all__'
        
        
