from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Asset
from .serializers import AssetSerializer

class AssetCreateAPIView(generics.CreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

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
