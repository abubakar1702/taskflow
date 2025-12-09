from django.urls import path
from .views import TaskAPIView, TaskDetailAPIView, SubtasksApiView, SubtaskActionAPIView, AddAssigneeAPIView, RemoveAssigneeAPIView, SearchForAssigneeAPIView

urlpatterns = [
    path('tasks/', TaskAPIView.as_view(), name='task-list-create'),
    path('tasks/<uuid:pk>/', TaskDetailAPIView.as_view(), name='task-detail'),
    path('tasks/<uuid:parent_task_id>/subtasks/', SubtasksApiView.as_view(), name='subtask-list-create'),
    path('tasks/<uuid:parent_task_id>/subtasks/<uuid:pk>/', SubtaskActionAPIView.as_view(), name='subtask-detail'),
    path('tasks/<uuid:task_id>/assignees/', AddAssigneeAPIView.as_view(), name='add-remove-assignee'),
    path('tasks/<uuid:task_id>/assignees/<uuid:assignee_id>/', RemoveAssigneeAPIView.as_view(), name='remove-assignee'),
    path('search-assignees/', SearchForAssigneeAPIView.as_view(), name='search-for-assignee'),
]