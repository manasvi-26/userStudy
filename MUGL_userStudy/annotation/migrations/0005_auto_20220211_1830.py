# Generated by Django 3.2.6 on 2022-02-11 18:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('annotation', '0004_actionfiles_person'),
    ]

    operations = [
        migrations.RenameField(
            model_name='actionfiles',
            old_name='path',
            new_name='rotationPath',
        ),
        migrations.AddField(
            model_name='actionfiles',
            name='translationPath',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
    ]