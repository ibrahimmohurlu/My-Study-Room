# Generated by Django 4.1 on 2022-09-12 12:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='roommember',
            name='check_status',
            field=models.BooleanField(default=False),
        ),
    ]
