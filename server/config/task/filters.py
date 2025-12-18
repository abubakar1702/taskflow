import django_filters
from .models import Task
from project.models import Project
from django.utils.timezone import now

class TaskFilter(django_filters.FilterSet):
    priority = django_filters.CharFilter(field_name='priority', lookup_expr='iexact')
    status = django_filters.CharFilter(field_name='status', lookup_expr='iexact')
    creator = django_filters.UUIDFilter(field_name='creator')
    

    assigned_to_me = django_filters.BooleanFilter(method='filter_assigned_to_me')
    created_by_me = django_filters.BooleanFilter(method='filter_created_by_me')
    due_today = django_filters.BooleanFilter(method='filter_due_today')
    overdue = django_filters.BooleanFilter(method='filter_overdue')
    project_id = django_filters.UUIDFilter(field_name="project__id",method="filter_by_project")


    class Meta:
        model = Task
        fields = ['priority', 'status', 'creator', 'assigned_to_me', 'created_by_me', 'due_today', 'overdue', 'project_id']
        
    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)

    def filter_assigned_to_me(self, queryset, name, value):
        user = getattr(self.request, "user", None) if self.request else None
        if not user or not user.is_authenticated:
            return queryset
        if value is True:
            return queryset.filter(assignees=user).distinct()
        if value is False:
            return queryset.exclude(assignees=user)
        return queryset

    def filter_created_by_me(self, queryset, name, value):
        user = getattr(self.request, "user", None) if self.request else None
        if not user or not user.is_authenticated:
            return queryset
        if value is True:
            return queryset.filter(creator=user)
        if value is False:
            return queryset.exclude(creator=user)
        return queryset

    def filter_due_today(self, queryset, name, value):
        if value:
            today = now().date()
            return queryset.filter(due_date=today)
        if value is False:
            today = now().date()
            return queryset.exclude(due_date=today)
        return queryset

    def filter_overdue(self, queryset, name, value):
        if value:
            today = now().date()
            return queryset.filter(due_date__lt=today).exclude(status__iexact="Done")
        if value is False:
            today = now().date()
            return queryset.exclude(due_date__lt=today)
        return queryset
    
    def filter_by_project(self, queryset, name, value):
        return queryset.filter(project__id=value)
