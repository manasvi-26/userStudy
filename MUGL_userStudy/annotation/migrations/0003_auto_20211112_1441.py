# Generated by Django 3.2.6 on 2021-11-12 14:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('annotation', '0002_auto_20211102_1812'),
    ]

    operations = [
        migrations.RenameField(
            model_name='guess3',
            old_name='rank1',
            new_name='rank',
        ),
        migrations.RemoveField(
            model_name='guess',
            name='file',
        ),
        migrations.RemoveField(
            model_name='guess3',
            name='rank2',
        ),
        migrations.RemoveField(
            model_name='guess3',
            name='rank3',
        ),
        migrations.RemoveField(
            model_name='guess3',
            name='rank4',
        ),
        migrations.RemoveField(
            model_name='guess3',
            name='rank5',
        ),
        migrations.AddField(
            model_name='actionfiles',
            name='modelName',
            field=models.CharField(default='MUGL', max_length=200),
        ),
        migrations.AddField(
            model_name='guess1',
            name='file',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to='annotation.actionfiles'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='guess2',
            name='file',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to='annotation.actionfiles'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='guess3',
            name='files',
            field=models.ManyToManyField(to='annotation.ActionFiles'),
        ),
        migrations.AddField(
            model_name='questionset',
            name='round2_files',
            field=models.ManyToManyField(related_name='round2', to='annotation.ActionFiles'),
        ),
        migrations.AddField(
            model_name='questionset',
            name='round3_files',
            field=models.ManyToManyField(related_name='round3', to='annotation.ActionFiles'),
        ),
        migrations.AlterField(
            model_name='questionset',
            name='round1_files',
            field=models.ManyToManyField(related_name='round1', to='annotation.ActionFiles'),
        ),
    ]
