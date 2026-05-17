from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied

from .models import Asset
from .serializers import AssetSerializer


def _asset_queryset_for_user(user):
    """
    Return assets visible to the given user:
    assets they uploaded, OR belong to a task/project they're involved in.
    """
    return Asset.objects.filter(
        Q(uploaded_by=user) |
        Q(task__creator=user) |
        Q(task__assignees=user) |
        Q(project__creator=user) |
        Q(project__members=user)
    ).distinct().select_related('uploaded_by', 'task', 'project')


class AssetCreateAPIView(generics.CreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class AssetListAPIView(generics.ListAPIView):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = _asset_queryset_for_user(user)

        task_id = self.request.query_params.get("task")
        project_id = self.request.query_params.get("project")

        if task_id:
            queryset = queryset.filter(task_id=task_id)
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset


class AssetDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        asset = get_object_or_404(Asset, id=self.kwargs['pk'])
        # Only the uploader may modify or delete the asset
        if asset.uploaded_by != self.request.user:
            raise PermissionDenied("You do not have permission to access this asset.")
        return asset

    def destroy(self, request, *args, **kwargs):
        # Delegate entirely to the model's delete() which handles the file cleanup.
        # Do NOT call asset.file.delete() here — that would cause a double-delete.
        asset = self.get_object()
        asset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TaskAssetsAPIView(generics.ListCreateAPIView):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs.get('task')
        return _asset_queryset_for_user(self.request.user).filter(task_id=task_id)

    def perform_create(self, serializer):
        serializer.save(
            task_id=self.kwargs.get('task'),
            uploaded_by=self.request.user
        )


class ProjectAssetsAPIView(generics.ListCreateAPIView):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project')
        return _asset_queryset_for_user(self.request.user).filter(project_id=project_id)

    def perform_create(self, serializer):
        serializer.save(
            project_id=self.kwargs.get('project'),
            uploaded_by=self.request.user
        )


class AssetActionAPIView(generics.RetrieveDestroyAPIView):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_object(self):
        asset = get_object_or_404(Asset, id=self.kwargs['id'])
        if asset.uploaded_by != self.request.user:
            raise PermissionDenied("You do not have permission to access this asset.")
        return asset

    def destroy(self, request, *args, **kwargs):
        asset = self.get_object()
        asset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
