from django.urls import path
from .views import (
    AssetCreateAPIView, AssetListAPIView, AssetDetailAPIView,
    TaskAssetsAPIView, ProjectAssetsAPIView, AssetActionAPIView
)

urlpatterns = [
    path('assets/', AssetCreateAPIView.as_view(), name='asset-create'),
    path('assets/list/', AssetListAPIView.as_view(), name='asset-list'),
    path('assets/<uuid:pk>/', AssetDetailAPIView.as_view(), name='asset-detail'),
    path('tasks/<uuid:task>/assets/', TaskAssetsAPIView.as_view(), name='task-assets'),
    path('projects/<uuid:project>/assets/', ProjectAssetsAPIView.as_view(), name='project-assets'),
    path('assets/action/<uuid:id>/', AssetActionAPIView.as_view(), name='asset-action'),
]
