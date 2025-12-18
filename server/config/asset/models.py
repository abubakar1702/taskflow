from django.db import models
from user.models import User
import uuid
from .validators import validate_file_size

class Asset(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='assets/', validators=[validate_file_size])
    task = models.ForeignKey('task.Task', on_delete=models.CASCADE, null=True, blank=True, related_name='assets')
    project = models.ForeignKey('project.Project', on_delete=models.CASCADE, null=True, blank=True, related_name='assets')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_assets')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def delete(self, *args, **kwargs):
        if self.file:
            self.file.delete(save=False)
        super().delete(*args, **kwargs)

    class Meta:
        db_table = 'api_asset'
