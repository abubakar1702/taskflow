from django.urls import path
from .views import TeamAPIView, SearchAPIView

urlpatterns = [
    path('team/', TeamAPIView.as_view(), name='team-list'),
    path('search/', SearchAPIView.as_view(), name='search-tasks-projects'),
]
