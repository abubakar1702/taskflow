from rest_framework import serializers
from .models import Project, ProjectMember, Task, Subtask
from user.serializers import UserSerializer
from user.models import User


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
    assignee_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='assignee', write_only=True)
    class Meta:
        model = Subtask
        fields = ['id', 'text','assignee_id', 'assignee', 'is_completed', 'task', 'created_at', 'updated_at']

class TaskSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    
    project_id = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), source='project', write_only=True)
    assignees_ids = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='assignees', many=True, write_only=True)
    
    subtasks_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    assignees = UserSerializer(many=True, read_only=True)
    subtasks = SubtaskSerializer(many=True, read_only=True)
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'creator','project_id', 'project','assignees_ids', 'assignees', 'status', 'priority','subtasks','subtasks_data', 'due_date', 'due_time', 'created_at', 'updated_at']
        
    def create(self, validated_data):
        subtasks_data = validated_data.pop('subtasks_data', [])
        assignees = validated_data.pop('assignees', [])
        project = validated_data.pop('project', None)

        task = Task.objects.create(project=project, **validated_data)
        task.assignees.set(assignees)

        for subtask_data in subtasks_data:
            assignee = subtask_data.pop('assignee', None)
            Subtask.objects.create(task=task, assignee=assignee, **subtask_data)

        return task
