from rest_framework import serializers

from .models import Entry, Filter

class EntrySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Entry
        fields = '__all__'
        
        
class FilterSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Filter
        fields = '__all__'
        
        
