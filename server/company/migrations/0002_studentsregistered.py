# Generated by Django 4.2.6 on 2025-02-20 03:06

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('company', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentsRegistered',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('registered_at', models.DateTimeField(auto_now_add=True)),
                ('is_selected', models.BooleanField(default=False)),
                ('internship', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='students_registered', to='company.internship')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='internships_registered', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'internship')},
            },
        ),
    ]
