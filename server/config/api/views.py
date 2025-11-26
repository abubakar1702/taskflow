from django.shortcuts import render
from .serializers import ProjectSerializer, ProjectMemberSerializer, TaskSerializer
from .models import Project, ProjectMember, Task
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

class TaskAPIView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]