# Generated by Django 3.2.22 on 2023-10-07 16:41
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0006_auto_20231007_1924"),
    ]

    operations = [
        migrations.RenameField(
            model_name="project",
            old_name="assignee_id",
            new_name="assignee",
        ),
        migrations.RenameField(
            model_name="project",
            old_name="owner_id",
            new_name="owner",
        ),
    ]