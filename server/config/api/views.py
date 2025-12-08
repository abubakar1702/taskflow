from django.shortcuts import render
from .serializers import ProjectSerializer, ProjectMemberSerializer, TaskSerializer, SubtaskSerializer
from django.shortcuts import get_object_or_404  
from .models import Project, ProjectMember, Task, Subtask
from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .filters import TaskFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response

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
        
class SearchTaskAssigneesAPIView(generics.ListAPIView):
    serializer_class = ProjectMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        search_query = self.request.GET.get('member', '')

        if not search_query or '@' not in search_query:
            return ProjectMember.objects.none()

        return ProjectMember.objects.filter(
            project_id=project_id,
            user__email__icontains=search_query
        ).select_related('user', 'project')


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
            return Response({"detail": "assignee_ids must be a non-empty list"}, status=status.HTTP_400_BAD_REQUEST)

        task.assignees.add(*assignee_ids)
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
        return Response({"detail": "Assignee removed successfully."})
