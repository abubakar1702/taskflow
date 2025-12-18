from django.urls import path
from .views import NotificationListAPIView, MarkNotificationReadAPIView, DeleteNotificationAPIView, NotificationConsumer

urlpatterns = [
    path('notifications/', NotificationListAPIView.as_view(), name='notification-list'),
    path('notifications/<uuid:pk>/read/', MarkNotificationReadAPIView.as_view(), name='mark-notification-read'),
    path('notifications/<uuid:pk>/delete/', DeleteNotificationAPIView.as_view(), name='delete-notification'),
    path('ws/notifications/', NotificationConsumer.as_asgi(), name='notifications'),
]
