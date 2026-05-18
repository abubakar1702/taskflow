from rest_framework import serializers
from django.shortcuts import get_object_or_404
from django.db.models import Count

from .models import Task, Subtask, ImportantTask, TaskComment, TaskActivity
from project.models import Project
from project.serializers import ProjectSerializer
from user.serializers import UserSerializer
from user.models import User


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
        parent_task = self.context.get('parent_task')
        task = parent_task or getattr(self.instance, 'task', None)

        assignee = attrs.get('assignee')

        if assignee and task:
            # Use .filter().exists() to avoid fetching all assignees
            is_creator = (assignee == task.creator)
            is_assignee = task.assignees.filter(id=assignee.id).exists()
            if not is_creator and not is_assignee:
                raise serializers.ValidationError({
                    "assignee": "Subtask assignee must be a task assignee or the task creator."
                })
        return attrs


class DependencyTaskSerializer(serializers.ModelSerializer):
    """Minimal task info used when listing dependencies or blockers."""
    class Meta:
        model = Task
        fields = ['id', 'title', 'status', 'priority']


class TaskSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)

    project_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
        source='project',
        write_only=True,
        required=False,
        allow_null=True
    )
    assignees_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assignees',
        many=True,
        write_only=True
    )
    dependencies_ids = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(),
        source='dependencies',
        many=True,
        write_only=True,
        required=False
    )

    subtasks_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    assignees = UserSerializer(many=True, read_only=True)
    subtasks = SubtaskSerializer(many=True, read_only=True)
    
    dependencies = DependencyTaskSerializer(many=True, read_only=True)
    blocking = DependencyTaskSerializer(many=True, read_only=True)

    total_assets = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'creator', 'project_id', 'project',
            'assignees_ids', 'assignees', 'status', 'priority',
            'subtasks', 'subtasks_data', 'total_assets',
            'dependencies', 'dependencies_ids', 'blocking',
            'due_date', 'due_time', 'time_taken', 'timer_start_time',
            'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        subtasks_data = validated_data.pop('subtasks_data', [])
        assignees = validated_data.pop('assignees', [])
        dependencies = validated_data.pop('dependencies', [])
        project = validated_data.pop('project', None)

        task = Task.objects.create(project=project, **validated_data)
        task.assignees.set(assignees)
        task.dependencies.set(dependencies)

        # Build a set of valid assignee IDs to avoid repeated DB queries
        valid_ids = {str(a.id) for a in assignees}
        creator_id = str(task.creator_id) if task.creator_id else None

        for subtask_data in subtasks_data:
            assignee_id = subtask_data.pop('assignee_id', None)
            assignee = None

            if assignee_id:
                str_id = str(assignee_id)
                if str_id != creator_id and str_id not in valid_ids:
                    raise serializers.ValidationError({
                        "subtasks_data": "Each subtask assignee must be a task assignee or the creator."
                    })
                # Safe to fetch now — we know they're valid
                try:
                    assignee = User.objects.get(id=assignee_id)
                except User.DoesNotExist:
                    raise serializers.ValidationError({
                        "subtasks_data": f"User with id {assignee_id} does not exist."
                    })

            Subtask.objects.create(task=task, assignee=assignee, **subtask_data)

        return task

    def get_total_assets(self, obj):
        # Use annotation if the view provided it; fallback to a count query
        annotated = getattr(obj, 'total_assets_annotated', None)
        if annotated is not None:
            return annotated
        return obj.assets.count()


class ImportantTaskSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    task = TaskSerializer(read_only=True)
    task_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ImportantTask
        fields = ['id', 'user', 'task', 'task_id', 'marked_at']

    def create(self, validated_data):
        task_id = validated_data.pop('task_id')
        task = get_object_or_404(Task, id=task_id)

        return ImportantTask.objects.create(
            task=task
        )

class TaskCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'author', 'content', 'parent', 'replies', 'is_edited', 'created_at', 'updated_at']
        read_only_fields = ['id', 'task', 'author', 'replies', 'is_edited', 'created_at', 'updated_at']

    def get_replies(self, obj):
        if obj.replies.exists():
            return TaskCommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []

class TaskActivitySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskActivity
        fields = ['id', 'task', 'user', 'type', 'action', 'details', 'timestamp']
        read_only_fields = ['id', 'task', 'user', 'timestamp']
