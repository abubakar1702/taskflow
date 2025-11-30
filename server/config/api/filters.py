import django_filters
from .models import Task, Project
from django.utils.timezone import now

class TaskFilter(django_filters.FilterSet):
    priority = django_filters.CharFilter(field_name='priority', lookup_expr='iexact')
    status = django_filters.CharFilter(field_name='status', lookup_expr='iexact')
    creator = django_filters.UUIDFilter(field_name='creator')
    

    assigned_to_me = django_filters.BooleanFilter(method='filter_assigned_to_me')
    created_by_me = django_filters.BooleanFilter(method='filter_created_by_me')
    due_today = django_filters.BooleanFilter(method='filter_due_today')
    overdue = django_filters.BooleanFilter(method='filter_overdue')

    class Meta:
        model = Task
        fields = ['priority', 'status', 'creator']
        
    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)

    def filter_assigned_to_me(self, queryset, name, value):
        if value and getattr(self.request, "user", None) and self.request.user.is_authenticated:
            return queryset.filter(assignees=self.request.user).distinct()
        return queryset

    def filter_created_by_me(self, queryset, name, value):
        user = getattr(self.request, "user", None)
        if value is True and user and user.is_authenticated:
            return queryset.filter(creator=user)
        if value is False and user and user.is_authenticated:
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