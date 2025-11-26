from django.contrib import admin
from .models import Project, ProjectMember, Task, Subtask

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'created_at', 'updated_at')
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
    list_display = ('text', 'creator', 'task', 'is_completed', 'created_at', 'updated_at')
    list_filter = ('creator', 'task', 'is_completed', 'created_at', 'updated_at')
    search_fields = ('text', 'description')
    ordering = ('-created_at',)


