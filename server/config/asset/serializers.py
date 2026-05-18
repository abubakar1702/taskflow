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
        user = self.context['request'].user

        if not task and not project:
            raise serializers.ValidationError(
                "Asset must belong to either a task or a project.")
        if task and project:
            raise serializers.ValidationError(
                "Asset cannot belong to both a task and a project.")

        if task:
            # Check upload permission: task creator or task assignee
            is_creator = (task.creator == user)
            is_assignee = task.assignees.filter(id=user.id).exists()
            if not is_creator and not is_assignee:
                raise serializers.ValidationError(
                    "You do not have permission to upload assets to this task. Only the creator or assignees can do so."
                )

        if project:
            # Check upload permission: project creator or project member
            is_project_creator = (project.creator == user)
            is_project_member = project.members.filter(id=user.id).exists()
            if not is_project_creator and not is_project_member:
                raise serializers.ValidationError(
                    "You must be a project member to upload assets to this project."
                )

        return data
