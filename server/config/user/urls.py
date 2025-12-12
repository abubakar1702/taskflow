from django.urls import path
from .views import RegisterAPIView, LoginAPIView, SearchUsersAPIView, CurrentUserAPIView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('search/', SearchUsersAPIView.as_view(), name='user-search'),
    path('me/', CurrentUserAPIView.as_view(), name='current-user'),
    
]