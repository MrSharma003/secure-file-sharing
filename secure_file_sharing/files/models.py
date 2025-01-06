from django.db import models
from django.conf import settings
from django.utils.timezone import now

class File(models.Model):
    title = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='files')
    encrypted_file = models.FileField(upload_to='encrypted_files/')
    uploaded_at = models.DateTimeField(default=now())

    def __str__(self):
        return self.title
