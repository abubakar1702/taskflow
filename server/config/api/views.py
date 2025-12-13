from django.shortcuts import render
from .serializers import ProjectSerializer, ProjectMemberSerializer, TaskSerializer, SubtaskSerializer, SearchForAssigneeSerializer, AssetSerializer, ProjectMemberBulkSerializer
from django.shortcuts import get_object_or_404  
from .models import Project, ProjectMember, Task, Subtask, Asset
from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .filters import TaskFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
from rest_framework import status
from user.models import User
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction

class TaskAPIView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = TaskFilter
    
    filter_backends = [DjangoFilterBackend, OrderingFilter]

    ordering_fields = ['created_at', 'due_date']

    def get_queryset(self):
        return (
            Task.objects.filter(
                Q(creator=self.request.user) |
                Q(assignees__in=[self.request.user]) |
                Q(project__members__in=[self.request.user])
            )
            .distinct()
            .select_related('project', 'creator')
            .prefetch_related('assignees')
        )
        
    def filter_queryset(self, queryset):
        for backend in list(self.filter_backends):
            if backend == DjangoFilterBackend:
                filterset = self.filterset_class(
                    self.request.GET, 
                    queryset=queryset,
                    request=self.request
                )
                if filterset.is_valid():
                    queryset = filterset.qs
            else:
                queryset = backend().filter_queryset(self.request, queryset, self)
        return queryset
    
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
        
        serializer.save(creator=self.request.user)
        
class TaskDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return (
            Task.objects.filter(
                Q(creator=self.request.user) |
                Q(assignees__in=[self.request.user]) |
                Q(project__members__in=[self.request.user])
            )
            .distinct()
            .select_related('project', 'creator')
            .prefetch_related('assignees')
        )


class SubtasksApiView(generics.ListCreateAPIView):
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        parent_id = self.kwargs['parent_task_id']

        return (
            Subtask.objects.filter(task_id=parent_id)
            .select_related('task', 'assignee')
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        parent_task_id = self.kwargs.get('parent_task_id')
        parent_task = get_object_or_404(Task, id=parent_task_id)
        context['parent_task'] = parent_task
        return context

    def perform_create(self, serializer):
        parent_task_id = self.kwargs.get('parent_task_id')
        parent_task = get_object_or_404(Task, id=parent_task_id)

        serializer.save(task=parent_task)
        
class SubtaskActionAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Subtask.objects.filter(
                Q(task__creator=self.request.user) |
                Q(task__assignees__in=[self.request.user]) |
                Q(task__project__members__in=[self.request.user])
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
        print("Adding assignees IDs:", assignee_ids)

        if not isinstance(assignee_ids, list) or not assignee_ids:
            return Response({"detail": "assignee_ids must be a non-empty list"}, status=400)

        users = User.objects.filter(id__in=assignee_ids)
        if users.count() != len(assignee_ids):
            missing = set(assignee_ids) - set(users.values_list('id', flat=True))
            return Response({"detail": f"Invalid user IDs: {missing}"}, status=400)

        task.assignees.add(*users)
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

        return User.objects.filter(
            email__icontains=search
        )

#if an assignee leaves a task, he will be removed from the assignees list and all his subtasks will be unassigned and all the assets he uploaded to that task will be deleted. I he checked a subtask as completed, it will be set to false.
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
        Asset.objects.filter(task=task, uploaded_by=user).delete()
        
        return Response({"detail": "You have left the task successfully."})

class AssetCreateAPIView(generics.CreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

#not in use
class AssetListAPIView(generics.ListAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        task_id = self.request.query_params.get("task")
        project_id = self.request.query_params.get("project")

        if task_id:
            queryset = queryset.filter(task_id=task_id)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset


class AssetDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return get_object_or_404(Asset, id=self.kwargs['pk'])

    def destroy(self, request, *args, **kwargs):
        asset = self.get_object()
        if asset.file:
            asset.file.delete(save=False)
        asset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TaskAssetsAPIView(generics.ListCreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        task = self.kwargs.get('task')
        return Asset.objects.filter(task_id=task)
    
    def perform_create(self, serializer):
        task = self.kwargs.get('task')
        serializer.save(task_id=task, uploaded_by=self.request.user)
    
class ProjectAssetsAPIView(generics.ListCreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        project = self.kwargs.get('project')
        return Asset.objects.filter(project_id=project)
    
    def perform_create(self, serializer):
        project = self.kwargs.get('project')
        serializer.save(project_id=project, uploaded_by=self.request.user)

class AssetActionAPIView(generics.RetrieveDestroyAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    

class ProjectsAPIView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Project.objects.filter(
                Q(creator=self.request.user) |
                Q(members__in=[self.request.user])
            )
            .distinct()
            .select_related('creator')
            .prefetch_related('members')
        )
        
    # the creator is automatically added as a member with Admin role
    @transaction.atomic
    def perform_create(self, serializer):
        project = serializer.save(creator=self.request.user)
        ProjectMember.objects.create(
            project=project,
            user=self.request.user,
            role=ProjectMember.Role.ADMIN
        )
        
class ProjectDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

class ProjectMembersAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectMemberBulkSerializer

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return ProjectMember.objects.filter(
            project_id=project_id
        ).select_related('user', 'project')

    def get_serializer(self, *args, **kwargs):
        kwargs['many'] = True
        kwargs['context'] = self.get_serializer_context()
        return super().get_serializer(*args, **kwargs)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        project = get_object_or_404(Project, id=self.kwargs['project_id'])
        context['project'] = project
        return context

#if a member is removed from a project,all task will be deleted if the task belong to that project, all tasks assigned to him in that project will have him removed from assignees list, all his subtasks will be unassigned and all assets he uploaded to that project will be deleted. If he checked a subtask as completed, it will be set to false.
class ProjectMemberActionAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectMember.objects.select_related('user', 'project')
    serializer_class = ProjectMemberSerializer
    permission_classes = [IsAuthenticated]

    lookup_field = "id"
    lookup_url_kwarg = "member_id"

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        project_member = self.get_object()
        user = project_member.user
        project = project_member.project

        # 1. Delete tasks CREATED by this member in this project
        Task.objects.filter(
            project=project,
            creator=user
        ).delete()


        # 2. Remove user from assignees of remaining tasks
        for task in Task.objects.filter(project=project, assignees=user):
            task.assignees.remove(user)

        # 3. Unassign ALL subtasks in this project
        Subtask.objects.filter(
            task__project=project,
            assignee=user
        ).update(
            assignee=None,
            is_completed=False
        )

        # 4. Delete assets uploaded by the user (project + task assets)
        Asset.objects.filter(
            uploaded_by=user
        ).filter(
            Q(project=project) | Q(task__project=project)
        ).delete()

        # 5. Remove membership
        project_member.delete()

        return Response(
            {"detail": "Project member removed successfully."},
            status=status.HTTP_204_NO_CONTENT
        )

