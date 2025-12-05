from django.urls import path
from .views import TaskAPIView, TaskDetailAPIView, SubtasksApiView, SubtaskActionAPIView

urlpatterns = [
    path('tasks/', TaskAPIView.as_view(), name='task-list-create'),
    path('tasks/<uuid:pk>/', TaskDetailAPIView.as_view(), name='task-detail'),
    path('tasks/<uuid:parent_task_id>/subtasks/', SubtasksApiView.as_view(), name='subtask-list-create'),
    path('tasks/<uuid:parent_task_id>/subtasks/<uuid:pk>/', SubtaskActionAPIView.as_view(), name='subtask-detail'),
]