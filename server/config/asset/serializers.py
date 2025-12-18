from rest_framework import serializers
from .models import Asset
from user.serializers import UserSerializer

class AssetSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = Asset
        fields = ['id', 'file', 'task', 'project',
                  'uploaded_by', 'uploaded_at']

    def validate(self, data):
        task = data.get('task')
        project = data.get('project')
        if not task and not project:
            raise serializers.ValidationError(
                "Asset must belong to either a task or a project.")
        if task and project:
            raise serializers.ValidationError(
                "Asset cannot belong to both a task and a project.")
        return data
