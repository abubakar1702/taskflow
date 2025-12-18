from django.contrib import admin
from .models import Task, Subtask, ImportantTask

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'project', 'status', 'priority', 'due_date', 'created_at')
    list_filter = ('status', 'priority', 'created_at', 'due_date')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)

@admin.register(Subtask)
class SubtaskAdmin(admin.ModelAdmin):
    list_display = ('text', 'task', 'assignee', 'is_completed', 'created_at')
    list_filter = ('is_completed', 'created_at')
    search_fields = ('text', 'description')
    ordering = ('-created_at',)
    
@admin.register(ImportantTask)
class ImportantTaskAdmin(admin.ModelAdmin):
    list_display = ('user', 'task', 'marked_at')
    list_filter = ('marked_at',)
    search_fields = ('user__username', 'task__title')
    ordering = ('-marked_at',)
