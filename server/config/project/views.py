from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Q
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer, ProjectMemberBulkSerializer
from user.serializers import UserSerializer
from task.models import Task, Subtask
from asset.models import Asset

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

        Task.objects.filter(
            project=project,
            creator=user
        ).delete()

        for task in Task.objects.filter(project=project, assignees=user):
            task.assignees.remove(user)

        Subtask.objects.filter(
            task__project=project,
            assignee=user
        ).update(
            assignee=None,
            is_completed=False
        )

        Asset.objects.filter(
            uploaded_by=user
        ).filter(
            Q(project=project) | Q(task__project=project)
        ).delete()

        project_member.delete()

        return Response(
            {"detail": "Project member removed successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
