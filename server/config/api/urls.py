from django.urls import path
from .views import TaskAPIView, TaskDetailAPIView, SubtasksApiView, SubtaskActionAPIView, SearchTaskAssigneesAPIView, AddAssigneeAPIView, RemoveAssigneeAPIView

urlpatterns = [
    path('tasks/', TaskAPIView.as_view(), name='task-list-create'),
    path('tasks/<uuid:pk>/', TaskDetailAPIView.as_view(), name='task-detail'),
    path('tasks/<uuid:parent_task_id>/subtasks/', SubtasksApiView.as_view(), name='subtask-list-create'),
    path('tasks/<uuid:parent_task_id>/subtasks/<uuid:pk>/', SubtaskActionAPIView.as_view(), name='subtask-detail'),
    path('projects/<uuid:project_id>/search-assignees/', SearchTaskAssigneesAPIView.as_view(), name='search-task-assignees'),
    path('tasks/<uuid:task_id>/assignees/', AddAssigneeAPIView.as_view(), name='add-remove-assignee'),
    path('tasks/<uuid:task_id>/assignees/<uuid:assignee_id>/', RemoveAssigneeAPIView.as_view(), name='remove-assignee'),
]