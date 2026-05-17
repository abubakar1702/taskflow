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

from rest_framework import serializers

class TeamProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name']

class TeamUserSerializer(UserSerializer):
    projects = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['projects']

    def get_projects(self, obj):
        request = self.context.get('request')
        if not request:
            return []
            
        request_user = request.user
        
        # Return only projects where BOTH the target member (obj) AND the requesting user are involved
        projects = Project.objects.filter(
            (Q(creator=obj) | Q(members=obj)) &
            (Q(creator=request_user) | Q(members=request_user))
        ).distinct()
        return TeamProjectSerializer(projects, many=True).data

class TeamAPIView(generics.ListAPIView):
    serializer_class = TeamUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Single query: users who share a project or task with the requesting user
        return User.objects.filter(
            Q(projects__in=Project.objects.filter(
                Q(creator=user) | Q(members=user)
            )) |
            Q(assigned_tasks__in=Task.objects.filter(
                Q(creator=user) | Q(assignees=user)
            ))
        ).exclude(id=user.id).distinct()

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
