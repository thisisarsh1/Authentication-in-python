# Generated by Django 4.2.6 on 2025-03-01 07:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0003_delete_certificate'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdetails',
            name='template',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
