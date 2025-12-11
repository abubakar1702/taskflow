from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.permissions import BasePermission



def validate_file_size(file):
    max_size = 50 * 1024 * 1024  # 50MB in bytes
    if file.size > max_size:
        raise ValidationError(f'File size cannot exceed 50MB. Current size: {file.size / 1024 / 1024:.1f}MB')

def validate_file_type(file):
    allowed_extensions = [
        'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt',
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico',
        'xls', 'xlsx', 'csv', 'ods',
        'ppt', 'pptx', 'odp',
        'zip', 'rar', '7z', 'tar', 'gz',
        'py', 'js', 'html', 'css', 'json', 'xml', 'yml', 'yaml',
    ]
    
    if file.name:
        extension = file.name.split('.')[-1].lower()
        if extension not in allowed_extensions:
            raise ValidationError(f'File type "{extension}" is not allowed.')