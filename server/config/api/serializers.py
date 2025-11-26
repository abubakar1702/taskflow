from rest_framework import serializers
from .models import Project, ProjectMember, Task, Subtask
from user.serializers import UserSerializer


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ProjectMember
        fields = ['id', 'project', 'user', 'role', 'created_at', 'updated_at']

class ProjectSerializer(serializers.ModelSerializer):
    members = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)
    creator = UserSerializer(read_only=True)
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'creator', 'members', 'created_at', 'updated_at']
    
class SubtaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    class Meta:
        model = Subtask
        fields = ['id', 'text', 'assignee', 'is_completed', 'task', 'created_at', 'updated_at']

class TaskSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    assignees = UserSerializer(many=True, read_only=True)
    subtasks = SubtaskSerializer(many=True, read_only=True)
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'creator', 'project', 'assignees', 'status', 'priority','subtasks', 'due_date', 'due_time', 'created_at', 'updated_at']