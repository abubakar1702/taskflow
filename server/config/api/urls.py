from django.urls import path
from .views import TaskAPIView, TaskDetailAPIView

urlpatterns = [
    path('tasks/', TaskAPIView.as_view(), name='task-list-create'),
    path('tasks/<uuid:pk>/', TaskDetailAPIView.as_view(), name='task-detail'),
]