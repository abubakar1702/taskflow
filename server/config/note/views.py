from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Note
from .serializers import NoteSerializer
from django.db.models import Q


class NoteListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Note.objects.filter(owner=self.request.user)


class NoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    
    def get_queryset(self):
        return Note.objects.filter(owner=self.request.user)


class PinnedNoteListAPIView(generics.ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Note.objects.filter(owner=self.request.user, is_pinned=True)

class NoteSearchAPIView(generics.ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        return Note.objects.filter(
            owner=self.request.user
        ).filter(
            Q(title__icontains=query) | Q(content__icontains=query)
        )