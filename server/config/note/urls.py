from django.urls import path
from .views import (
    NoteListCreateAPIView,
    NoteDetailAPIView,
    PinnedNoteListAPIView
)

urlpatterns = [
    # Note CRUD endpoints
    path('notes/', NoteListCreateAPIView.as_view(), name='note-list-create'),
    path('notes/<uuid:pk>/', NoteDetailAPIView.as_view(), name='note-detail'),
    
    # Pinned notes list
    path('notes/pinned/', PinnedNoteListAPIView.as_view(), name='pinned-note-list'),
]