from django.db import models
from user.models import User

# Create your models here.

class ActionFiles(models.Model):
    action = models.CharField(max_length=100)
    path = models.CharField(max_length=200)
    modelName = models.CharField(max_length=200,default="MUGL")

    option1 = models.CharField(max_length=100,default="option1")
    option2 = models.CharField(max_length=100,default="option2")
    option3 = models.CharField(max_length=100,default="option3")
    option4 = models.CharField(max_length=100,default="option4")

class QuestionSet(models.Model):

    round1_files = models.ManyToManyField(ActionFiles, related_name="round1")
    round2_files = models.ManyToManyField(ActionFiles, related_name="round2")
    round3_files = models.ManyToManyField(ActionFiles, related_name="round3")


class Guess(models.Model):

    pending = models.BooleanField(default=True)
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(auto_now=True)
    num_pause = models.IntegerField(default=0)
    num_replay = models.IntegerField(default=0)


class Guess1(Guess):
    file = models.ForeignKey(ActionFiles,on_delete=models.CASCADE)
    guess = models.CharField(max_length=200, default="")

class Guess2(Guess):
    file = models.ForeignKey(ActionFiles,on_delete=models.CASCADE)
    guess = models.CharField(max_length=200, default="")

class Guess3(Guess):
    files = models.ManyToManyField(ActionFiles)
    rank = models.CharField(max_length=200, default="")