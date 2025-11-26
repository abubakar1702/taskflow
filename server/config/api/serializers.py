from rest_framework import serializers
from .models import Project, ProjectMember, Task, Subtask
from user.serializers import UserSerializer


class ProjectMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMember
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    creator = UserSerializer(read_only=True)
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'creator', 'members', 'created_at', 'updated_at']
    

class TaskSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    assignees = UserSerializer(many=True, read_only=True)
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'creator', 'project', 'assignees', 'status', 'priority', 'due_date', 'due_time', 'created_at', 'updated_at']