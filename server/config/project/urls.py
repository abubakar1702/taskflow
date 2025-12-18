from django.urls import path
from .views import ProjectsAPIView, ProjectDetailAPIView, ProjectMembersAPIView, ProjectMemberActionAPIView

urlpatterns = [
    path('projects/', ProjectsAPIView.as_view(), name='project-list-create'),
    path('projects/<uuid:pk>/', ProjectDetailAPIView.as_view(), name='project-detail'),
    path('projects/<uuid:project_id>/members/', ProjectMembersAPIView.as_view(), name='project-members'),
    path('projects/<uuid:project_id>/members/<uuid:member_id>/', ProjectMemberActionAPIView.as_view(), name='project-member-action'),
]
