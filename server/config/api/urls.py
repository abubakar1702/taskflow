from django.urls import path
from .views import TaskAPIView, TaskDetailAPIView, SubtasksApiView, SubtaskActionAPIView, AddAssigneeAPIView, RemoveAssigneeAPIView, SearchForAssigneeAPIView, AssetCreateAPIView, AssetListAPIView, AssetDetailAPIView, TaskAssetsAPIView, ProjectAssetsAPIView, AssetActionAPIView, LeaveTaskAPIView, ProjectsAPIView, ProjectDetailAPIView, ProjectMembersAPIView, ProjectMemberActionAPIView

urlpatterns = [
    path('tasks/', TaskAPIView.as_view(), name='task-list-create'),
    path('tasks/<uuid:pk>/', TaskDetailAPIView.as_view(), name='task-detail'),
    path('tasks/<uuid:parent_task_id>/subtasks/', SubtasksApiView.as_view(), name='subtask-list-create'),
    path('tasks/<uuid:parent_task_id>/subtasks/<uuid:pk>/', SubtaskActionAPIView.as_view(), name='subtask-detail'),
    path('tasks/<uuid:task_id>/assignees/', AddAssigneeAPIView.as_view(), name='add-remove-assignee'),
    path('tasks/<uuid:task_id>/assignees/<uuid:assignee_id>/', RemoveAssigneeAPIView.as_view(), name='remove-assignee'),
    path('search-assignees/', SearchForAssigneeAPIView.as_view(), name='search-for-assignee'),
    path('tasks/<uuid:task_id>/leave/', LeaveTaskAPIView.as_view(), name='leave-task'),
    
    path('assets/', AssetCreateAPIView.as_view(), name='asset-create'),
    path('assets/list/', AssetListAPIView.as_view(), name='asset-create'),
    path('assets/<uuid:pk>/', AssetDetailAPIView.as_view(), name='asset-detail'),
    path('tasks/<uuid:task>/assets/', TaskAssetsAPIView.as_view(), name='task-assets'),
    path('projects/<uuid:project>/assets/', ProjectAssetsAPIView.as_view(), name='project-assets'),
    path('assets/<uuid:id>/', AssetActionAPIView.as_view(), name='asset-detail'),
    
    path('projects/', ProjectsAPIView.as_view(), name='project-assets'),
    path('projects/<uuid:pk>/', ProjectDetailAPIView.as_view(), name='project-detail'),
    path('projects/<uuid:project_id>/members/', ProjectMembersAPIView.as_view(), name='project-members'),
    path('projects/<uuid:project_id>/members/<uuid:member_id>/', ProjectMemberActionAPIView.as_view(), name='project-member-action'),
]