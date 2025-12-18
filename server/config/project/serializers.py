from rest_framework import serializers
from .models import Project, ProjectMember
from user.serializers import UserSerializer
from user.models import User

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ProjectMember
        fields = ['id', 'project', 'user', 'role', 'created_at', 'updated_at']
        
class ProjectMemberBulkSerializer(serializers.ModelSerializer):
    member_id = serializers.UUIDField(write_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ['id', 'member_id', 'user', 'role', 'created_at', 'updated_at']

    def create(self, validated_data):
        project = self.context['project']
        member_id = validated_data.pop('member_id')

        user = User.objects.get(id=member_id)

        return ProjectMember.objects.create(
            project=project,
            user=user,
            **validated_data
        )

class ProjectSerializer(serializers.ModelSerializer):
    members = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)
    creator = UserSerializer(read_only=True)
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'creator', 'members', 'created_at', 'updated_at']
