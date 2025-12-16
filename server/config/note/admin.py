from django.contrib import admin
from .models import Note


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'owner', 'is_pinned', 'created_at', 'updated_at')
    readonly_fields = ('id', 'created_at', 'updated_at') 
    search_fields = ('title', 'content', 'owner__username')
    list_filter = ('is_pinned', 'created_at', 'updated_at')
    ordering = ('-created_at',)