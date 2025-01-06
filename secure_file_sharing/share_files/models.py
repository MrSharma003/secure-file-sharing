from django.conf import settings
from django.utils.timezone import now
from django.db import models

class FilePermission(models.Model):
    VIEW = 'view'
    DOWNLOAD = 'download'

    PERMISSION_CHOICES = [
        (VIEW, 'View'),
        (DOWNLOAD, 'Download'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.ForeignKey(settings.FILE, on_delete=models.CASCADE, related_name='permissions')
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES)
    token = models.CharField(max_length=64, null=True, blank=True)
    expiration = models.DateTimeField(null=True, blank=True)

    def is_expired(self):
        return self.expiration and self.expiration < now()

    def __str__(self):
        return f"{self.user} - {self.file} - {self.permission}"
