# Generated by Django 5.1.4 on 2025-01-01 08:48

import datetime
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('files', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='file',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='file',
            name='is_published',
        ),
        migrations.RemoveField(
            model_name='file',
            name='shared_with',
        ),
        migrations.AddField(
            model_name='file',
            name='uploaded_at',
            field=models.DateTimeField(default=datetime.datetime(2025, 1, 1, 8, 48, 29, 229909, tzinfo=datetime.timezone.utc)),
        ),
        migrations.AlterField(
            model_name='file',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to=settings.AUTH_USER_MODEL),
        ),
    ]
