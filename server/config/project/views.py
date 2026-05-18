from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction

from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer, ProjectMemberBulkSerializer
from user.serializers import UserSerializer
from task.models import Task, Subtask
from asset.models import Asset


def _user_projects(user):
    return Project.objects.filter(
        Q(creator=user) | Q(members=user)
    ).distinct()


def _require_project_admin(project, user):
    """Raise PermissionDenied if the user is not the creator or an Admin member."""
    if project.creator == user:
        return
    is_admin = ProjectMember.objects.filter(
        project=project, user=user, role=ProjectMember.Role.ADMIN
    ).exists()
    if not is_admin:
        raise PermissionDenied("Only project admins can perform this action.")


class ProjectsAPIView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            _user_projects(self.request.user)
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
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Scope retrieval to projects the user belongs to
        return _user_projects(self.request.user)

    def update(self, request, *args, **kwargs):
        project = self.get_object()
        _require_project_admin(project, request.user)
        return super().update(request, *args, **kwargs)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        project = self.get_object()
        # Only the project creator can delete the project entirely
        if project.creator != request.user:
            raise PermissionDenied("Only the project creator can delete this project.")
        return super().destroy(request, *args, **kwargs)


class ProjectMembersAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectMemberBulkSerializer

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        project = get_object_or_404(_user_projects(self.request.user), id=project_id)
        return ProjectMember.objects.filter(
            project=project
        ).select_related('user', 'project')

    def get_serializer(self, *args, **kwargs):
        kwargs['many'] = True
        kwargs['context'] = self.get_serializer_context()
        return super().get_serializer(*args, **kwargs)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        project = get_object_or_404(_user_projects(self.request.user), id=self.kwargs['project_id'])
        context['project'] = project
        return context

    def perform_create(self, serializer):
        project = get_object_or_404(_user_projects(self.request.user), id=self.kwargs['project_id'])
        _require_project_admin(project, self.request.user)

        # Validate that none of the members being added are already in the project
        member_list = serializer.validated_data
        for item in member_list:
            member_id = item.get('member_id')
            if ProjectMember.objects.filter(project=project, user_id=member_id).exists():
                from rest_framework.serializers import ValidationError
                raise ValidationError({
                    "member_id": "This user is already a member of the project."
                })

        serializer.save()


class ProjectMemberActionAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectMemberSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "member_id"

    def get_queryset(self):
        return ProjectMember.objects.filter(
            Q(project__creator=self.request.user) | Q(project__members=self.request.user)
        ).distinct().select_related('user', 'project')

    def perform_update(self, serializer):
        project_member = self.get_object()
        project = project_member.project

        _require_project_admin(project, self.request.user)

        # The project creator's role cannot be downgraded/modified
        if project_member.user == project.creator:
            raise PermissionDenied("The role of the project creator cannot be modified.")

        serializer.save()

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        project_member = self.get_object()
        user = project_member.user
        project = project_member.project

        # Only project admins can remove members, unless a user is removing themselves (leaving)
        if request.user != user:
            _require_project_admin(project, request.user)

        # The project creator cannot leave or be removed from the project
        if user == project.creator:
            raise PermissionDenied("The project creator cannot be removed or leave the project.")

        Task.objects.filter(project=project, creator=user).delete()

        for task in Task.objects.filter(project=project, assignees=user):
            task.assignees.remove(user)

        Subtask.objects.filter(
            task__project=project,
            assignee=user
        ).update(assignee=None, is_completed=False)

        # Iterate so each Asset.delete() fires and removes the physical file
        for asset in Asset.objects.filter(uploaded_by=user).filter(
            Q(project=project) | Q(task__project=project)
        ):
            asset.delete()

        project_member.delete()

        return Response(
            {"detail": "Project member removed successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
