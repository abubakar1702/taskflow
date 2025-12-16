from rest_framework import serializers
from .models import Project, ProjectMember, Task, Subtask, Asset, ImportantTask
from user.serializers import UserSerializer
from user.models import User
from django.db.models import Count


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

    
class SearchForAssigneeSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    email = serializers.CharField(read_only=True)
    username = serializers.CharField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    display_name = serializers.CharField(read_only=True)
    avatar = serializers.CharField(read_only=True)

    def to_representation(self, obj):
        if hasattr(obj, 'user'):
            user = obj.user
        else:
            user = obj

        request = self.context.get("request")

        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "display_name": user.full_name,
            "avatar": (
                request.build_absolute_uri(user.avatar.url)
                if user.avatar else None
            )
        }



class ProjectSerializer(serializers.ModelSerializer):
    members = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)
    creator = UserSerializer(read_only=True)
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'creator', 'members', 'created_at', 'updated_at']
    
class SubtaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assignee',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Subtask
        fields = [
            'id', 'text', 'assignee_id', 'assignee',
            'is_completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'assignee', 'created_at', 'updated_at']

    def validate(self, attrs):
        request = self.context['request']
        parent_task = self.context.get('parent_task')  
        task = parent_task or getattr(self.instance, 'task', None)

        assignee = attrs.get('assignee')

        if assignee and assignee != task.creator and assignee not in task.assignees.all():
            raise serializers.ValidationError({
                "assignee": "Subtask assignee must be a task assignee or the task creator."
            })
        return attrs


class TaskSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    
    project_id = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), source='project', write_only=True, required=False, allow_null=True)
    assignees_ids = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='assignees', many=True, write_only=True)
    
    subtasks_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    assignees = UserSerializer(many=True, read_only=True)
    subtasks = SubtaskSerializer(many=True, read_only=True)
    
    total_assets = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'creator','project_id', 'project','assignees_ids', 'assignees', 'status', 'priority','subtasks','subtasks_data','total_assets', 'due_date', 'due_time', 'created_at', 'updated_at']
        
    def create(self, validated_data):
        subtasks_data = validated_data.pop('subtasks_data', [])
        assignees = validated_data.pop('assignees', [])
        project = validated_data.pop('project', None)

        task = Task.objects.create(project=project, **validated_data)
        task.assignees.set(assignees)

        for subtask_data in subtasks_data:
            assignee_id = subtask_data.pop('assignee_id', None)
    
            assignee = None
            if assignee_id:
                assignee = User.objects.get(id=assignee_id)

            if assignee:
                if assignee != task.creator and assignee not in task.assignees.all():
                    raise serializers.ValidationError({
                        "subtasks_data": "Each subtask assignee must be one of the task assignees or the task creator."
                })

            Subtask.objects.create(task=task, assignee=assignee, **subtask_data)


        return task
    
    def get_total_assets(self, obj):
        return obj.assets.count()


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
    
class ImportantTaskSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    task = TaskSerializer(read_only=True)
    task_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ImportantTask
        fields = ['id', 'user', 'task', 'task_id', 'marked_at']

    def create(self, validated_data):
        task_id = validated_data.pop('task_id')
        task = Task.objects.get(id=task_id)

        return ImportantTask.objects.create(
            user=self.context['request'].user,
            task=task
        )

