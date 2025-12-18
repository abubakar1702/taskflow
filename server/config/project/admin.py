from django.contrib import admin
from .models import Project, ProjectMember

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
