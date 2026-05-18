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

from .models import Task, Subtask, ImportantTask, TaskComment, TaskActivity
from .serializers import TaskSerializer, SubtaskSerializer, SearchForAssigneeSerializer, ImportantTaskSerializer, TaskCommentSerializer, TaskActivitySerializer
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
        .prefetch_related(
            'assignees',
            'subtasks',
            'subtasks__assignee',
            'dependencies',
            'blocking'
        )
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

        TaskActivity.objects.create(
            task=task,
            user=self.request.user,
            type="created",
            action="created this task"
        )

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

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        old_priority = serializer.instance.priority
        old_due_date = serializer.instance.due_date

        updated_task = serializer.save()

        if old_status != updated_task.status:
            TaskActivity.objects.create(
                task=updated_task,
                user=self.request.user,
                type="status_change",
                action=f"changed status from {old_status} to {updated_task.status}",
                details={"from": old_status, "to": updated_task.status}
            )
            from django.utils import timezone
            
            if updated_task.status == 'Done' and old_status != 'Done':
                updated_task.completed_at = timezone.now()
                updated_task.save(update_fields=['completed_at'])

                # Credit record for creator
                if updated_task.creator:
                    TaskActivity.objects.create(
                        task=updated_task,
                        user=updated_task.creator,
                        type="credit",
                        action="completed this task",
                        details={}
                    )
                # Credit record for assignees
                for assignee in updated_task.assignees.all():
                    if assignee != updated_task.creator:
                        TaskActivity.objects.create(
                            task=updated_task,
                            user=assignee,
                            type="credit",
                            action="completed this task",
                            details={}
                        )
            elif old_status == 'Done' and updated_task.status != 'Done':
                updated_task.completed_at = None
                updated_task.save(update_fields=['completed_at'])
                TaskActivity.objects.filter(task=updated_task, type="credit").delete()

            # --- Approval Workflow Notifications ---
            from notification.models import Notification
            
            # Workflow: Submitted -> Notify Creator
            if updated_task.status == 'Submitted' and updated_task.creator and updated_task.creator != self.request.user:
                Notification.objects.create(
                    recipient=updated_task.creator,
                    type="task_submitted",
                    message=f"{self.request.user.first_name} submitted task '{updated_task.title}' for review.",
                    data={"task_id": str(updated_task.id), "link": f"/tasks/{updated_task.id}"}
                )

            # Workflow: Approved (Submitted -> Done) -> Notify Assignees
            elif old_status == 'Submitted' and updated_task.status == 'Done':
                for assignee in updated_task.assignees.all():
                    if assignee != self.request.user:
                        Notification.objects.create(
                            recipient=assignee,
                            type="task_approved",
                            message=f"{self.request.user.first_name} approved task '{updated_task.title}'.",
                            data={"task_id": str(updated_task.id), "link": f"/tasks/{updated_task.id}"}
                        )

            # Workflow: Changes Requested (Submitted -> In Progress) -> Notify Assignees
            elif old_status == 'Submitted' and updated_task.status == 'In Progress':
                for assignee in updated_task.assignees.all():
                    if assignee != self.request.user:
                        Notification.objects.create(
                            recipient=assignee,
                            type="task_changes_requested",
                            message=f"{self.request.user.first_name} requested changes on '{updated_task.title}'.",
                            data={"task_id": str(updated_task.id), "link": f"/tasks/{updated_task.id}"}
                        )
                        
        if old_priority != updated_task.priority:
            TaskActivity.objects.create(
                task=updated_task,
                user=self.request.user,
                type="priority_change",
                action=f"changed priority from {old_priority} to {updated_task.priority}",
                details={"from": old_priority, "to": updated_task.priority}
            )
        if old_due_date != updated_task.due_date:
            date_str = updated_task.due_date.strftime('%b %d, %Y') if updated_task.due_date else 'None'
            TaskActivity.objects.create(
                task=updated_task,
                user=self.request.user,
                type="due_date",
                action=f"updated due date to {date_str}",
                details={"date": date_str}
            )

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
            queryset = _task_queryset_for_user(self.request.user)
            self._parent_task_cache = get_object_or_404(queryset, id=self.kwargs['parent_task_id'])
        return self._parent_task_cache

    def get_queryset(self):
        queryset = _task_queryset_for_user(self.request.user)
        parent_task = get_object_or_404(queryset, id=self.kwargs['parent_task_id'])
        return (
            Subtask.objects.filter(task=parent_task)
            .select_related('task', 'assignee')
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['parent_task'] = self._get_parent_task()
        return context

    def perform_create(self, serializer):
        serializer.save(task=self._get_parent_task())


class SubtaskActionAPIView(generics.RetrieveUpdateDestroyAPIView):
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

    def perform_update(self, serializer):
        subtask = self.get_object()
        task = subtask.task
        user = self.request.user
        is_creator = (task.creator == user)

        # 1. Text Update Rule: Only task creator can edit subtask text
        new_text = serializer.validated_data.get('text')
        if new_text is not None and new_text != subtask.text:
            if not is_creator:
                raise PermissionDenied("Only the task creator can edit the subtask text.")

        # 2. Assignment Update Rule: Only task creator or current subtask assignee can modify assignee
        if 'assignee' in serializer.validated_data:
            new_assignee = serializer.validated_data.get('assignee')
            if new_assignee != subtask.assignee:
                is_subtask_assignee = (subtask.assignee == user)
                if not is_creator and not is_subtask_assignee:
                    raise PermissionDenied("Only the task creator or the current subtask assignee can modify the assignment.")

        # 3. Toggle Completion Rule: task creator, subtask assignee, or task assignee/member
        new_is_completed = serializer.validated_data.get('is_completed')
        if new_is_completed is not None and new_is_completed != subtask.is_completed:
            is_task_assignee = task.assignees.filter(id=user.id).exists()
            is_subtask_assignee = (subtask.assignee == user)
            is_project_member = task.project.members.filter(id=user.id).exists() if task.project else False
            if not is_creator and not is_subtask_assignee and not is_task_assignee and not is_project_member:
                raise PermissionDenied("You do not have permission to toggle completion of this subtask.")

        serializer.save()

    def perform_destroy(self, instance):
        # 4. Deleting a Subtask: Only the task creator can delete
        if instance.task.creator != self.request.user:
            raise PermissionDenied("Only the task creator can delete this subtask.")
        instance.delete()


class AddAssigneeAPIView(generics.UpdateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "task_id"

    def get_queryset(self):
        return _task_queryset_for_user(self.request.user)

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
                TaskActivity.objects.create(
                    task=task,
                    user=request.user,
                    type="assignee_added",
                    action=f"assigned {user.display_name or user.email}",
                    details={"assignee": {"display_name": user.display_name, "email": user.email}}
                )

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
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "task_id"

    def get_queryset(self):
        return _task_queryset_for_user(self.request.user)

    def delete(self, request, *args, **kwargs):
        task = self.get_object()
        assignee_id = kwargs.get("assignee_id")

        if not assignee_id:
            return Response({"detail": "assignee_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        task.assignees.remove(assignee_id)
        try:
            removed_user = User.objects.get(id=assignee_id)
            TaskActivity.objects.create(
                task=task,
                user=request.user,
                type="assignee_removed",
                action=f"removed assignee {removed_user.display_name or removed_user.email}",
                details={"assignee": {"display_name": removed_user.display_name, "email": removed_user.email}}
            )
        except User.DoesNotExist:
            pass

        Subtask.objects.filter(task=task, assignee_id=assignee_id).update(assignee=None, is_completed=False)

        return Response({"detail": "Assignee removed successfully and related subtasks unassigned."})


class SearchForAssigneeAPIView(generics.ListAPIView):
    serializer_class = SearchForAssigneeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        search = self.request.query_params.get('user', '').strip()
        project = self.request.query_params.get('project')

        if project:
            queryset = ProjectMember.objects.filter(project_id=project).select_related("user")
            if search:
                queryset = queryset.filter(user__email__icontains=search)
            return queryset

        queryset = User.objects.all()
        if search:
            queryset = queryset.filter(email__icontains=search)
        return queryset


class LeaveTaskAPIView(generics.UpdateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "task_id"

    def get_queryset(self):
        return _task_queryset_for_user(self.request.user)

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
            .prefetch_related(
                'assignees',
                'subtasks',
                'subtasks__assignee',
                'dependencies',
                'blocking'
            )
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

class TaskCommentAPIView(generics.ListCreateAPIView):
    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = _task_queryset_for_user(self.request.user)
        task = get_object_or_404(queryset, id=self.kwargs['task_id'])
        return TaskComment.objects.filter(task=task).select_related('author')

    def perform_create(self, serializer):
        queryset = _task_queryset_for_user(self.request.user)
        task = get_object_or_404(queryset, id=self.kwargs['task_id'])
        if task.creator != self.request.user and not task.assignees.filter(id=self.request.user.id).exists():
            raise PermissionDenied("Only the task creator and assignees can add comments to this task.")
        comment = serializer.save(author=self.request.user, task=task)
        TaskActivity.objects.create(
            task=task,
            user=self.request.user,
            type="comment",
            action="commented",
            details={"comment": comment.content}
        )

class TaskCommentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaskComment.objects.filter(
            Q(task__creator=self.request.user) |
            Q(task__assignees=self.request.user) |
            Q(task__project__members=self.request.user)
        ).distinct()

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise PermissionDenied("You can only edit your own comments.")
        serializer.save(is_edited=True)

    def perform_destroy(self, instance):
        if instance.author != self.request.user and instance.task.creator != self.request.user:
            raise PermissionDenied("You do not have permission to delete this comment.")
        instance.delete()

class TaskCommentLikeDislikeAPIView(generics.UpdateAPIView):
    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "pk"

    def get_queryset(self):
        return TaskComment.objects.filter(
            Q(task__creator=self.request.user) |
            Q(task__assignees=self.request.user) |
            Q(task__project__members=self.request.user)
        ).distinct()

    def patch(self, request, *args, **kwargs):
        comment = self.get_object()
        user = request.user
        action = request.data.get("action")

        if action == "like":
            if comment.likes.filter(id=user.id).exists():
                comment.likes.remove(user)
            else:
                comment.likes.add(user)
                comment.dislikes.remove(user)
        elif action == "dislike":
            if comment.dislikes.filter(id=user.id).exists():
                comment.dislikes.remove(user)
            else:
                comment.dislikes.add(user)
                comment.likes.remove(user)
        else:
            return Response({"detail": "Invalid action. Use 'like' or 'dislike'."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(comment)
        return Response(serializer.data)

class TaskActivityAPIView(generics.ListAPIView):
    serializer_class = TaskActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = _task_queryset_for_user(self.request.user)
        task = get_object_or_404(queryset, id=self.kwargs['task_id'])
        return TaskActivity.objects.filter(task=task).select_related('user')
