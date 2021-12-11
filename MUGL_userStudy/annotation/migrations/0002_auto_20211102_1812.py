# Generated by Django 3.2.6 on 2021-11-02 18:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0005_auto_20211102_1812'),
        ('annotation', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Guess2',
            fields=[
                ('guess_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='annotation.guess')),
                ('guess', models.CharField(default='', max_length=200)),
            ],
            bases=('annotation.guess',),
        ),
        migrations.RenameModel(
            old_name='Guess1_2',
            new_name='Guess1',
        ),
        migrations.AddField(
            model_name='guess',
            name='pending',
            field=models.BooleanField(default=True),
        ),
    ]
