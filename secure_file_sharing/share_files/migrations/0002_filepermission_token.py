# Generated by Django 5.1.4 on 2025-01-01 18:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('share_files', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='filepermission',
            name='token',
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
    ]