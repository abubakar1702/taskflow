from django.urls import path
from .views import (
    NoteListCreateAPIView,
    NoteDetailAPIView,
    PinnedNoteListAPIView,
    NoteSearchAPIView,
)

urlpatterns = [
    path('notes/', NoteListCreateAPIView.as_view(), name='note-list-create'),
    path('notes/<uuid:pk>/', NoteDetailAPIView.as_view(), name='note-detail'),
    path('notes/pinned/', PinnedNoteListAPIView.as_view(), name='pinned-note-list'),
    path('notes/search/', NoteSearchAPIView.as_view(), name='note-search'),
]