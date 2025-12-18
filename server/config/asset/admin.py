from django.contrib import admin
from .models import Asset

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ("file", "uploaded_by", "uploaded_at", "task", "project")
    search_fields = ("uploaded_by__username", "task__title", "project__title")
    list_filter = ("uploaded_at",)
