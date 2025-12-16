from rest_framework import serializers
from .models import Note
from user.serializers import UserSerializer


class NoteSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'owner', 'is_pinned', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)