from django.contrib import admin
from .models import Project, ProjectMember, Task, Subtask, Asset, ImportantTask

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id','name', 'creator', 'created_at', 'updated_at')
    list_filter = ('creator', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    ordering = ('-created_at',) 

@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ('project', 'user', 'role', 'created_at', 'updated_at')
    list_filter = ('project', 'user', 'role', 'created_at', 'updated_at')
    search_fields = ('project__name', 'user__username')
    ordering = ('-created_at',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'project', 'status', 'priority', 'created_at', 'updated_at')
    list_filter = ('creator', 'project', 'status', 'priority', 'created_at', 'updated_at')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)

@admin.register(Subtask)
class SubtaskAdmin(admin.ModelAdmin):
    list_display = ('text', 'task', 'is_completed', 'created_at', 'updated_at')
    list_filter = ('task', 'is_completed', 'created_at', 'updated_at')
    search_fields = ('text', 'description')
    ordering = ('-created_at',)
    
@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ("file", "uploaded_by", "uploaded_at", "task", "project")
    search_fields = ("uploaded_by__username", "task__title", "project__title")
    list_filter = ("uploaded_at",)
    
@admin.register(ImportantTask)
class ImportantTaskAdmin(admin.ModelAdmin):
    list_display = ('user', 'task', 'marked_at')
    list_filter = ('user', 'marked_at')
    search_fields = ('user__username', 'task__title')
    ordering = ('-marked_at',)


