from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings

from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Task, Subtask, ImportantTask
from .serializers import TaskSerializer, SubtaskSerializer, SearchForAssigneeSerializer, ImportantTaskSerializer
from .filters import TaskFilter

from user.models import User
from user.serializers import UserSerializer
from project.models import Project, ProjectMember
from project.serializers import ProjectSerializer
from asset.models import Asset
from notification.views import send_notification_to_user


def _task_queryset_for_user(user):
    return (
        Task.objects.filter(
            Q(creator=user) |
            Q(assignees=user) |
            Q(project__members=user)
        )
        .distinct()
        .select_related('project', 'creator')
        .prefetch_related('assignees', 'subtasks', 'subtasks__assignee')
        .annotate(total_assets_annotated=Count('assets', distinct=True))
    )


class TaskAPIView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = TaskFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['created_at', 'due_date']

    def get_queryset(self):
        return _task_queryset_for_user(self.request.user)

    def get_filterset_kwargs(self, *args, **kwargs):
        kwargs = super().get_filterset_kwargs(*args, **kwargs)
        kwargs['request'] = self.request
        return kwargs

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')

        if project:
            if not (
                project.members.filter(id=self.request.user.id).exists() or
                project.creator == self.request.user
            ):
                raise serializers.ValidationError({
                    "project": "You must be a project member to create tasks in this project"
                })

        task = serializer.save(creator=self.request.user)

        for assignee in task.assignees.all():
            send_notification_to_user(assignee.id, {
                "type": "task_assigned",
                "message": f"You have been assigned to task: {task.title}",
                "task_id": str(task.id),
                "task_title": task.title,
                "user_email": self.request.user.email,
            }, recipient=assignee)

            subject = f"New Task Assignment: {task.title}"
            message = (
                f"Hello {assignee.first_name},\n\n"
                f"You have been assigned to a new task: {task.title}.\n\n"
                f"Description: {task.description or 'No description provided'}\n\n"
                f"Please check the application for more details."
            )
            try:
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [assignee.email], fail_silently=True)
            except Exception as e:
                print(f"Failed to send email to {assignee.email}: {e}")


class TaskDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return _task_queryset_for_user(self.request.user)

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        if task.creator != request.user:
            raise PermissionDenied("Only the task creator can delete this task.")
        return super().destroy(request, *args, **kwargs)


class SubtasksApiView(generics.ListCreateAPIView):
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def _get_parent_task(self):
        """Fetch parent task once and cache on self."""
        if not hasattr(self, '_parent_task_cache'):
            self._parent_task_cache = get_object_or_404(Task, id=self.kwargs['parent_task_id'])
        return self._parent_task_cache

    def get_queryset(self):
        return (
            Subtask.objects.filter(task_id=self.kwargs['parent_task_id'])
            .select_related('task', 'assignee')
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['parent_task'] = self._get_parent_task()
        return context

    def perform_create(self, serializer):
        serializer.save(task=self._get_parent_task())


class SubtaskActionAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Subtask.objects.filter(
                Q(task__creator=self.request.user) |
                Q(task__assignees=self.request.user) |
                Q(task__project__members=self.request.user)
            )
            .distinct()
            .select_related('task', 'assignee')
        )


class AddAssigneeAPIView(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "task_id"

    def patch(self, request, *args, **kwargs):
        task = self.get_object()
        assignee_ids = request.data.get("assignee_ids", [])

        if not isinstance(assignee_ids, list) or not assignee_ids:
            return Response({"detail": "assignee_ids must be a non-empty list"}, status=400)

        users = User.objects.filter(id__in=assignee_ids)
        if users.count() != len(assignee_ids):
            missing = set(str(x) for x in assignee_ids) - set(str(u.id) for u in users)
            return Response({"detail": f"Invalid user IDs: {missing}"}, status=400)

        existing_ids = set(task.assignees.values_list('id', flat=True))
        new_users = [u for u in users if u.id not in existing_ids]

        if new_users:
            task.assignees.add(*new_users)

            for user in new_users:
                send_notification_to_user(user.id, {
                    "type": "task_assigned",
                    "message": f"You have been assigned to task: {task.title}",
                    "task_id": str(task.id),
                    "task_title": task.title,
                    "assigned_by": request.user.email,
                }, recipient=user)

                subject = f"New Task Assignment: {task.title}"
                message = (
                    f"Hello {user.first_name},\n\n"
                    f"You have been assigned to a task: {task.title}.\n\n"
                    f"Description: {task.description or 'No description provided'}\n\n"
                    f"Please check the application for more details."
                )
                try:
                    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
                except Exception as e:
                    print(f"Failed to send email to {user.email}: {e}")

        return Response({"detail": "Assignees added successfully."})


class RemoveAssigneeAPIView(generics.DestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "task_id"

    def delete(self, request, *args, **kwargs):
        task = self.get_object()
        assignee_id = kwargs.get("assignee_id")

        if not assignee_id:
            return Response({"detail": "assignee_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        task.assignees.remove(assignee_id)
        Subtask.objects.filter(task=task, assignee_id=assignee_id).update(assignee=None, is_completed=False)

        return Response({"detail": "Assignee removed successfully and related subtasks unassigned."})


class SearchForAssigneeAPIView(generics.ListAPIView):
    serializer_class = SearchForAssigneeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        search = self.request.query_params.get('user')
        project = self.request.query_params.get('project')

        if not search:
            raise ValidationError({"error": "Missing 'user' query parameter"})

        if project:
            return ProjectMember.objects.filter(
                project_id=project,
                user__email__icontains=search
            ).select_related("user")

        return User.objects.filter(email__icontains=search)


class LeaveTaskAPIView(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "task_id"

    def patch(self, request, *args, **kwargs):
        task = self.get_object()
        user = request.user

        if user not in task.assignees.all():
            return Response({"detail": "You are not an assignee of this task."}, status=400)
        task.assignees.remove(user)

        Subtask.objects.filter(task=task, assignee=user).update(assignee=None, is_completed=False)

        # Iterate so each Asset.delete() fires and removes the physical file
        for asset in Asset.objects.filter(task=task, uploaded_by=user):
            asset.delete()

        if task.creator and task.creator != user:
            send_notification_to_user(task.creator.id, {
                "type": "task_left",
                "message": f"{user.first_name} {user.last_name} has left the task: {task.title}",
                "task_id": str(task.id),
                "task_title": task.title,
                "user_email": user.email,
            }, recipient=task.creator)

        return Response({"detail": "You have left the task successfully."})


class UserTasksAPIView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Task.objects.filter(Q(creator=user) | Q(assignees=user))
            .distinct()
            .select_related('project', 'creator')
            .prefetch_related('assignees', 'subtasks', 'subtasks__assignee')
            .annotate(total_assets_annotated=Count('assets', distinct=True))
        )


class ImportantTaskAPIView(generics.ListCreateAPIView):
    serializer_class = ImportantTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ImportantTask.objects.filter(user=self.request.user)


class UnmarkImportantAPIView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(
            ImportantTask,
            task_id=self.kwargs['pk'],
            user=self.request.user
        )


class RunningTasksAPIView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from datetime import timedelta
        return (
            _task_queryset_for_user(self.request.user)
            .filter(
                Q(timer_start_time__isnull=False) |
                (Q(status='In Progress') & Q(time_taken__gt=timedelta(0)))
            )
            .order_by('-timer_start_time', '-updated_at')
        )
