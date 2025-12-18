from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from user.models import User
from user.serializers import UserSerializer
from project.models import Project, ProjectMember
from project.serializers import ProjectSerializer
from task.models import Task
from task.serializers import TaskSerializer

class TeamAPIView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        project_members = ProjectMember.objects.filter(
            Q(project__members=user) |
            Q(project__creator=user)
        ).exclude(user=user)

        task_assignees = User.objects.filter(
            assigned_tasks__in=user.assigned_tasks.all()
        ).exclude(id=user.id)

        return User.objects.filter(
            Q(id__in=project_members.values_list('user_id', flat=True)) |
            Q(id__in=task_assignees.values_list('id', flat=True))
        ).distinct()

class SearchAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        query = request.query_params.get('q', '').strip()

        if len(query) < 2:
            return Response({"projects": [], "tasks": []})

        projects = Project.objects.filter(
            Q(name__icontains=query),
            Q(creator=request.user) | Q(members=request.user)
        ).distinct()[:10]

        tasks = Task.objects.filter(
            Q(title__icontains=query),
            Q(creator=request.user) | 
            Q(assignees=request.user) | 
            Q(project__members=request.user)
        ).select_related('project').distinct()[:20]

        return Response({
            "projects": ProjectSerializer(projects, many=True).data,
            "tasks": TaskSerializer(tasks, many=True).data
        }, status=status.HTTP_200_OK)
